<div align="center">

# ⛅ WeatherStream

**A production-grade distributed weather platform built with microservices, Apache Kafka, and fully automated cloud deployment on GCP.**

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-Confluent-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GCP](https://img.shields.io/badge/GCP-Compute_Engine-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![Ansible](https://img.shields.io/badge/Ansible-Config_Mgmt-EE0000?logo=ansible&logoColor=white)](https://www.ansible.com/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?logo=grafana&logoColor=white)](https://grafana.com/)

</div>

---

## Overview

WeatherStream is a distributed weather application that demonstrates end-to-end production engineering: a polished glassmorphic frontend, an event-driven microservices backend, automated infrastructure-as-code deployment across 7 GCP VMs, and a full observability stack with pre-provisioned Grafana dashboards.

The system handles two distinct workflows running in parallel:

- **Real-time weather queries** — city searches travel through a Kafka message bus to a dedicated fetch service and back in under 3 seconds
- **Nightly rain alerts** — a Python batch process forecasts rain for every user's saved cities and stores alerts in MongoDB for instant access

---

## Screenshots

<table>
<tr>
<td width="50%">

**Home Dashboard**
![Home Dashboard](docs/screenshots/01-home-dashboard.png)

</td>
<td width="50%">

**Weather Search Result**
![Weather Search](docs/screenshots/04-weather-search-result.png)

</td>
</tr>
<tr>
<td width="50%">

**Favorites Panel**
![Favorites](docs/screenshots/05-favorites-panel.png)

</td>
<td width="50%">

**Rain Alerts**
![Rain Alerts](docs/screenshots/06-rain-alerts.png)

</td>
</tr>
<tr>
<td width="50%">

**Login Modal**
![Login](docs/screenshots/02-login-modal.png)

</td>
</tr>
</table>

> Full authenticated state with weather data loaded:
> ![Full App State](docs/screenshots/07-full-app-state.png)

---

## Features

- 🔍 **Real-time weather search** via city name, powered by OpenWeather API through a Kafka round-trip
- 🌧 **Proactive rain alerts** — nightly batch job forecasts rain events for all users' saved cities
- ⭐ **Favorites management** — save cities and get automatic forecast updates and rain notifications
- 🔐 **JWT authentication** — secure login/registration with bcrypt password hashing
- 📊 **Full observability** — Prometheus metrics, pre-provisioned Grafana dashboards, Alertmanager email notifications
- 🚀 **Automated cloud deployment** — zero-touch GCP provisioning via Terraform + Ansible + GitLab CI
- 🧪 **Built-in load testing** — Locust master/worker fleet simulates 500 concurrent users
- 📱 **Responsive design** — glassmorphic UI adapts from desktop to mobile

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Vue 3 + Vite + Nginx | SPA with glassmorphic design system |
| **Backend** | Node.js 18 + Express | REST API, JWT auth, Kafka bridge |
| **Weather Fetch** | Node.js + KafkaJS | Kafka consumer/producer, OpenWeather API caller |
| **Collect Server** | Python + requests | Nightly hourly forecast batch job |
| **Alert Server** | Python + kafka-python | Kafka consumer, MongoDB rain alert upserts |
| **Database** | MongoDB 7 | User accounts, favorites, rain alerts |
| **Message Bus** | Apache Kafka (Confluent) + ZooKeeper | Async event-driven communication |
| **Monitoring** | Prometheus + Grafana + Alertmanager | Metrics collection, dashboards, alerting |
| **Exporters** | cAdvisor + node_exporter + mongo_exporter + JMX | Container, host, DB, and Kafka metrics |
| **Load Testing** | Locust (master + 4 workers) | Distributed performance benchmarking |
| **IaC** | Terraform | GCP VM provisioning, VPC, firewall rules |
| **Config Management** | Ansible | Docker install, archive transfer, service startup |
| **CI/CD** | GitLab CI + custom runner image | Full automated deployment pipeline |
| **Containerization** | Docker + Docker Compose | Local and per-VM orchestration |

---

## Distributed System Architecture

```mermaid
graph TB
    subgraph Frontend["🖥 Frontend — Port 80"]
        UI[Vue 3 SPA<br/>served by Nginx]
    end

    subgraph Backend["⚙️ Backend — Port 3000"]
        API[Express REST API<br/>JWT Auth]
        KP[Kafka Producer]
        KC[Kafka Consumer]
        MEM[In-Memory Map<br/>weatherResponses]
    end

    subgraph Bus["📨 Kafka Cluster"]
        ZK[ZooKeeper :2181]
        K[Kafka Broker :9092]
        T1[weather-requests]
        T2[weather-responses]
        T3[weather_data]
    end

    subgraph Services["🔧 Microservices"]
        WFS[weather-fetch-server<br/>:3001 — Node.js]
        CS[collect-server<br/>Python — nightly batch]
        AS[alert-server<br/>Python — Kafka consumer]
    end

    subgraph DB["🗄 Data Layer"]
        MONGO[(MongoDB :27017<br/>meteoDB)]
    end

    subgraph Obs["📊 Observability"]
        PROM[Prometheus :9090]
        GRAF[Grafana :3002]
        AM[Alertmanager :9093]
    end

    OW[🌐 OpenWeather API]

    UI -->|HTTP REST| API
    API --> KP --> T1 --> WFS
    WFS -->|GET /weather| OW
    OW -->|JSON response| WFS
    WFS --> T2 --> KC --> MEM
    MEM -->|polling| API

    CS -->|GET /forecast| OW
    OW -->|JSON response| CS
    CS --> T3 --> AS --> MONGO

    API --> MONGO

    ZK --- K

    PROM --> GRAF
    PROM -->|fire rules| AM
    AM -->|email| EMAIL[📧 Email]
```

---

## Weather Request Flow (Real-Time)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Kafka
    participant WeatherFetch
    participant OpenWeather

    User->>Frontend: Search "Paris"
    Frontend->>Backend: POST /weather { city: "Paris" }
    Backend->>Kafka: Produce → weather-requests
    Note over Backend: Start polling weatherResponses["Paris"]

    Kafka->>WeatherFetch: Consume city name
    WeatherFetch->>OpenWeather: GET /data/2.5/weather?q=Paris
    OpenWeather-->>WeatherFetch: Current weather JSON
    WeatherFetch->>Kafka: Produce → weather-responses

    loop Poll every 1s until response
        Backend->>Backend: weatherResponses.get("Paris")
    end

    Kafka->>Backend: Consume weather response
    Backend-->>Frontend: 200 { temp, description, humidity, ... }
    Frontend->>User: Render weather card
```

---

## Nightly Rain Alert Workflow

```mermaid
sequenceDiagram
    participant Cron
    participant CollectServer
    participant MongoDB
    participant OpenWeather
    participant Kafka
    participant AlertServer

    Cron->>CollectServer: Trigger at midnight

    CollectServer->>MongoDB: Query all distinct favorite city names
    MongoDB-->>CollectServer: [Paris, London, Tokyo, ...]

    loop For each city
        CollectServer->>OpenWeather: GET forecast (Pro → Free fallback)
        OpenWeather-->>CollectServer: Forecast list (5 days / 3h intervals)
        CollectServer->>CollectServer: Find first entry where weather = Rain
        CollectServer->>Kafka: Produce → weather_data
    end

    Kafka->>AlertServer: Consume weather_data messages

    loop For each message
        AlertServer->>MongoDB: Upsert rain_alert on users.favorites[city]
    end

    Note over MongoDB: rain_alert: { start_time, rain_volume } stored per user per city
```

---

## Cloud Deployment (GCP)

The entire infrastructure is codified. A single `git push` triggers the full pipeline: provision 7 VMs on GCP, configure them, and deploy all services.

### GCP Infrastructure

```mermaid
graph LR
    INET[🌐 Internet]

    subgraph GCP["☁️ Google Cloud Platform — us-central1-a — VPC: meteo-network"]
        FE["🖥 frontend-vm\ne2-medium\n:80"]
        BE["⚙️ backend-vm\ne2-medium\n:3000 :8089"]
        KF["📨 kafka-vm\ne2-medium\n:9092 :2181"]
        WF["🌤 weather-fetch-vm\ne2-medium\n:3001"]
        DB["🗄 mongodb-vm\ne2-medium\n:27017"]
        CA["🔧 collect-alert-vm\ne2-medium"]
        MON["📊 monitoring-vm\ne2-medium\n:9090 :3002 :9093"]
    end

    INET -->|:80| FE
    FE -->|:3000| BE
    BE -->|:9092| KF
    BE -->|:27017| DB
    WF -->|:9092| KF
    CA -->|:9092| KF
    CA -->|:27017| DB
    MON -->|scrape :3000| BE
    MON -->|scrape :9216| DB
    MON -->|scrape :7070| KF
    MON -.->|":9100 :8080"| FE
    MON -.->|":9100 :8080"| BE
```

### CI/CD Pipeline

```mermaid
graph LR
    A[📦 git push] --> B["cleanupAuto\nterraform destroy\nexisting infra"]
    B --> C["deploy\nterraform apply\n→ 7 GCP VMs"]
    C --> D["Ansible\nInstall Docker\non all VMs"]
    D --> E["Generate per-VM .env\nfrom Terraform outputs\nIPs + credentials"]
    E --> F["Compress & transfer\nservice archives\nto each VM"]
    F --> G["Ansible playbooks\ndocker compose up\nper service group"]
    G --> H["✅ Live on GCP"]
    H -. "manual trigger" .-> I["cleanupManuel\nterraform destroy"]

    style A fill:#4A90D9,color:#fff
    style H fill:#27AE60,color:#fff
    style I fill:#E74C3C,color:#fff
```

**Custom CI runner image:** `my-gcloud-terraform-ansible:latest` bundles gcloud CLI, Terraform, and Ansible in one image for reproducible deployments with zero local tooling required.

**Startup order is critical:** MongoDB and Kafka must be fully healthy before backend, weather-fetch, collect-server, and alert-server are started. Ansible playbook ordering and Docker health checks enforce this constraint.

---

## Monitoring Stack

```mermaid
graph TB
    subgraph Exporters["📡 Metrics Sources"]
        NE["node_exporter :9100\nHost CPU, RAM, disk, network"]
        CA["cAdvisor :8080\nContainer resource usage"]
        ME["mongo_exporter :9216\nMongoDB operations & connections"]
        JMX["JMX Exporter :7070\nKafka broker JVM metrics"]
        BE["Backend /metrics :3000\nHTTP request rates & latency"]
    end

    PROM["Prometheus :9090\nScrapes every 15s\nAlert rule evaluation"]
    GRAF["Grafana :3002\nPre-provisioned dashboards\nadmin / admin"]
    AM["Alertmanager :9093"]
    EMAIL["📧 Email notifications"]

    NE --> PROM
    CA --> PROM
    ME --> PROM
    JMX --> PROM
    BE --> PROM
    PROM --> GRAF
    PROM -->|"fire alert rules"| AM
    AM --> EMAIL
```

**Alert rules in production:**

| Rule | Condition | Severity |
|------|-----------|----------|
| High CPU Usage | CPU > 80% sustained for 5 minutes | critical |
| High Request Rate | Spike above baseline threshold | warning |

Grafana dashboards are provisioned automatically at deploy time — no manual import required.

### Live Demo — Grafana & Locust in Action

![Monitoring & Load Testing Demo](docs/demo-monitoring.gif)

---

## Load Testing

Distributed Locust setup with 1 master coordinating 4 workers:

```
locust-master  → coordinates workers, exposes web UI (:8089)
  └── locust-worker ×4  → headless, receive tasks from master
```

**Benchmark configuration:**

| Parameter | Value |
|-----------|-------|
| Concurrent users | 500 |
| Spawn rate | 10 users/second |
| Simulated flow | Register → Login → Search weather |

Access the Locust dashboard at `http://localhost:8089` to monitor requests/sec, response times, and failure rates in real time.


---

## Local Setup

### Prerequisites

- Docker + Docker Compose
- OpenWeather API key ([free tier](https://openweathermap.org/api) works)

### Run

```bash
# 1. Clone the repository
git clone <repo-url>
cd distributed-meteo-app

# 2. Create .env at the project root
cat > .env << EOF
OPENWEATHER_API_KEY=your_key_here
KAFKA_IP=kafka-container
MONGODB_PRIVATE_IP=mongo-container
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=adminpassword
MONGO_INITDB_DATABASE_USER=meteouser
MONGO_INITDB_DATABASE_PASSWORD=meteopassword
MONGO_INITDB_DATABASE=meteoDB
MONGODB_URI=mongodb://admin:adminpassword@mongo-container:27017/meteoDB?authSource=admin
EOF

# 3. Launch all services
docker compose up --build
```

> Allow **2–3 minutes** after startup for Kafka to complete leader election before the application is fully functional.

### Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| App | http://localhost | — |
| Grafana | http://localhost:3002 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| Locust | http://localhost:8089 | — |
| Backend API | http://localhost:3000 | — |

---

## Key Engineering Challenges

### Kafka Startup Timing
Kafka's internal leader election takes 30–60 seconds after ZooKeeper starts. Without proper sequencing, dependent services fail silently on connection. Solved using Confluent's `cub kafka-ready` and `cub zk-ready` health check commands with `start_period: 60s`, ensuring all consumers and producers only start against a fully ready broker.

### Async Request-Response over a Message Bus
The weather search flow is inherently async (frontend → backend → Kafka → fetch-server → Kafka → backend), but the HTTP client expects a synchronous response. Implemented a polling pattern: the backend stores incoming Kafka messages in an in-memory map keyed by city name, polls at 200ms intervals, and resolves the HTTP response once the result arrives — with a 10-second hard timeout to prevent hanging requests.

### OpenWeather API Tier Compatibility
The Pro hourly endpoint (`/forecast/hourly`) and the free 3-hour endpoint (`/forecast`) return rain volume under different keys (`rain['1h']` vs `rain['3h']`). Implemented graceful fallback: attempt Pro first, fall back to the free endpoint on any non-200 response, and extract volume with `rain['1h'] ?? rain['3h'] ?? 0` — fully transparent to the rest of the codebase.

### Multi-VM Deployment Coordination
Deploying 7 interdependent services across 7 separate GCP VMs requires strict startup ordering and dynamic per-machine configuration. Solved by: (1) generating per-machine `.env` files at pipeline runtime from Terraform outputs, (2) ordering Ansible playbook execution so Kafka and MongoDB are healthy before consumers start, and (3) using Docker Compose health checks within each VM to serialize container startup.

### Unified Observability Across VMs
With 7 VMs and 12+ containers, debugging performance issues without a unified view is impractical. Configured Prometheus to scrape all exporters via private VPC IPs, with Grafana dashboards provisioned automatically via the provisioning system — fully operational dashboards from the very first deployment with no manual configuration.

---

## Skills Demonstrated

| Domain | Skills |
|--------|--------|
| **Backend Engineering** | Node.js, Express, REST API design, JWT auth, bcrypt, async patterns |
| **Event-Driven Systems** | Apache Kafka — topics, producers, consumers, health checks, startup ordering |
| **Frontend Development** | Vue 3 (Composition API), Vite, CSS design systems, responsive layouts |
| **Database** | MongoDB — document modeling, atomic upserts, compound queries |
| **DevOps** | Docker, Docker Compose, multi-service orchestration, health checks |
| **Cloud Infrastructure** | GCP Compute Engine, VPC networking, tag-based firewall rules |
| **Infrastructure as Code** | Terraform — resource provisioning, output passing, state management |
| **Configuration Management** | Ansible — playbooks, dynamic inventory, secrets injection |
| **CI/CD** | GitLab CI — pipeline stages, custom runner images, artifact chaining |
| **Observability** | Prometheus, Grafana, Alertmanager, cAdvisor, node_exporter, JMX exporter |
| **Load Testing** | Locust — distributed master/worker setup, realistic user flow simulation |
| **Python** | Batch processing, Kafka consumer, MongoDB driver, scheduled jobs |

---

## Future Improvements

- [ ] WebSocket push for real-time weather updates (eliminate Kafka polling overhead)
- [ ] Redis caching layer to reduce redundant OpenWeather API calls for popular cities
- [ ] Kubernetes migration with Helm charts and HPA for the weather-fetch-server
- [ ] Multi-region GCP deployment with Cloud Load Balancer for high availability
- [ ] OpenTelemetry distributed tracing across Kafka message boundaries
- [ ] Progressive Web App with native push notifications for rain alerts
- [ ] Historical weather data storage with time-series queries

---

<div align="center">

Built with ⛅ Vue, Node.js, Kafka, Python, MongoDB, Terraform, and Ansible

</div>
