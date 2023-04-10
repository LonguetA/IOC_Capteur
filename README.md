# ioc PROJET

## ESP32 : 

On définit tous d'abord des constantes pour notre réseaux wifi pour que notre esp32 puisse se connecter dessus : 

```ino
const char* ssid = "";
const char* password = "";
```

On définit ensuite les informations concernant notre broker MQT
```ìno 
//Adresse IP du broker
const char* mqtt_server = "192.168.1.146";

//Topic MQTT a ecouter
const char* mqtt_topic = "esp1/led";
```

On utilise WiFiClient qui est une classe de la bibliothèque WiFi de Arduino pour que notre esp32 se connecte a notre Broker via TCP/IP

On utilise aussi PubSubClient afin de publier ou de s'abonner à des messages sur un broker MQTT
```ìno
WiFiClient espClient;
PubSubClient client(espClient);
```

On utilise ensuite la gestion des timers de la même façons que dans le TP5

```ino
#define MAX_WAIT_FOR_TIMER 9

unsigned int waitFor(int timer, unsigned long period){
  static unsigned long waitForTimer[MAX_WAIT_FOR_TIMER];  // il y a autant de timers que de tâches périodiques
  unsigned long newTime = micros() / period;              // numéro de la période modulo 2^32 
  int delta = newTime - waitForTimer[timer];              // delta entre la période courante et celle enregistrée
  if ( delta < 0 ) delta = 1 + newTime;                   // en cas de dépassement du nombre de périodes possibles sur 2^32 
  if ( delta ) waitForTimer[timer] = newTime;             // enregistrement du nouveau numéro de période
  return delta;
}
```

Pour que notre tache LUM puisse communiquer avec l'envoie de requete MQTT, on utilise la meme structure de boite aux lettres que pour le TP5 : 

```ino
enum {EMPTY, FULL};

struct mailbox_s {
  int state;
  int val;
};
```

De meme, on utilise la meme tache LUM que dans le TP5 : 

```ino
//--------- définition de la tache LUM

struct Lum_s {
  int timer;                                              // numéro du timer pour cette tâche utilisé par WaitFor
  unsigned long period;                                   // periode de clignotement
  int pin;
}; 
```

On définit maintenant une nouvelle tache MQTT qui va gérer le publish et le subscribe vers notre Broker : 

```ino
//--------- définition de la tache MQTT

void loop_mqtt(struct mailbox_s * mbLUM)
```

Si notre boite au lettres provenant de LUM est vide, on quitte notre fonction 

```ino
  if (mbLUM->state == EMPTY) return;
```

Si nous ne somme plus connecté au broker : 

```ino
  if (!client.connected()) {
    reconnect();
  }
```

On se subsribe ensuite au topic depuis lequel on ve recevoir nos informations (ici la mise à jour de la LED)
```ino
  client.subscribe(mqtt_topic);
```

On récupere ensuite la valeur de notre LUM puis on la convertie pour pouvoir l'envoyer.
On utilise dtostrf qui permet de convertir un float en une chaîne de caractères.

```ino
  float lum = mbLUM->val; // Valeur de lum à envoyer
  char tempString[8];
  dtostrf(temperature, 5, 2, tempString); // Conversion de la valeur en chaîne de caractères

  char topic[50];
  snprintf(topic, 50, "esp1/lum");
```

Pour finir, on envoit nore valeur grâce à publish, en présisant le topic sur lequel on envoie cette valeur

```ino
  client.publish(topic, tempString); // Envoi de la donnée sur le topic 
  mbLUM->state = EMPTY; 
```

On définit maintenant une fonction callback qui sera appelée lorsque l'on récevera un message sur le topic sur lequel nous nous sommes inscrit : 

```ino
// Fonction de gestion de la réception des messages
void callback(char* topic, byte* payload, unsigned int length) 
```

On convertie tout d'abord notre payload en chaine de caractere : 

