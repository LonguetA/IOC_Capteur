
#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ToneESP32.h>

#define BUZZER_PIN 17
#define BUZZER_CHANNEL 0

ToneESP32 buzzer(BUZZER_PIN, BUZZER_CHANNEL);

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     16 // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

//Constantes pour se connecter au wifi
const char* ssid = "";
const char* password = "";


// Informations concernant le broker MQTT 
// Adresse ip du broker
const char* mqtt_server = "";


// Topic MQTT a ecouter
const char* mqtt_topic = "esp1/led";
const char* mqtt_topic2 = "esp1/lcd";

// Wifi client
WiFiClient espClient;
PubSubClient client(espClient);


//Fonction TIMER 
#define MAX_WAIT_FOR_TIMER 9
unsigned int waitFor(int timer, unsigned long period){
  static unsigned long waitForTimer[MAX_WAIT_FOR_TIMER];  // il y a autant de timers que de tâches périodiques
  unsigned long newTime = micros() / period;              // numéro de la période modulo 2^32 
  int delta = newTime - waitForTimer[timer];              // delta entre la période courante et celle enregistrée
  if ( delta < 0 ) delta = 1 + newTime;                   // en cas de dépassement du nombre de périodes possibles sur 2^32 
  if ( delta ) waitForTimer[timer] = newTime;             // enregistrement du nouveau numéro de période
  return delta;
}

//Structure pour mailBox
enum {EMPTY, FULL};

struct mailbox_s {
  int state;
  int val;
};

//--------- définition de la tache LUM

struct Lum_s {
  int timer;                                              // numéro du timer pour cette tâche utilisé par WaitFor
  unsigned long period;                                   // periode de clignotement
  int pin;
}; 

//Setup de la fonction qui va permettre de lire la valeur de la luminosite 
void setup_Lum( struct Lum_s * ctx, int timer,unsigned long period, byte pin) {
  ctx->timer = timer;
  ctx->period = period;
  ctx->pin = pin;
  pinMode(pin,INPUT);
}

void loop_Lum( struct Lum_s * ctx,struct mailbox_s * mbLUM) {
  //Si la periode ne c est pas encore ecoule
  if (!waitFor(ctx->timer, ctx->period)) return;  

  //Lecture de la valeur sur la photo-resistance
  unsigned int res = analogRead(ctx->pin);

  //Mapper la valeur afin de la convertir en pourcentage 
  res = map(res,0,4096,100,0);  

  if (mbLUM->state != EMPTY) {
    return;
  }

  mbLUM->val = res;
  mbLUM->state = FULL; 
}

//--------- définition de la tache MQTT

void loop_mqtt(struct mailbox_s * mbLUM){

  //Si aucune info de luminosite
  if (mbLUM->state == EMPTY) return;

  //Connection au BROKER
  if (!client.connected()) {
    reconnect();
  }
  
  //Loop du client
  client.loop();  

  //Valeur de lum à envoyer
  float lum = mbLUM->val; 
  
  //Conversion de la valeur en chaîne de caractères
  char tempString[8];
  dtostrf(lum, 5, 2, tempString); 

  char topic[50];
  snprintf(topic, 50, "esp1/lum");

  // Envoi de la donnée sur le topic 
  client.publish(topic, tempString); 

  //Vidage mailBOX
  mbLUM->state = EMPTY; 
}

// Fonction de gestion de la réception des messages
void callback(char* topic, byte* payload, unsigned int length) {

  // Convertir le message en une chaîne de caractères
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  // Afficher le message reçu
  Serial.println("Message recu : " + message);

  //Si LED ON
  if (message == "LED ON"){
    digitalWrite(LED_BUILTIN, HIGH);
  }

  //Si LED OFF
  if (message == "LED OFF"){
    digitalWrite(LED_BUILTIN, LOW);
  }

  //Message sur le LCD
  if (message[0] == 'L' && message[1] == 'C' && message[2] == 'D'){

    //Message special MARIO 
    if(message[4] == 'M'&& message[5] == 'A' && message[6] == 'R' &&  message[7] == 'I' && message[8] == '0'){
      mario();
    }

    //Setup Display
    display.clearDisplay();
    display.setTextSize(4);      // Normal 1:1 pixel scale
    display.setTextColor(WHITE); // Draw white text
    display.setCursor(0, 0);     // Start at top-left corner
    display.cp437(true);         // Use full 256 char 'Code Page 437' font
    
    //Print char sur le display
    for (int i = 4 ; i < length ; i++){
      display.write(message[i]);
    }

    //Affichage
    display.display();
  }
}
// Declaration des structures pour la luminosite 
struct Lum_s Lum1;
struct mailbox_s mbLUM = {.state = EMPTY};

//Setup global
void setup() {
  //Setup PIN LED
  pinMode(LED_BUILTIN, OUTPUT);

  //Setup SERIAL
  Wire.begin(4, 15);

  //Setup LCD
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3C for 128x32
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }
  display.display();


  Serial.begin(115200);

  //Setup WIFI
  setup_wifi();

  //Setup mqtt
  client.setServer(mqtt_server, 1883);

  //Set mqttCallback
  client.setCallback(callback);

  //Setup LUM
  setup_Lum(&Lum1,5,5000000,A0);
}

