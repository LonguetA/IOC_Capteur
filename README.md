# Comment lancer le projet ?

## Architecture 

```
Projet IOC 23
    |
    |_ _ _ RAPPORT IOC PROJET 23    (Rapport du projet)
    |
    |_ _ _ MQTT						(Fichiers pour les clientMQTT du raspberry)
    |       |_ _ _ sendMQTT.py
    |       |_ _ _ clientMQTT.py
    |
    |_ _ _ IMG RAPPORT			    (IMG pour le rapport .md)
    |
    |_ _ _ SERVEUR				    (Fichiers pour le serveur HTTP)
    |        |_ _ _ serveur.js
    |	     |_ _ _ style.css
    |
    |_ _ _ CAPTEUR					(Fichiers pour les valeurs des capteurs)
    |         |_ _ _ lum1.txt
    |         |_ _ _ lum2.txt
    |
    |_ _ _ ESP						(Fichiers pour ESP32)
            |_ _ _ esp1.ino
            |_ _ _ esp2.ino
   
```

## ESP : 

### ARDUINO IDE

Pour lancer le code sur l'ESP32, il faut tous d'abord installer ARDUINO IDE 

https://www.arduino.cc/en/software

### Biblioteque ARDUINO IDE

Il faut installer les bibliothèques suivantes sur l'IDE Arduino : 

* Adafruit BusIO
* Adafruit GFX Library
* Adafruit SSD1306 
* PubSubClient 
* ToneESP32

### Changement des paramêtres globaux 

Pour que le programme sur l'ESP32 fonctionne, il faut spécifier le nom du WIFI et son mot de passe sur lequel il va se connecter.
Il faut également spécifier l'adresse IP du broker MQTT
(hostname -I sur le raspberry)

```cpp
const char* ssid = "";
const char* password = "";
const char* mqtt_server = "X.X.X.X";
```

## BROKER 

### Mosquitto 

Pour notre broker MQTT, nous utilisons Mosquitto 

https://mosquitto.org

Il faut donc l'installer pour pouvoir lancer le BROKER

### Fichier de Config 

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

### Lancement  

Pour démarrer notre BROKER, on lance la commande suivante : 

```bash
mosquitto -c /etc/mosquitto/mosquitto.conf 
```

On donne en argument de cette commande le fichier de config définit précédemment. Maintenant, nous avons notre BROKER qui tourne en permanence.

## CLIENT RASPBERRY 

### Installation Bibliotheque 

Il faut tous d'abord installer paho-mqtt pour que notre client fonctionne.

```bash
pip install paho-mqtt
```
### Changement des paramêtres globaux 

Dans le script clientMQTT.py il faut changer la ligne suivante avec l'adresse IP du broker : 

```python
broker_address = "X.X.X.X"
```

### Lancement 

```shell 
python clientMQTT.py
```

## SERVEUR HTTP

### Installation NODE JS 

Il faut installer Node.js pour executer notre serveur

https://nodejs.org/en

### Initialisation

```shell 
npm init -y
```

### Installation Biblioteque 

Il faut installer la bibliothèque express et body-parser

```shell 
npm install express
npm install body-parser
```

### Config serveur 

Il est possible de changer la ligne suivante avec l'adresse IP sur serveur HTTP (Cela est purement visuel et n'est pas obligatoire) : 

```javascript 
app.listen(8000,() => console.log('X.X.X.X'));
```

### Lancement Serveur 

```shell 
node server.js
```
