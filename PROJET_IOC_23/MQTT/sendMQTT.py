import paho.mqtt.publish as publish
import sys

print("PASS")

print(sys.argv)

# Definir les informations du broker MQTT
mqtt_broker = "172.20.10.5"
mqtt_port = 1883
mqtt_topic = sys.argv[1]

# Publier un message sur le topic specifie
message = sys.argv[2]
publish.single(mqtt_topic, payload=message, hostname=mqtt_broker, port=mqtt_port)
