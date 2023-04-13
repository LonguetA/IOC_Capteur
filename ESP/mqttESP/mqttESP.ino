
#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     16 // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

//"CroozBossChroma1908@"
const char* ssid = "Iphone de Axel";
const char* password = "CroozBossChroma1908@";
const char* mqtt_server = "172.20.10.5";
const char* mqtt_topic = "esp1/led";
const char* mqtt_topic2 = "esp1/lcd";

WiFiClient espClient;
PubSubClient client(espClient);



#define MAX_WAIT_FOR_TIMER 9
unsigned int waitFor(int timer, unsigned long period){
  static unsigned long waitForTimer[MAX_WAIT_FOR_TIMER];  // il y a autant de timers que de tâches périodiques
  unsigned long newTime = micros() / period;              // numéro de la période modulo 2^32 
  int delta = newTime - waitForTimer[timer];              // delta entre la période courante et celle enregistrée
  if ( delta < 0 ) delta = 1 + newTime;                   // en cas de dépassement du nombre de périodes possibles sur 2^32 
  if ( delta ) waitForTimer[timer] = newTime;             // enregistrement du nouveau numéro de période
  return delta;
}

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

void setup_Lum( struct Lum_s * ctx, int timer,unsigned long period, byte pin) {
  ctx->timer = timer;
  ctx->period = period;
  ctx->pin = pin;
  pinMode(pin,INPUT);
}

void loop_Lum( struct Lum_s * ctx,struct mailbox_s * mbLUM) {
  if (!waitFor(ctx->timer, ctx->period)) return;  

  unsigned int res = analogRead(ctx->pin);                       // Lecture
  res = map(res,0,4096,100,0);

  if (mbLUM->state != EMPTY) {
    return;
  }
  mbLUM->val = res;
  mbLUM->state = FULL; 
}

//--------- définition de la tache MQTT

void loop_mqtt(struct mailbox_s * mbLUM){

  if (mbLUM->state == EMPTY) return;

  if (!client.connected()) {
    reconnect();
  }
  client.loop();  

  float lum = mbLUM->val; // Valeur de lum à envoyer
  char tempString[8];
  dtostrf(lum, 5, 2, tempString); // Conversion de la valeur en chaîne de caractères

  char topic[50];
  snprintf(topic, 50, "esp1/lum");

  client.publish(topic, tempString); // Envoi de la donnée sur le topic 

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

  if (message == "LED ON"){
    digitalWrite(LED_BUILTIN, HIGH);
  }
  if (message == "LED OFF"){
    digitalWrite(LED_BUILTIN, LOW);
  }

  if (message[0] == 'L' && message[1] == 'C' && message[2] == 'D'){
    display.clearDisplay();
    display.setTextSize(4);      // Normal 1:1 pixel scale
    display.setTextColor(WHITE); // Draw white text
    display.setCursor(0, 0);     // Start at top-left corner
    display.cp437(true);         // Use full 256 char 'Code Page 437' font
    
    for (int i = 4 ; i < length ; i++){
      display.write(message[i]);
    }
    display.display();
  }
}

struct Lum_s Lum1;
struct mailbox_s mbLUM = {.state = EMPTY};

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  Wire.begin(4, 15);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3C for 128x32
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }
  display.display();


  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  setup_Lum(&Lum1,5,5000000,A0);
}


void loop() {
  loop_mqtt(&mbLUM);
  loop_Lum(&Lum1,&mbLUM);       
}

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

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
        client.subscribe(mqtt_topic);
        client.subscribe(mqtt_topic2);
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}