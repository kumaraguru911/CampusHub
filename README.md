# CampusHub

## University Infrastructure Management Platform

CampusHub is a cloud-native platform for managing university infrastructure, including buildings, rooms, assets, telemetry, alerts, and operational health from one centralized system. It is designed for environments where physical infrastructure and connected devices must be tracked, monitored, and managed in real time.

The project combines a React frontend, a FastAPI backend, PostgreSQL, Redis, MQTT, Kafka, Prometheus, Grafana, Podman, and Kubernetes to provide a complete stack for asset management, telemetry processing, and observability.

---

## Why CampusHub?

Universities and large campuses often manage a wide variety of critical equipment and services:

- laboratories and classrooms
- networking hardware and servers
- air-conditioning and electrical systems
- projectors, printers, and office equipment
- building-level infrastructure and utilities

When those assets are spread across a campus, manual tracking and monitoring become inefficient and unreliable. CampusHub addresses this by centralizing asset data, creating monitoring rules, and processing telemetry from connected devices in real time.

The platform helps teams:

- maintain an inventory of campus infrastructure
- monitor asset health across rooms and buildings
- identify problems before they become critical
- react to changes in telemetry values and status
- observe service and system performance with dashboards
- prepare the application for containerized and cluster-based deployment

---

## Core Features

### 1. Infrastructure Management

- Building-level and room-level organization
- Asset registration and tracking
- Asset tags for unique identification
- Equipment status monitoring
- Monitoring configuration per asset
- Structured data for campus infrastructure records

### 2. Real-Time Telemetry

- MQTT ingestion from connected devices and sensors
- Mosquitto broker integration
- Event processing with MQTT subscribers
- Apache Kafka event streaming
- Kafka consumer pipeline for persistence
- Reliable telemetry storage in PostgreSQL

### 3. Monitoring and Alerting

- Prometheus metrics collection
- Node Exporter for hardware and OS metrics
- Grafana dashboards for visualization
- Resource and service health tracking
- Alert evaluation based on configured thresholds
- Operational visibility for backend and infrastructure components

### 4. Containerization and Runtime Isolation

- Frontend container setup
- Backend container setup
- PostgreSQL and Redis containers
- MQTT and Kafka service containers
- Prometheus and Grafana runtime environment
- Local service orchestration via container configuration

### 5. Kubernetes Deployment

- Cluster namespace design
- Service and deployment manifests
- Stateful storage for PostgreSQL and Grafana
- Secrets for environment configuration
- DaemonSet-based node monitoring
- Self-healing lifecycle management
- Kustomize-based deployment automation

---

## Architecture Overview

```text
                            ┌────────────────────┐
                            │       User         │
                            └─────────┬──────────┘
                                      │
                                      ▼
                            ┌────────────────────┐
                            │  React Frontend    │
                            │ TypeScript + Vite  │
                            └─────────┬──────────┘
                                      │ HTTP / REST
                                      ▼
                            ┌────────────────────┐
                            │   FastAPI Backend  │
                            │   Python Service   │
                            └──────┬─────────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  ▼                ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ PostgreSQL   │  │    Redis     │  │   Prometheus  │
          │  Main Data   │  │    Cache     │  │   Metrics     │
          └──────────────┘  └──────────────┘  └──────────────┘

          Real-Time Telemetry Flow

          IoT Device / Sensor
                  │
                  │ MQTT
                  ▼
          ┌──────────────────┐
          │ Mosquitto Broker │
          └─────────┬────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ MQTT Subscriber  │
          └─────────┬────────┘
                    │
                    │ Kafka
                    ▼
          ┌──────────────────┐
          │   Apache Kafka   │
          │ campus.telemetry │
          └─────────┬────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ Kafka Consumer  │
          └─────────┬────────┘
                    │
                    ▼
          ┌──────────────────┐
          │   PostgreSQL    │
          │   Telemetry     │
          └──────────────────┘
```

---

## Telemetry Pipeline

CampusHub uses MQTT and Kafka together to handle real-time telemetry ingestion and persistence.

```text
IoT Device
    │
    │ MQTT
    ▼
Mosquitto Broker
    │
    ▼
MQTT Subscriber
    │
    │ Kafka Producer
    ▼
Apache Kafka
    │
    │ campus.telemetry
    ▼
Kafka Consumer
    │
    ▼
PostgreSQL
```

Example payload:

```json
{
  "asset_tag": "AC-001",
  "temperature": 27.8,
  "humidity": 64.5,
  "status": "ACTIVE"
}
```

This workflow enables the system to:

1. receive data from sensor or device events
2. publish the event through MQTT
3. forward it into Kafka for stream processing
4. consume the event in the backend service
5. persist the telemetry for analytics and monitoring

---

## Monitoring and Observability

The application uses Prometheus and Grafana to observe both service health and infrastructure performance.

```text
FastAPI / Backend
      │
      │ Metrics
      ▼
Prometheus
      │
      │ Visualization / Queries
      ▼
Grafana
```

Monitoring covers:

- CPU usage
- memory usage
- disk health
- backend availability
- node health
- service uptime and responsiveness

This is especially useful in a Kubernetes environment where services are continuously restarted, scaled, and monitored.

---

## Data Model

The core entities in CampusHub are:

### Building
Represents a campus facility or structure.

### Room
Represents a room inside a building. Each room can hold multiple assets.

