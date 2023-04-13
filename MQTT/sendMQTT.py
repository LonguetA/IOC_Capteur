import paho.mqtt.publish as publish
import sys

# Definir les informations du broker MQTT
mqtt_broker = "192.168.1.146"
mqtt_port = 1883
mqtt_topic = "esp1/led"

# Publier un message sur le topic specifie
message = "LED ON"
publish.single(mqtt_topic, payload=message, hostname=mqtt_broker, port=mqtt_port)