//Loop global
void loop() {
  loop_mqtt(&mbLUM);
  loop_Lum(&Lum1,&mbLUM);       
}


//Fonction qui va permettre de se connecter au wifi 
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

}

//Fonction qui permet de se connecter au broker MQTT
void reconnect() {
  // attendre que le client se connecte 
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");

    //Test si le client a pu se connecter en tant que ESP32Client2
    if (client.connect("ESP32Client1")) {
      //Subscribe aux Topics
      client.subscribe(mqtt_topic);
      client.subscribe(mqtt_topic2);
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      //Affichage de l'etat du client afin d'identfier le probleme
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}


//La fonction qui joue une note sur le BUZZER
void beep( int note, int duree ) {                   
  buzzer.tone(note, duree);       
  delay(duree*0.4);
}

//Liste des notes pour la musique MARIO
void mario() {
  beep(NOTE_E7, 120);
  beep(NOTE_E7, 120);
  delay(120);  
  beep(NOTE_E7, 120);
  delay(120);  
  beep(NOTE_C7, 120);
  beep(NOTE_E7, 120);
  delay(120);  
  beep(NOTE_G7, 120);
  delay(240);    
  beep(NOTE_G6, 120);
  delay(360); 
  beep(NOTE_C7, 120);
  delay(240); 
  beep(NOTE_G6, 120);
  delay(240);  
  beep(NOTE_E6, 120);
  delay(240);    
  beep(NOTE_A6, 120);
  delay(120);  
  beep(NOTE_B6, 120);
  delay(120);  
  beep(NOTE_AS6, 120);
  beep(NOTE_A6, 120);
  delay(120); 
  beep(NOTE_G6, 90);
  beep(NOTE_E7, 90);
  beep(NOTE_G7, 90);
  beep(NOTE_A7, 120);
  delay(120);  
  beep(NOTE_F7, 120);
  beep(NOTE_G7, 120);
  delay(120);  
  beep(NOTE_E7, 120);
  delay(120);  
  beep(NOTE_C7, 120);
  beep(NOTE_D7, 120);
  beep(NOTE_B6, 120);
  delay(240);  
  beep(NOTE_C7, 120);
  delay(240);  
  beep(NOTE_G6, 120);
  delay(240);    
  beep(NOTE_E6, 120);
  delay(240);     
  beep(NOTE_A6, 120);
  delay(120);  
  beep(NOTE_B6, 120);
  delay(120);  
  beep(NOTE_AS6, 120);
  beep(NOTE_A6, 120);
  delay(120); 
  beep(NOTE_G6, 90);
  beep(NOTE_E7, 90);
  beep(NOTE_G7, 90);
  beep(NOTE_A7, 120);
  delay(120);  
  beep(NOTE_F7, 120);
  beep(NOTE_G7, 120);
  delay(120);  
  beep(NOTE_E7, 120);
  delay(120);  
  beep(NOTE_C7, 120);
  beep(NOTE_D7, 120);
  beep(NOTE_B6, 120);
  delay(240);  
  beep(NOTE_C4, 120);
  beep(NOTE_C5, 120);
  beep(NOTE_A3, 120);
  beep(NOTE_A4, 120);
  beep(NOTE_AS3, 120);
  beep(NOTE_AS4, 120);
  delay(90);    
  beep(NOTE_C4, 120);
  beep(NOTE_C5, 120);
  beep(NOTE_A3, 120);
  beep(NOTE_A4, 120);
  beep(NOTE_AS3, 120);
  beep(NOTE_AS4, 120);
  delay(90);    
  beep(NOTE_F3, 120);
  beep(NOTE_F4, 120);
  beep(NOTE_D3, 120);
  beep(NOTE_D4, 120);
  beep(NOTE_DS3, 120);
  beep(NOTE_DS4, 120);
  delay(90);   
  beep(NOTE_F3, 120);
  beep(NOTE_F4, 120);
  beep(NOTE_D3, 120);
  beep(NOTE_D4, 120);
  beep(NOTE_DS3, 120);
  beep(NOTE_DS4, 120);
  delay(120);    
  beep(NOTE_DS4, 180);
  beep(NOTE_CS4, 180);
  beep(NOTE_D4, 180);
  beep(NOTE_CS4, 60);
  beep(NOTE_DS4, 60);
  beep(NOTE_DS4, 60);
  beep(NOTE_GS3, 60);
  beep(NOTE_G3, 60);
  beep(NOTE_CS4, 60);
  beep(NOTE_C4, 180);
  beep(NOTE_FS4, 180);
  beep(NOTE_F4, 180);
  beep(NOTE_E3, 180);
  beep(NOTE_AS4, 180);
  beep(NOTE_A4, 180);
  beep(NOTE_GS4, 100);
  beep(NOTE_DS4, 100);
  beep(NOTE_B3, 100);
  beep(NOTE_AS3, 100);
  beep(NOTE_A3, 100);
  beep(NOTE_GS3, 100);
  delay(90);  
}