```ino
  // Convertir le message en une chaîne de caractères
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  // Afficher le message reçu
  Serial.println("Message recu : " + message);
```

Ensuite, en fonction de la valeur de ce message, on allume ou non notre LED : 

```ino
  if (message == "LED ON"){
    digitalWrite(LED_BUILTIN, HIGH);
  }
  if (message == "LED OFF"){
    digitalWrite(LED_BUILTIN, LOW);
  }
 ```

On effectue ensuite notre setup : 

On place la pin de notre LED en sortie : 

```ino
pinMode(LED_BUILTIN, OUTPUT);
```

On configure notre communication SERIAL : 

```ino
Serial.begin(115200);
```

On se connecte au WIFI : 

```ino
setup_wifi();
```

On setup ensuite notre BROKER ainsi que notre fonction de callback : 

```ino
client.setServer(mqtt_server, 1883);
client.setCallback(callback);
```

Enfin, on setup notre tache LUM 

```ino
setup_Lum(&Lum1,5,5000000,A0);
```

Dans notre loop, on execute la loop MQTT et LUM : 

```ino 
void loop() {
  loop_mqtt(&mbLUM);
  loop_Lum(&Lum1,&mbLUM);       
}
```

Dans la fonction setup_wifi, nous nous connectons au wifi : 

```ino
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
```

Dans la fonction reconnect, c'est au broker que nous nous connectons : 

```ino
if (client.connect("ESP32Client")) {
    Serial.println("connected");
} 
```

## Broker MQTT : 

Pour notre broker MQTT, nous utilisons Mosquitto 

### Fichier de Config :
Pour que notre broker fonctionne, il faut définir un fichier de config dans le fichier : /etc/mosquitto/mosquitto.conf 

```txt 
# Place your local configuration in /etc/mosquitto/conf.d/
#
# A full description of the configuration file is at
# /usr/share/doc/mosquitto/examples/mosquitto.conf.example

# Connexion possible pour tout le monde
allow_anonymous true

# Fichier mot de passe
password_file /etc/mosquitto/pwfile

# Port du BROKER 
listener 1883
```

### Démarrer notre BROKER : 

Pour démarrer notre BROKER, on lance la commande suivante : 

```shell
mosquitto -c /etc/mosquitto/mosquitto.conf 
```

On donne en argument de cette commande le fichier de config dénfinit précédement?

## Client MQTT : 

### Reception de requete : 

Pour dénifir notre client MQTT nous utilisons python : 

#### Biblioteque utilisé : 

On utilise paho.mqtt.client qui est une bibliothèque python qui fournit un client MQTT. 
```py 
import paho.mqtt.client as mqtt
```

#### Définition des constantes MQTT : 

```ino
# Adresse du BROKER
broker_address = "192.168.1.146"

# Port du BROKER
broker_port = 1883

# Topic a subscribe
mqtt_topic = "esp1/lum"
```

#### Fonction de connection : 

Lors de notre connection, on se subscribe à notre topic LUM : 
```python
# Fonction de gestion de la connexion
def on_connect(client, userdata, flags, rc):
    print("Connection au broker MQTT avec le code retour : " + str(rc))
    
    # S'abonner au topic
    client.subscribe(mqtt_topic)
```

#### Fonction de réception de message : 

Lorsque l'on aurra un message sur le topic que nous avons subscribe, c'est cette fonction qui sera appellée.

Des que l'on recevera une nouvelle valeur de LUM, on l'ecrit dans un fichier "lum1.txt"
```python
# Fonction de gestion de la reception des messages
def on_message(client, userdata, msg):
    print("Message recu sur le topic "+msg.topic+" : "+str(msg.payload.decode()))
    f = open("lum1.txt", "w")
    f.write(str(msg.payload.decode())+"\n")
    f.close()
```

#### Initialisation de notre client MQTT : 

On initialise notre client MQTT : 
```python
# Initialiser le client MQTT
client = mqtt.Client()
```

