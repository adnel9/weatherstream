from locust import HttpUser, task, between
from faker import Faker
import random
import json

# Initialisation de Faker pour générer des données aléatoires
fake = Faker()

# Liste de vraies villes
real_cities = [
    "Paris", "New York", "Tokyo", "London", "Berlin", "Madrid", "Rome", "Sydney", "Toronto", "Beijing",
    "Los Angeles", "Moscow", "Dubai", "Shanghai", "Mexico City", "São Paulo", "Istanbul", "Cairo", "Lagos", "Bangkok",
    "Singapore", "Hong Kong", "Mumbai", "Seoul", "Jakarta", "Buenos Aires", "Kuala Lumpur", "Chennai", "Karachi", "Delhi",
    "Lima", "Rio de Janeiro", "Lagos", "San Francisco", "Dallas", "Chicago", "Paris", "Cape Town", "Auckland", "Montréal",
    "Rio de Janeiro", "Copenhagen", "Vienna", "Zurich", "Vienna", "Lyon", "Bangalore", "Bangalore", "Abu Dhabi", "Miami",
    "Warsaw", "Melbourne", "Barcelona", "Hong Kong", "Santiago", "Brisbane", "Geneva", "Helsinki", "Lagos", "Lima",
    "Saint Petersburg", "Frankfurt", "Stockholm", "Oslo", "Helsinki", "Athens", "Bucharest", "Dubai", "Santiago",
    "Cairo", "Los Angeles", "Hong Kong", "Zurich", "Berlin", "London", "Dublin", "Chengdu", "Cape Town", "Berlin",
    "Montreal", "Jakarta", "Shanghai", "Milan", "Madrid", "Istanbul", "Singapore", "Jakarta", "Kuala Lumpur", "Bangkok",
    "Manila", "Seoul", "Tokyo", "Nairobi", "Lagos", "Beijing", "Rio de Janeiro", "Moscow", "Buenos Aires", "Lima",
    "Mexico City", "Paris", "Toronto", "Washington D.C.", "Los Angeles", "Sydney", "Bangkok", "Rome", "Dubai", "Singapore",
    "Milan", "Copenhagen", "Barcelona", "Brussels", "Los Angeles", "Berlin", "Dubai", "Jakarta", "Kuala Lumpur", "New Delhi",
    "Singapore", "San Francisco", "London", "Paris"
]

class UserBehavior(HttpUser):
    wait_time = between(1, 5)  # Temps d'attente entre les tâches

    @task
    def full_scenario(self):
        """
        Exécute l'ensemble du scénario utilisateur en une seule tâche.
        """
        # Génération des identifiants aléatoires
        username = fake.user_name()
        password = fake.password()
        
        # Enregistrement de l'utilisateur
        response = self.client.post("/users/register", json={"username": username, "password": password})
        if response.status_code == 201:
            print(f"Utilisateur {username} enregistré avec succès.")
        else:
            print(f"Échec de l'enregistrement de {username}: {response.text}")
            return
        
        # Connexion de l'utilisateur
        response = self.client.post("/users/login", json={"username": username, "password": password})
        if response.status_code == 200:
            token = response.json().get("token")
            print(f"Utilisateur {username} connecté avec succès.")
        else:
            print(f"Échec de la connexion de {username}: {response.text}")
            return
        
        headers = {"Authorization": f"Bearer {token}"}

        # Tester la page d'accueil
        self.client.get("/")
        
        # Ajouter une ville favorite
        city = random.choice(real_cities)
        response = self.client.post("/users/favorites", json={"city_name": city}, headers=headers)
        if response.status_code == 200:
            print(f"Ville {city} ajoutée aux favoris.")
        else:
            print(f"Échec de l'ajout de {city}: {response.text}")
        
        # Récupérer la liste des villes favorites
        response = self.client.get("/users/favorites", headers=headers)
        if response.status_code == 200:
            favorites = response.json().get("favorites", [])
            print("Villes favorites récupérées:", favorites)
        else:
            print("Échec de la récupération des villes favorites:", response.text)
            return
        
        # Supprimer une ville favorite si possible
        if favorites:
            city_to_delete = random.choice(favorites)["city_name"]
            response = self.client.delete("/users/favorites", json={"city_name": city_to_delete}, headers=headers)
            if response.status_code == 200:
                print(f"Ville {city_to_delete} supprimée des favoris.")
            else:
                print(f"Échec de la suppression de {city_to_delete}: {response.text}")
        
        # Demander la météo pour une ville réelle
        city_weather = random.choice(real_cities)
        response = self.client.post("/weather", json={"city": city_weather})
        if response.status_code == 200:
            print(f"Données météo pour {city_weather}:", response.json())
        else:
            print(f"Échec de la récupération des données météo pour {city_weather}: {response.text}")
