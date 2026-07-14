# Dockerfile for Collect Server
FROM python:3.9-slim

WORKDIR /src

# Copier le code source et installer les dépendances
COPY . /src
RUN pip install -r requirements.txt

# Attendre que Kafka soit prêt avant de démarrer collect-server.py
CMD python collect-server.py
