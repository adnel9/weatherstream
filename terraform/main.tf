provider "google" {
  project = "meteo-app-ensimag"
  region  = "us-central2"
}

variable "gcp_pub_ssh_key" {
  type    = string
  default = ""
}

# Define network
resource "google_compute_network" "meteo_network" {
  name = "meteo-network"
}

# Allow external SSH access to all instances in the network
resource "google_compute_firewall" "allow_external_ssh_all" {
  name    = "allow-external-ssh-all"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["frontend", "backend", "mongodb", "kafka", "weather-fetch", "monitoring", "collect-alert"]
}

# Define instances with required services

# Kafka Instance
resource "google_compute_instance" "kafka" {
  name         = "kafka-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  tags         = ["kafka"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network    = google_compute_network.meteo_network.name
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.gcp_pub_ssh_key}"
  }
}

# Weather Fetch Server Instance
resource "google_compute_instance" "weather_fetch_server" {
  name         = "weather-fetch-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  tags         = ["weather-fetch"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network    = google_compute_network.meteo_network.name
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.gcp_pub_ssh_key}"
  }
}

# MongoDB Instance
resource "google_compute_instance" "mongodb" {
  name         = "mongodb-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  tags         = ["mongodb"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network    = google_compute_network.meteo_network.name
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.gcp_pub_ssh_key}"
  }
}

# Backend Instance
resource "google_compute_instance" "backend" {
  name         = "backend-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  tags         = ["backend"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network    = google_compute_network.meteo_network.name
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.gcp_pub_ssh_key}"
  }
}

# Frontend Instance
resource "google_compute_instance" "frontend" {
  name         = "frontend-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  tags         = ["frontend"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network    = google_compute_network.meteo_network.name
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.gcp_pub_ssh_key}"
  }
}

# Monitoring Instance
resource "google_compute_instance" "collect_alert_server" {
  name         = "collect-alert-server"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  tags         = ["collect-alert"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network    = google_compute_network.meteo_network.name
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.gcp_pub_ssh_key}"
  }
}

# Monitoring Instance
resource "google_compute_instance" "monitoring" {
  name         = "monitoring-instance"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  tags         = ["monitoring"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network    = google_compute_network.meteo_network.name
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.gcp_pub_ssh_key}"
  }
}

# Specific firewall rules to allow communication only between required services
resource "google_compute_firewall" "backend_to_db_and_kafka" {
  name    = "backend-to-db-and-kafka"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["27017", "9092"]
  }

  source_tags = ["backend", "collect-alert"]
  target_tags = ["mongodb", "kafka"]
}

resource "google_compute_firewall" "weather_fetch_to_kafka" {
  name    = "weather-fetch-to-kafka"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["9092"]
  }

  source_tags = ["weather-fetch"]
  target_tags = ["kafka"]
}

resource "google_compute_firewall" "frontend_to_backend" {
  name    = "frontend-to-backend"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }

  source_tags = ["frontend"]
  target_tags = ["backend"]
}

resource "google_compute_firewall" "allow_http_to_frontend" {
  name    = "allow-http-to-frontend"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]

  target_tags = ["frontend"]
}

resource "google_compute_firewall" "allow_http_to_monitoring" {
  name    = "allow-http-to-monitoring"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]

  target_tags = ["monitoring"]
}

# This is for locust tests (TEAM SRE ASKED TO OPEN THIS PORT hh)
# because TEAM DEVOPS refused to create a new machine for locust (lack of $)
resource "google_compute_firewall" "allow_http_to_backend" {
  name    = "allow-http-to-backend"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["8089"]
  }

  source_ranges = ["0.0.0.0/0"]

  target_tags = ["backend"]
}

resource "google_compute_firewall" "monitoring_to_all" {
  name    = "monitoring-to-all"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["9100", "8080"]
  }

  source_tags = ["monitoring"]
  target_tags = ["mongodb", "kafka", "backend", "frontend"]
}

resource "google_compute_firewall" "monitoring_to_mongo_db" {
  name    = "monitoring-to-mongo-db"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["9216"]
  }

  source_tags = ["monitoring"]
  target_tags = ["mongodb"]
}

resource "google_compute_firewall" "monitoring_to_kafka" {
  name    = "monitoring-to-kafka"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["7070"]
  }

  source_tags = ["monitoring"]
  target_tags = ["kafka"]
}

resource "google_compute_firewall" "monitoring_to_backend" {
  name    = "monitoring-to-backend"
  network = google_compute_network.meteo_network.name

  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }

  source_tags = ["monitoring"]
  target_tags = ["backend"]
}

# Output public and private IPs for Kafka instance
output "kafka_public_ip" {
  value = google_compute_instance.kafka.network_interface[0].access_config[0].nat_ip
}

output "kafka_private_ip" {
  value = google_compute_instance.kafka.network_interface[0].network_ip
}

# Output public and private IPs for Weather Fetch Server instance
output "weather_fetch_public_ip" {
  value = google_compute_instance.weather_fetch_server.network_interface[0].access_config[0].nat_ip
}

output "weather_fetch_private_ip" {
  value = google_compute_instance.weather_fetch_server.network_interface[0].network_ip
}

# Output public and private IPs for MongoDB instance
output "mongodb_public_ip" {
  value = google_compute_instance.mongodb.network_interface[0].access_config[0].nat_ip
}

output "mongodb_private_ip" {
  value = google_compute_instance.mongodb.network_interface[0].network_ip
}

# Output public and private IPs for Backend instance
output "backend_public_ip" {
  value = google_compute_instance.backend.network_interface[0].access_config[0].nat_ip
}

output "backend_private_ip" {
  value = google_compute_instance.backend.network_interface[0].network_ip
}

# Output public and private IPs for Frontend instance
output "frontend_public_ip" {
  value = google_compute_instance.frontend.network_interface[0].access_config[0].nat_ip
}

output "frontend_private_ip" {
  value = google_compute_instance.frontend.network_interface[0].network_ip
}

# Output public and private IPs for Monitoring instance
output "monitoring_public_ip" {
  value = google_compute_instance.monitoring.network_interface[0].access_config[0].nat_ip
}

output "monitoring_private_ip" {
  value = google_compute_instance.monitoring.network_interface[0].network_ip
}

# Output public and private IPs for collect-alert instance
output "collect_alert_public_ip" {
  value = google_compute_instance.collect_alert_server.network_interface[0].access_config[0].nat_ip
}

output "collect_alert_private_ip" {
  value = google_compute_instance.collect_alert_server.network_interface[0].network_ip
}