La biblioteque paho.mqtt.client définit ces 2 fonctions : 

* on_connect qui est appelée par le client MQTT lorsque la connexion avec le broker MQTT est réussit
* on_message qui est appelée par le client MQTT lorsqu'un message est reçu sur un topic auquel le client est abonné

On les connecte donc ces 2 fonctions avec notre nos fonctions définit précédement : 

```python 
# Definir les fonctions de rappel
client.on_connect = on_connect
client.on_message = on_message
```

Finalement, on connecte notre client au BROKER : 

```python
# Se connecter au broker MQTT
client.connect(broker_address, broker_port)
``` 

On peut donc lancer notre client avec la commande. : 

```shell 
python3 ./clientMQTT.py
```

Notre programme s'executera en boucle et recevera les valeurs de LUM de l'esp32 avant de les écrires dans un fichier.

### Envoie de requete : 

Pour l'envoi de requête, on utilise un autre programme python sendMQTT.py : 

#### Biblioteque utilisé : 

Comme pour la réception, on utilise paho.mqtt mais cette fois la biblioteque publish

```python
import paho.mqtt.publish as publish
```

#### Définition des constantes MQTT : 

```python
# Adresse du BROKER
mqtt_broker = "192.168.1.146"

# Port du BROKER
mqtt_port = 1883

# Topic sur lequel on envoie des requetes
mqtt_topic = "esp1/led"
```

#### Publish un message 

```python
# Publier un message sur le topic 
message = "LED ON"
publish.single(mqtt_topic, payload=message, hostname=mqtt_broker, port=mqtt_port)
```

Ce programme pourra être appelé dans le code de notre serveur HTTP 


## Serveur HTTP

Pour notre serveur, nous allons utiliser Node.js

### Création du serveur : 

On lance la commande : 
```shell
npm init -y
```

Pour notre server Node.js, on utilise la biblioteque express qui fournit une interface simple pour la gestion des requêtes HTTP. Requete qui seront celle utilisées pour notre serveur.

```shell 
npm install express
```

### Programmation du serveur : 

On crée un fichier server.js qui s'occupera de recevoir les requêtes et renvoyer la page à afficher pour le client : 

#### Import des biblioteques : 

```javascript
//Biblioteque de gestion de fichier
const {readFileSync, writeFileSync} = require('fs');

//Biblioteque express
const express = require('express');
const app = express();
```

#### Principe de Node.js
Le principe de express est de "router" les requetes recut depuis le client HTTP

Ce routage prend la forme suivante : 

```javascript
app.type(path,(req,res) => {

})
```

1. Type notre type de requete HTTP, par exemple : 

* GET
* POST 
* PUT
* DELETE

2. Path, le chemin de la requête HTTP
3. req 
4. res la reponse de la requete qui sera renvoyée au client
5. => {} La fonction appelée lors de la requete


#### Requete GET de la page principale 

```javascript

app.get('/',(req,res) => {
        
        
        res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
                </head>
                <body>
                        <h1>IOC</h1>
                        <form method="GET" action="/LUM">
                          <button id='button'>LUM</button>
                        </form>
                </body>
                </html>
                `);
});
```

#### Requete d'affichage de la valeur de LUM

```javascript
app.get('/LUM',(req,res) => {

  const lum = readFileSync('../lum1.txt','utf-8');


  res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
                </head>
                <body>
                        <h1>IOC</h1>
                        <div>LUM : {lum}</div>
                        <form method="GET" action="/LUM">
                          <button id='button'>REFRESH</button>
                        </form>
                </body>
                </html>
                `);
})
```

#### Démarage du serveur : 

On choisit le port 5000 pour notre serveur ainsi que sont adresse IP
```javascript
app.listen(5000,() => console.log('http://192.168.1.146/'));
```

On lance maintenant notre serveur avec la commande : 

```shell=
node server.js
```