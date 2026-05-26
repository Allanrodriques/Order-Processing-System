Event-driven microservices platform running on Kubernetes using Solace PubSub+ for asynchronous communication. Services are autoscaled with KEDA based on Solace queue depth, persisted in MongoDB, and monitored using OpenTelemetry and Jaeger for distributed tracing and observability.


```mermaid
flowchart LR

    U[User]

    U --> FE[Frontend React]

    FE --> OS[Order Service]

    OS --> MDB[(MongoDB)]

    OS -->|orders/created| SOLACE[(Solace PubSub+)]

    SOLACE -->|orders/created| PAY[Payment Service]

    PAY -->|payment/completed| SOLACE

    SOLACE -->|payment/completed| INV[Inventory Service]

    INV -->|inventory/reserved| SOLACE

    SOLACE -->|inventory/reserved| SHIP[Shipping Service]

    SHIP -->|shipping/created| SOLACE

    SOLACE -->|shipping/created| NOTIF[Notification Service]

    PAY --> MDB
    INV --> MDB
    SHIP --> MDB
    NOTIF --> MDB

    KEDA[KEDA Autoscaler]
    KEDA --> INV

    OTEL[OpenTelemetry SDK]

    OS --> OTEL
    PAY --> OTEL
    INV --> OTEL
    SHIP --> OTEL
    NOTIF --> OTEL

    OTEL --> JAEGER[Jaeger]

    subgraph Kubernetes Cluster
        FE
        OS
        PAY
        INV
        SHIP
        NOTIF
        MDB
        KEDA
        OTEL
        JAEGER
    end
```
