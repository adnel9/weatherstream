from pymongo import MongoClient
from kafka import KafkaProducer
from dotenv import load_dotenv
from urllib.parse import quote_plus
import time
from datetime import datetime, timedelta
import requests
import os
import json
import sys
sys.stdout = sys.stderr

# Charger la clé API à partir du fichier .env
load_dotenv()
# Récupérer les valeurs des variables d'environnement
mongo_user = os.getenv('MONGO_INITDB_DATABASE_USER')  
mongo_password = os.getenv('MONGO_INITDB_DATABASE_PASSWORD')  
mongo_host = os.getenv('MONGODB_PRIVATE_IP')
mongo_port = os.getenv('MONGO_PORT', '27017')  
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
API_KEY = os.getenv('OPENWEATHER_API_KEY')

# Fonction pour récupérer les villes depuis MongoDB
def get_user_cities():

    client = MongoClient(mongo_uri)
    users = client[mongo_db].users
    return users.distinct('favorites.city_name')

# Fonction pour récupérer les prévisions météo depuis l'API OpenWeather
def get_weather_forecast(city_name):

    def try_fetch(base_url):
        try:
            url = f"{base_url}?q={city_name}&appid={API_KEY}&units=metric"
            response = requests.get(url)
            if response.status_code != 200:
                return None
            data = response.json()
            rain_start = None
            for forecast in data.get('list', []):
                if forecast.get('weather', [{}])[0].get('main') == 'Rain':
                    rain = forecast.get('rain', {})
                    rain_start = {
                        'start_time': forecast['dt_txt'],
                        'rain_volume': rain.get('1h', rain.get('3h', 0))
                    }
                    break
            return {
                'city_id': data.get('city', {}).get('id'),
                'city_name': data.get('city', {}).get('name'),
                'country': data.get('city', {}).get('country'),
                'coordinates': {
                    'lat': data.get('city', {}).get('coord', {}).get('lat'),
                    'lon': data.get('city', {}).get('coord', {}).get('lon')
                },
                'rain_start': rain_start
            }
        except Exception as e:
            print(f"Error fetching from {base_url}: {e}")
            return None

    # Try Pro endpoint first, fall back to free
    result = try_fetch('https://pro.openweathermap.org/data/2.5/forecast/hourly')
    if result is None:
        result = try_fetch('https://api.openweathermap.org/data/2.5/forecast')
    if result is None:
        print(f"Could not fetch forecast for {city_name}")
    return result

# Fonction principale pour produire les données météo directement depuis MongoDB
def produce_weather_data():

    cities = get_user_cities()
    print(f"Villes récupérées : {cities}")
    
    producer = KafkaProducer(bootstrap_servers=[f"{kafka_ip}:9092"], 
                             value_serializer=lambda x: json.dumps(x).encode('utf-8'))

    for city in cities:
        print(f"Traitement de la ville : {city}")
        weather_forecast = get_weather_forecast(city)
        if weather_forecast:
            print(f"Producing weather data for {city}: {weather_forecast}")
            producer.send('weather_data', value=weather_forecast)
    
    producer.flush()

def wait_until_midnight():

    now = datetime.now()
    # Calculer l'heure de minuit demain
    midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    time_to_wait = (midnight - now).total_seconds()
    print(f"Attente de {time_to_wait} secondes jusqu'à minuit.")
    time.sleep(time_to_wait)

# Fonction principale pour produire les données météo
def main():
    while True:
        produce_weather_data()
        wait_until_midnight()

if __name__ == "__main__":
    main()
