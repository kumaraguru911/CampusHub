import json

from kafka import KafkaProducer


KAFKA_BROKER = "localhost:9092"
KAFKA_TOPIC = "campus.telemetry"


producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda value: json.dumps(value).encode("utf-8"),
)


def publish_telemetry(telemetry: dict) -> None:
    future = producer.send(
        KAFKA_TOPIC,
        value=telemetry,
    )

    metadata = future.get(timeout=10)

    print(
        f"Kafka → {KAFKA_TOPIC} | "
        f"partition={metadata.partition} | "
        f"offset={metadata.offset}"
    )
