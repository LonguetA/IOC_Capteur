# IOC PROJET 2023
# LONGUET Axel & LAKHLEF Rayan

## Introduction 

Notre Projet consiste à créer un réseau de capteur (constituer de 2 ESP32) qui vont communiquer en MQTT avec un BROKER sur Raspberry.

Depuis un client WEB, il sera donc possible de communiquer avec ce réseau de capteur : 

- Récupérer la valeur de luminosité captée par les 2 ESP
- Allumer ou éteindre les LED des ESP
- Écrire des messages sur les écrans des ESP

## Résumé de l'architecture globale : 

![archi](./IMG_RAPPORT/archi.png)

## Pourquoi MQTT ?

MQTT est un protocole Publish/subscribe qui permet aux appareils de publier vers un broker. Les clients se connectent au broker, le broker sera le médiateur entre ces appareils. Chaque message transmis sur un topic par un client sera transféré à tous les autres clients qui y ont souscrit à ce topic.

L'illustration ci-dessous résume le principe de fonctionnement de MQTT : 

![](https://i.imgur.com/jSHaLLE.png)

## ESP32 : 

Dans le cadre du projet, nous allons utiliser la plateforme matérielle suivante : 

Elle est composée : 

- Un ESP32
- Un écran OLED
- Un Buzzer
- Un bouton

Notre but est de pouvoir écrire des messages sur l'écran OLED, allumer / éteindre les LED et envoyer la valeur de luminosité vers le serveur.

### Mise en place du client MQTT

Dans un premier temps, nous devons être capables d'avoir un client MQTT sur notre ESP32 qui va s'abonner sur des topics et publish.


#### Definition des constantes 

On définit tous d'abord des constantes pour notre réseau wifi pour que notre esp32 puisse se connecter dessus : 

```cpp
const char* ssid = "";
const char* password = "";
```

On définit ensuite les informations concernant notre broker MQTT
```cpp
//Adresse IP du broker
const char* mqtt_server = "192.168.1.146";

//Topic MQTT a ecouter
const char* mqtt_topic = "esp2/led";
const char* mqtt_topic2 = "esp2/lcd";
```

Ici, nous mettons le topic esp2/X, car nous sommes sur le deuxième ESP. En effet, notre site est capable de contrôler 2 ESP32 les topics pour le premier seront esp1/X et pour le deuxième esp2/X

On utilise WiFiClient qui est une classe de la bibliothèque WiFi d'Arduino pour que notre esp32 se connecte à notre Broker via TCP/IP

On utilise aussi PubSubClient afin de publier ou de s'abonner à des messages sur un broker MQTT

```cpp
WiFiClient espClient;
PubSubClient client(espClient);
```

#### Connexion WIFI

Dans la fonction setup_wifi, nous nous connectons au wifi : 

```cpp
void setup_wifi()
```

```cpp
WiFi.begin(ssid, password);
while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
}
```

Pour ce faire, on utilise WIFI.begin pour se connecter à notre réseau WIFI.

#### Connexion BROKER

Dans la fonction reconnect, c'est au broker que nous nous connectons : 

```cpp
void reconnect() 
```

Cette fonction est bloquante tant que nous n'avons pas réussi à nous connecter à notre BROKER

```cpp
while (!client.connected()) 
```

Une fois notre connexion réussie, nous allons nous subscribe à nos topic définit précédemment : 

```cpp
if (client.connect("ESP32Client2")) {
    client.subscribe(mqtt_topic);
    client.subscribe(mqtt_topic2);
  Serial.println("connected");
}
```

### Définitions de nos taches

#### Gestion du timer

On utilise ensuite la gestion des timers de la même façon que dans le TP5 avec la fonction waitFor

```cpp
#define MAX_WAIT_FOR_TIMER 9
unsigned int waitFor(int timer, unsigned long period)
```

#### Gestion de la communication

Pour que notre future tache LUM puisse communiquer sa valeur de luminosité avec notre tâche MQTT, on utilise la même structure de boite aux lettres que pour le TP5 : 

```cpp
enum {EMPTY, FULL};

struct mailbox_s {
  int state;
  int val;
};
```

#### Tache LUM

On utilise la même tache LUM que dans le TP5 : 

```cpp
struct Lum_s {
  int timer;                                             
  unsigned long period;                                
  int pin;
}; 
```


```cpp
void loop_Lum( struct Lum_s * ctx,struct mailbox_s * mbLUM)
```

Dans notre loop, nous allons lire la valeur de notre photorésistance. Puis la mapper pour avoir un pourcentage de luminosité entre 0 et 100.

```cpp
unsigned int res = analogRead(ctx->pin);                
res = map(res,0,4096,100,0);
```

On met ensuite cette valeur dans la boite aux lettres pour que notre tâche MQTT puisse s'en servir.

```cpp
mbLUM->val = res;
mbLUM->state = FULL; 
```

#### Tache MQTT

On définit maintenant une nouvelle tâche MQTT qui va gérer le publish et la gestion de la réception de message en provenance du BROKER : 

```cpp
void loop_mqtt(struct mailbox_s * mbLUM)
```

Si notre boite à la lettre provenant de LUM est vide, on quitte notre fonction, car nous n'avons aucune valeur à envoyer.

```cpp
if (mbLUM->state == EMPTY) return;
```

Ensuite, nous testons si nous sommes toujours connectés au BROKER, car sinon nous ne pourrions pas envoyer nos données. 

```cpp
  if (!client.connected()) {
    reconnect();
  }
```

On récupère ensuite la valeur de notre LUM puis on la convertie pour pouvoir l'envoyer. On utilise dtostrf qui permet de convertir un float en une chaîne de caractères.

```cpp
float lum = mbLUM->val;
char tempString[8];
dtostrf(lum, 5, 2, tempString); 
```

Nous faisons aussi de même pour notre topic : 

```cpp
char topic[50];
snprintf(topic, 50, "esp2/lum");
```

Ici esp2/lum sera esp1/lum pour le premier ESP.

Pour finir, on envoie notre valeur grâce à publish, en précisant le topic sur lequel on envoie cette valeur. On indique aussi que notre boite à la lettre est vide pour que la tache LUM puisse à nouveau écrire dedans.

```cpp
client.publish(topic, tempString); // Envoi de la donnée sur le topic 
mbLUM->state = EMPTY; 
```

#### Gestion de la réception de message

On définit maintenant une fonction callback qui sera appelée lorsque l'on recevra un message sur un des topic sur lequel nous nous sommes inscrits : 

```cpp
// Fonction de gestion de la réception des messages
void callback(char* topic, byte* payload, unsigned int length) 
```

On convertit tout d'abord notre payload en chaine de caractère : 

```cpp
String message = "";
    for (int i = 0; i < length; i++) {
    message += (char)payload[i];
}
```

Si notre message est sur le topic led.
On regarde la valeur de ce message, et on allume ou non notre LED : 

```cpp
if (message == "LED ON"){
    digitalWrite(LED_BUILTIN, HIGH);
}
if (message == "LED OFF"){
    digitalWrite(LED_BUILTIN, LOW);
}
```

Si notre message n'était pas sur le topic led mais lcd, 
on écrit alors notre message sur l'écran OLED : 

```cpp
for (int i = 4 ; i < length ; i++){
    display.write(message[i]);
}
display.display();
```

On ignore les 4 premiers caractères car notre message est de la forme LCD MESSAGE

Nous avons également un message spécial qui va lancer la musique de MARIO 

```c
if(message[4] == 'M'&& message[5] == 'A' && message[6] == 'R' && message[7] == 'I' && message[8] == 'O' ){
  mario();
}
```

La fonction mario() lance la musique de MARIO :

```c
void mario() {
  ...
  beep(NOTE_E7, 120);
  beep(NOTE_E7, 120);
  ....
```

 La fonction beep fait une certaine note sur le BUZZER en utilisant la bibliothèque ToneESP32 : 

```c
void beep( int note, int duree ) {                   
	buzzer.tone(note, duree);       
  delay(duree*0.4);
}
```

### Setup de nos taches 

On effectue ensuite notre setup : 

On place la pin de notre LED en sortie : 

```cpp
pinMode(LED_BUILTIN, OUTPUT);
```

On setup notre LCD : 

```cpp
Wire.begin(4, 15);
if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3C for 128x32
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
}
display.display();
```

On configure notre communication SERIAL : 

```cpp
Serial.begin(115200);
```

On se connecte au WIFI : 

```cpp
setup_wifi();
```

On setup ensuite notre BROKER ainsi que notre fonction de callback : 

```cpp
client.setServer(mqtt_server, 1883);
client.setCallback(callback);
```

Enfin, on setup notre tache LUM 

```cpp
setup_Lum(&Lum1,5,5000000,A0);
```

### Loop de nos taches

Dans notre loop, on exécute la loop MQTT et LUM : 

```cpp
void loop() {
  loop_mqtt(&mbLUM);
  loop_Lum(&Lum1,&mbLUM);       
}
```

## Broker MQTT : 

Pour notre broker MQTT, nous utilisons Mosquitto 

https://mosquitto.org

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

On donne en argument de cette commande le fichier de config définit précédemment. Maintenant, nous avons notre BROKER qui tourne en permanence.


## Client MQTT sur notre RASPBERRY : 

Pour recevoir les informations que nos clients MQTT sur nos ESP32 vont envoyer au BROKER. Notre Raspberry doit aussi avoir son client MQTT. Ce dernier va devoir se connecter au BROKER, s'abonner sur les topics lum et faire de la gestion de ces données.

### Reception de requete : 

Pour dénifir notre client MQTT nous utilisons python : 

#### Biblioteque utilisé : 

On utilise paho.mqtt.client qui est une bibliothèque python qui fournit un client MQTT. 
```py 
import paho.mqtt.client as mqtt
```

#### Définition des constantes MQTT : 

Nous devons définir : 

- L'adresse IP de notre BROKER
- Son numéro de port
- les topic auxquels il va se subsribe

Ce qui donne : 

```python
broker_address = "172.20.10.5"
broker_port = 1883
mqtt_topic = "esp1/lum"
mqtt_topic2 = "esp2/lum"
```

#### Fonction de connection : 

Lors de notre connexion, on doit se subscribe à nos topic LUM : 

```python
# Fonction de gestion de la connexion
def on_connect(client, userdata, flags, rc):
    print("Connection au broker MQTT avec le code retour : " + str(rc))
    
    client.subscribe(mqtt_topic)
    client.subscribe(mqtt_topic2)
```

De ce fait, notre client pourra recevoir les différentes valeurs de luminosité mesurée.

#### Fonction de réception de message : 

Lorsque l'on aura un message sur l'un des topic que nous avons subscribe, c'est cette fonction qui sera appelée.

```python
# Fonction de gestion de la reception des messages
def on_message(client, userdata, msg):
    print("Message recu sur le topic "+msg.topic+" : "+str(msg.payload.decode()))
```

En fonction du topic sur lequel le message a été envoyé, nous écrirons soit la valeur de luminosité dans un fichier lum1.txt 

```python
if msg.topic == "esp1/lum":
    f = open("../CAPTEUR/lum1.txt", "w")
    f.write(str(msg.payload.decode())+"\n")
    f.close()
```

Soit dans un fichier lum2.txt

```python
if msg.topic == "esp2/lum":
    f = open("../CAPTEUR/lum2.txt","w")
    f.write(str(msg.payload.decode())+"\n")
    f.close()
```

#### Initialisation de notre client MQTT : 

On initialise notre client MQTT : 
```python
# Initialiser le client MQTT
client = mqtt.Client()
```

La bibliothèque paho.mqtt.client définit ces 2 fonctions : 

- on_connect qui est appelée par le client MQTT lorsque la connexion avec le broker MQTT est réussi
- on_message qui est appelée par le client MQTT lorsqu'un message est reçu sur un topic auquel le client est abonné

On les connecte donc ces 2 fonctions avec nos fonctions définit précédemment : 

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

Notre programme s'exécutera en boucle et recevra les valeurs de LUM de nos ESP32 avant de les écrire dans un fichier.

## La gestion du publish sur le RASPBERRY

Pour le publish de message sur les topic lcd ou led, nous avons décidé de créer un client MQTT temporaire. En effet, contrairement à notre Client MQTT pour la gestion de lum, ce client ne tournera pas en permanence.

Ce dernier va se connecter au BROKER pour envoyer un seul message puis se déconnecter. Nous avons fait ce choix au vu de comment nous avons géré l'envoie de requête au travers de notre serveur HTPP. Nous rentrerons dans les détails du serveur HTTP après.


### Script python 

Pour l'envoi de requête, on utilise un autre programme python sendMQTT.py.
En effet, notre serveur HTTP lancera la commande suivante lorsqu'il voudra communiquer avec l'ESP32 : 

```shell 
python3 sendMQTT.py TOPIC MESSAGE
```

Cela aura pour effet de créer un client MQTT qui va se connecter à notre BROKER pour envoyer un message MESSAGE sur le topic TOPIC.
Une fois fait, le client se déconnecte du broker.

#### Biblioteque utilisé : 

Comme pour la réception, on utilise paho.mqtt mais cette fois la bibliothèque publish

```python
import paho.mqtt.publish as publish
import sys
```

Nous utilisons aussi sys pour récupérer les arguments donnés lors du lancement de la commande.

#### Définition des constantes MQTT : 

```python
# Definir les informations du broker MQTT
mqtt_broker = "172.20.10.5"
mqtt_port = 1883
mqtt_topic = sys.argv[1]
```

On définit ici l'adresse IP de notre BROKER ainsi que son numéro de port. On récupère également notre topic.

#### Publish un message 

```python
# Publier un message sur le topic specifie
message = sys.argv[2]
publish.single(mqtt_topic, payload=message, hostname=mqtt_broker, port=mqtt_port)
```

Pour publish notre message, on utilise la fonction paho.mqtt.publish


## Serveur HTTP

Pour notre serveur, nous allons utiliser Node.js.
Node.js permet d'exécuter du code JavaScript côté serveur.

https://nodejs.org/en

Nous avons utilisé cela au lieu de python, car nous avions déjà fait un serveur de ce type dans un précédent projet.

Pour pouvoir router nos requêtes HTTP, nous utiliserons express. Express.js est un framework de Node.js qui permet de développer applications web. Il offre des fonctionnalités telles que la gestion des routes. C'est ce que nous utiliserons en priorité dans notre projet pour router nos requêtes HTTP en provenance des clients WEB.

https://expressjs.com

### Création du serveur : 

On lance la commande : 
```shell
npm init -y
```

Pour notre server Node.js, on utilise la bibliothèque express qui fournit une interface simple pour la gestion des requêtes HTTP. Requêtes qui seront celle utilisée pour notre serveur. Nous utiliserons aussi body-parser pour récupérer les arguments dans le corps de nos requêtes HTTP.

```shell 
npm install express
npm install body-parser
```

### Programmation du serveur : 

On crée un fichier server.js qui s'occupera de recevoir les requêtes et renvoyer la page à afficher pour le client : 

#### Import des biblioteques : 

Nous avons la bibliothèque FS pour lire et écrire dans des fichiers 

```javascript
const {readFileSync, writeFileSync} = require('fs');
```

Express pour router nos requêtes HTTP

```javascript
const express = require('express');
const app = express();
```

BodyParser pour récupérer les données envoyées dans les requêtes HTTP du client.

```javascript
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
```

#### Principe de Express.js

Le principe d'express est de "router" les requêtes reçut depuis le client HTTP

Ce routage prend la forme suivante : 

```javascript
app.type(path,(req,res) => {

})
```

1. Type notre type de requête HTTP, par exemple : 

- GET
- POST 
- PUT
- DELETE

1. Path, l'URI de la requête HTTP
2. req le corps de la requête HTTP
3. res la réponse de la requête qui sera renvoyée au client
4. => {} La fonction appelée lors de la requête

La page HTML que nous renverrons à notre client se fera de la manière suivante : 


```javascript
res.send(`
    <!DOCTYPE html>
    <html lang=fr>
        <head>
        </head>
        <body>
        </body>
    </html>
`);
```

Donc pour résumer, voici un exemple de traitement d'une requête GET sur l'URI /BONJOUR 

```javascript
app.get("/BONJOUR",(req,res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang=fr>
            <head>
            </head>
            <body>
                BONJOUR
            </body>
        </html>
    `);
})
```
#### Affichage coté client : 

Voici la route Express qui géré l'affichage de la page web initiale lorsque le client se rend pour la première fois sur le site : 


```javascript
app.get('/',(req,res) => {

}
```

Notre page principale est de la forme suivante : 

![principale](./IMG_RAPPORT/principale.png)

On peut voir que nous avons 2 menus qui gèrent chacun un ESP.

![menu](./IMG_RAPPORT/menu.png)

Chaque menu contient : 

- La valeur du capteur de luminosité qui peut être rafraîchi lors de l'appui sur un bouton.
- L'écriture d'un message qui sera envoyer vers l'écran OLED 
- Et enfin une switch pour allumer / éteindre la led de l'ESP

#### Récuperation de la valeur de luminosité : 

* ##### Coté client : 

Lorsque l'utilisateur voudra avoir la valeur du capteur, il appuiera sur le bouton val 

![lum](./IMG_RAPPORT/lum.png)

Cela aura pour effet d'envoyer une requête HTTP GET vers l'URI /LUM

```javascript
<form method="GET" action="/LUM">
    <span class="val">LUM : ${lum}</span>
    <button name="send" type="submit" value="../CAPTEUR/lum1.txt">VAL</button>
</form>
```

On peut voir que notre valeur lum est écrite de la manière suivante : ${lum} car c'est une variable javascript de notre serveur. Lorsque l'on enverra la réponse, la valeur sera remplacée par celle de la variable.

* ##### Coté serveur : 

On récupère notre requête grâce à la route Express suivante : 

```javascript
app.get('/LUM',(req,res) => 
```

Dans la fonction, nous allons tous d'abord lire la valeur de luminosité écrite dans le fichier par notre client MQTT. 

```javascript
var val = readFileSync(req.query.send,'utf-8');
```

Pour savoir quel fichier lire, ce dernier sera spécifié dans la requête HTTP (lum1.txt si EPS1 sinon lum2.txt)

Ensuite, nous mettons à jour notre variable lum ou lum2 : 

```javascript
if (req.query.send == "../lum1.txt") lum = val
else lum2 = val
```

On renvoie ensuite notre page html avec la valeur de lum modifié (Version réduite pour l'exemple ici) : 

```javascript 
res.send(`
    ... 
    <form method="GET" action="/LUM">
        <span class="val">LUM : ${lum}</span>
        <button name="send" type="submit" value="../CAPTEUR/lum1.txt">VAL</button>
    </form>
    ...
`)
```

#### Envoie d'un message sur l'écran OLED : 

* ##### Coté client : 

Pour envoyer un message à afficher sur l'écran OLED de l'ESP, on remplit un formulaire avec notre message puis on appuie sur send

![oled](./IMG_RAPPORT/oled.png)

Cela aura pour effet d’envoyer une requête HTTP POST vers l’URI /LCD

```javascript
<form methode="POST" action="/LCD">
    <input id="lcdSEND" name="lcd" type="text" placeholder="LCD MESSAGE">
    <button name="send" type="submit" value="esp1/lcd">SEND</button>
</form>
```

On spécifie dans la valeur du bouton le topic vers lequel le message sera envoyer esp1/lcd dans le cas du premier ESP esp2/lcd sinon.

* ##### Coté serveur :

On récupère notre requête grâce à la route Express suivante : 

```javascript
app.post('/LCD',(req,res) => {
```

Pour pouvoir lancer notre script python sendMQTT.py, nous avons besoin de la bibliothèque child_process : 

```javascript 
const { spawn } = require('child_process');
```

On définit ensuite le chemin de notre programme : 

```javascript
const scriptPath = '../MQTT/sendMQTT.py';
```

On lance ensuite notre script python avec la fonction spwan.

```javascript
const pythonProcess = spawn('python3', [scriptPath,req.query.send,'LCD '+ req.query.lcd]);	
```

Avec  : 

- req.query.send : TOPIC du message
- req.query.lcd  : MESSAGE 

On récupère ces valeurs dans le corps de la requête HTTP ce qui correspond à req.query.

- send correspond à notre bouton dont le nom était send et qui contient le nom du topic
- lcd correspond à notre input dont le nom était lcd et qui contient le message 

On renvoie ensuite notre page HTML avec le formulaire vide (Version réduite pour l'exemple ici) : 

```javascript 
res.send(`
    ...
    <form methode="POST" action="/LCD">
        <input id="lcdSEND" name="lcd" type="text" placeholder="LCD MESSAGE">
        <button name="send" type="submit" value="esp1/lcd">SEND</button>
    </form>
    ...
`)
```



![imgOLED](./IMG_RAPPORT/imgOLED.gif)

#### Commande de la LED : 

* ##### Coté client : 

Pour allumer / eteindre la led on dispose d'une switch.

Lorsque l'on décoche la switch pour éteindre la led : 


![led_1](./IMG_RAPPORT/led_1.png)

```javascript
<input type="checkbox" name="checkbox" value="dark" onclick="clickFn1(event)">
```

Lorsque l'on coche la switch pour allumer la led :

![led_2](./IMG_RAPPORT/led_2.png)

```javascript
<input type="checkbox" checked name="checkbox" value="dark" onclick="clickFn1(event)">
```

Quelque soit l'état de la switch on envoie une requête HTTP POST avec l'URI LED

```javascript
<form method="post" action="/LED">
    <input type="hidden" id="led2" name="led" value="test">
    <input type="hidden" name="send" value="esp2/led">
</form>
```

Comme on peut le voir, le nom du topic est précisé dans l'input send et l'état de la LED dans l'input led.

Mais en HTML, il est impossible d'envoyer l'état d'une checkbox décoché dans une requête HTTP. C'est donc pour cela qu'on utilise un formulaire caché qui sera envoyé.

Dans le code de la checkbox, on ajoute le paramètre suivant : 

```javascript
onclick="clickFn1(event)"
```

Cela aura pour effet d'exécuté la fonction javascript clickFn1 lorsque l'on cliquera sur la checkbox.

```javascript
function clickFn1(event) {
    const checkbox = event.currentTarget;
    const led = document.getElementById("led1");
    led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
    led.closest('form').submit()          				
}
```

Dans cette fonction, on récupère le form caché vu précédemment avec la fonction document.getElementById. Ensuite, en fonction de la valeur de la checkbox, on change le message envoyé dans l'input led. 

Ensuite, grâce à la méthode submit(), on envoie la requête HTTP de notre form caché.

* ##### Coté serveur :  

On récupère notre requête grâce à la route Express suivante : 

```javascript
app.post('/LED',(req,res) => {
```

Comme pour LCD, on lance le script python sendMQTT.py 

```javascript
const { spawn } = require('child_process');
const scriptPath = '../MQTT/sendMQTT.py';

const pythonProcess = spawn('python3', [scriptPath,req.body.send,req.body.led]);
```

* req.body.send : le TOPIC
* req.body.led  : LED ON ou LED OFF 

Ensuite en fonction du message envoyé, on met notre checkbox comme checké ou non : 

```javascript 
if (req.body.led == "LED ON") led1_status = `<input type="checkbox" name="checkbox" checked value="dark" onclick="clickFn1(event)">`
else led1_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn1(event)">`
```

Et de même si jamais la requête est pour l'ESP 2

On renvoie ensuite au client la page HTML avec la checkbox chéker ou non. (Version réduite pour l'exemple ici)

```javascript
res.send(` 
    ...
    <form>
        <span class="val">LED </span>
        <label class="switch">
        ${led1_status}
        <span class="slider round"></span>
    </form>
    ...
`)
```



![imgLED](./IMG_RAPPORT/imgLED.gif)

#### Mise en forme : 

On ajoute aussi une route Express pour le fichier de mise en form CSS

```javascript
app.get('/style.css',(req,res) => {
	res.sendFile(__dirname + "/" + "style.css");
}); 
```

#### Démarage du serveur : 

On choisit le port 8000 pour notre serveur ainsi que son adresse IP

```javascript
app.listen(8000,() => console.log('http://192.168.1.146/'));
```

On lance maintenant notre serveur avec la commande : 

```shell
node server.js
```