### Asset
Represents infrastructure equipment such as printers, projectors, servers, or lab equipment. Key fields include:

- asset name
- asset tag
- asset type
- manufacturer
- model
- serial number
- status
- monitoring configuration
- purchase date

### Alert
Represents issues raised by monitored metrics or abnormal system behavior, including severity, threshold, message, and status.

This relational structure supports structured campus infrastructure management rather than a simple unstructured inventory list.

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Backend | FastAPI + Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Migration Tool | Alembic |
| In-Memory / Cache | Redis |
| Messaging | MQTT + Mosquitto |
| Streaming | Apache Kafka |
| Metrics | Prometheus |
| Visualization | Grafana |
| Node Monitoring | Node Exporter |
| Containerization | Podman |
| Orchestration | Kubernetes |
| Deployment Manifests | Kustomize |
| API Docs | Swagger / OpenAPI |
| Version Control | Git + GitHub |

---

## Repository Structure

```text
campus-hub/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   ├── README
│   │   └── script.py.mako
│   ├── app/
│   │   ├── db/
│   │   ├── kafka/
│   │   ├── models/
│   │   ├── mqtt/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── alembic.ini
│   ├── Containerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Containerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── infrastructure/
│   ├── compose.yml
│   ├── mosquitto/
│   ├── postgres/
│   └── prometheus/
├── k8s/
│   └── base/
│       ├── backend.yaml
│       ├── frontend.yaml
│       ├── grafana-pvc.yaml
│       ├── grafana.yaml
│       ├── kafka-consumer.yaml
│       ├── kafka.yaml
│       ├── kustomization.yaml
│       ├── mqtt-subscriber.yaml
│       ├── mqtt.yaml
│       ├── namespace.yaml
│       ├── node-exporter.yaml
│       ├── postgres-pvc.yaml
│       ├── postgres-secret.yaml
│       ├── postgres.yaml
│       ├── prometheus.yaml
│       └── redis.yaml
├── docs/
├── README.md
├── requirements.txt
└── .gitignore
```

---

## Local Development

### Prerequisites

Before running the project, install:

- Git
- Python 3.11+
- Node.js 20+
- Podman or Docker
- Kubernetes tools such as kubectl
- Kustomize

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The FastAPI service exposes Swagger documentation at:

```text
http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React app starts in development mode and is usually available at:

```text
http://localhost:5173
```

### Infrastructure Services with Compose

The repository includes a Compose setup for core services under the infrastructure folder.

```bash
cd infrastructure
podman-compose up -d
```

Or with Docker Compose:

```bash
docker compose up -d
```

This starts the main supporting services needed for local operation, including PostgreSQL, Redis, MQTT, Kafka, Prometheus, and Grafana.

---

## Kubernetes Deployment

The project includes Kubernetes manifests under the k8s/base directory and automatically deploys into a namespace called campushub.

```bash
kubectl apply -k k8s/base
```

Verify the deployment:

```bash
kubectl get namespace
kubectl get pods -n campushub
kubectl get svc -n campushub
kubectl get pvc -n campushub
```

To render the manifests without applying them:

```bash
kubectl kustomize k8s/base
```

### Accessing the Frontend

```bash
kubectl port-forward svc/campushub-frontend 8080:80 -n campushub
```

Then open:

```text
http://localhost:8080
```

---

## Environment and Secret Configuration

Kubernetes configuration includes secret-backed values such as:

- DATABASE_URL
- REDIS_URL
- PROMETHEUS_URL
- KAFKA_BROKER
- MQTT_BROKER
- MQTT_PORT

This keeps service configuration flexible while allowing the backend and telemetry services to communicate correctly inside the cluster network.

---

## Testing and Validation

The project was validated in several ways:

- pod health checks in Kubernetes
- service connectivity verification
- persistent volume checks
- telemetry validation from MQTT to Kafka to PostgreSQL
- Prometheus target validation
- Grafana dashboard verification
- self-healing tests through intentional pod deletion

### Self-Healing Validation

```bash
kubectl delete pod <pod-name> -n campushub
kubectl get pods -n campushub
```

Because the deployment is designed to maintain the desired replica count, Kubernetes restores the failing pod automatically.

### PostgreSQL Persistence Validation

```bash
kubectl delete pod <postgres-pod-name> -n campushub
kubectl get pods -n campushub
```

Since PostgreSQL uses persistent storage, the data remains available after the pod is recreated.

### MQTT Telemetry Validation

```bash
kubectl exec -it deployment/campushub-mqtt -n campushub -- \
  mosquitto_pub \
  -h localhost \
  -p 1883 \
  -t campus/assets/AC-001/telemetry \
  -m '{"asset_tag":"AC-001","temperature":27.8,"humidity":64.5,"status":"ACTIVE"}'
```

The message is then processed by the MQTT subscriber, forwarded through Kafka, and stored in PostgreSQL.

---

## Kafka and Messaging Design

The main telemetry topic is:

```text
campus.telemetry
```

Kafka acts as the event-streaming layer between ingestion and persistence. This separation offers several benefits:

- decouples sensor ingestion from database writing
- allows asynchronous processing
- improves reliability for high-frequency telemetry streams
- creates a clean boundary between real-time events and application storage

---

## Author

Kumaraguru P  
B.Tech — Artificial Intelligence & Data Science
