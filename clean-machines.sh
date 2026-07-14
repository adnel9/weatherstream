#!/bin/bash
# ADD ALL GCP INSTANCES HERE !!!!!
# Delete firewall rules
gcloud compute firewall-rules delete allow-external-ssh-all --quiet &
gcloud compute firewall-rules delete backend-to-db-and-kafka --quiet &
gcloud compute firewall-rules delete weather-fetch-to-kafka --quiet &
gcloud compute firewall-rules delete frontend-to-backend --quiet &
gcloud compute firewall-rules delete allow-http-to-frontend --quiet &
gcloud compute firewall-rules delete allow-http-to-backend --quiet &
gcloud compute firewall-rules delete allow-http-to-monitoring --quiet &
gcloud compute firewall-rules delete monitoring-to-all --quiet &
gcloud compute firewall-rules delete monitoring-to-mongo-db --quiet &
gcloud compute firewall-rules delete monitoring-to-kafka --quiet &
gcloud compute firewall-rules delete monitoring-to-backend --quiet &
wait

# Delete instances
gcloud compute instances delete kafka-instance --zone=us-central1-a --quiet &
gcloud compute instances delete weather-fetch-instance --zone=us-central1-a --quiet &
gcloud compute instances delete mongodb-instance --zone=us-central1-a --quiet &
gcloud compute instances delete backend-instance --zone=us-central1-a --quiet &
gcloud compute instances delete frontend-instance --zone=us-central1-a --quiet &
gcloud compute instances delete monitoring-instance --zone=us-central1-a --quiet &
gcloud compute instances delete collect-alert-server --zone=us-central1-a --quiet &
wait

# Delete the network
gcloud compute networks delete meteo-network --quiet