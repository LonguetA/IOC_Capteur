# Lancer le projet 

## Architecture 

```
Projet IOC 2023
    |
    |_ _ _ MQTT
    |       |_ _ _ sendMQTT.py
    |       |_ _ _ clientMQTT.py
    |
    |_ _ _ SERVEUR
    |        |_ _ _ serveur.js
    |
    |_ _ _ CAPTEUR
              |_ _ _ lum1.txt
              |_ _ _ lum2.txt

```

## ESP : 

### ARDUINO IDE

Pour lancer le code sur l'ESP32, il faut tous d'abord installer ARDUINO IDE 

https://www.arduino.cc/en/software

### Biblioteque ARDUINO IDE

Il faut installer les bibliothèques suivantes sur l'IDE auduino : 

* Adafruit BusIO
* Adafruit GFX Library
* Adafruit SSD1306 
* PubSubClient 

### Changement des paramêtres globaux 

Pour que le programme sur l'ESP32 fonctionne, il faut spécifier le nom du WIFI et son mot de passe sur lequel il va se connecter.
Il faut également spécifier l'adresse IP du broker MQTT
(hostname -I sur le rasbperry)
```ino
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

```shell
mosquitto -c /etc/mosquitto/mosquitto.conf 
```

On donne en argument de cette commande le fichier de config dénfinit précédement.
Maintenant nous avons notre BROKER qui tourne en permanance.

## CLIENT RASPBERRY 

### Installation Bibliotheque 

Il faut tous d'abord installer paho-mqtt pour que notre client fonctionne.

```shell
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

Il faut installer la bibliotheque express et body-parser

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
