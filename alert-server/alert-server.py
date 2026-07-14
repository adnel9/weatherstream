
from kafka import KafkaConsumer
from pymongo import MongoClient
import json
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
import sys
sys.stdout = sys.stderr

load_dotenv()
# Récupérer les valeurs des variables d'environnement
mongo_user = os.getenv('MONGO_INITDB_DATABASE_USER')
mongo_password = os.getenv('MONGO_INITDB_DATABASE_PASSWORD')
mongo_host = os.getenv('MONGODB_PRIVATE_IP')
mongo_port = "27017"
mongo_db = os.getenv('MONGO_INITDB_DATABASE')
kafka_ip = os.getenv('KAFKA_IP')

# Vérifier si les variables sont définies
if not mongo_user or not mongo_password or not mongo_host or not mongo_port or not mongo_db:
    raise ValueError("Les variables d'environnement MongoDB doivent être définies.")

# Encoder le nom d'utilisateur et le mot de passe
encoded_user = quote_plus(mongo_user) if mongo_user else ''
encoded_password = quote_plus(mongo_password) if mongo_password else ''

# Créer l'URI de connexion MongoDB encodée
mongo_uri = f"mongodb://{encoded_user}:{encoded_password}@{mongo_host}:{mongo_port}/{mongo_db}"


def alert_users():
    consumer = KafkaConsumer('weather_data', 
                             bootstrap_servers=[f"{kafka_ip}:9092"],
                             value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                             auto_offset_reset='earliest',
                             enable_auto_commit=True,
                             group_id='alert_users_group')
    
    client = MongoClient(mongo_uri)
    users_collection = client[mongo_db].users
    
    try:
        for msg in consumer:
            weather = msg.value
            print(f"Received weather data: {weather}")
            city_name = weather['city_name']
            rain_start = weather['rain_start']

            # Si de la pluie est prévue
            if rain_start:
                # Trouver les utilisateurs qui ont cette ville dans leur liste de villes préférées
                users = users_collection.find({'favorites.city_name': city_name})
                for user in users:
                    for city in user['favorites']:
                        if city['city_name'] == city_name:
                            # Vérifier si une alerte de pluie existe déjà
                            if city.get('rain_alert') != rain_start:
                                # Mettre à jour l'alerte de pluie pour la ville
                                users_collection.update_one(
                                    {'_id': user['_id'], 'favorites.city_name': city_name},
                                    {'$set': {
                                        'favorites.$.rain_alert': rain_start
                                    }}
                                )
                                print(f"Updated rain alert for user {user['_id']} in {city_name}.")
    except KeyboardInterrupt:
        print("Process interrupted by user, closing consumer.")
        consumer.close()



def main():
     
    alert_users()

if __name__ == "__main__":
    main()