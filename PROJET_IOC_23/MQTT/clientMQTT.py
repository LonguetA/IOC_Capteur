import paho.mqtt.client as mqtt

# Definir les informations de votre broker MQTT
broker_address = "172.20.10.5"
broker_port = 1883
mqtt_topic = "esp1/lum"
mqtt_topic2 = "esp2/lum"

# Fonction de gestion de la connexion
def on_connect(client, userdata, flags, rc):
    print("Connece au broker MQTT avec le code retour : " + str(rc))
    # S'abonner au topic specifie
    client.subscribe(mqtt_topic)
    client.subscribe(mqtt_topic2)

# Fonction de gestion de la reception des messages
def on_message(client, userdata, msg):
    print("Message recu sur le topic "+msg.topic+" : "+str(msg.payload.decode()))
    if msg.topic == "esp1/lum":
        f = open("../CAPTEUR/lum1.txt", "w")
        f.write(str(msg.payload.decode())+"\n")
        f.close()
    if msg.topic == "esp2/lum":
        f = open("../CAPTEUR/lum2.txt","w")
        f.write(str(msg.payload.decode())+"\n")
        f.close()



# Initialiser le client MQTT
client = mqtt.Client()

# Definir les fonctions de rappel
client.on_connect = on_connect
client.on_message = on_message

# Se connecter au broker MQTT
client.connect(broker_address, broker_port)

# Boucle principale
client.loop_forever()

