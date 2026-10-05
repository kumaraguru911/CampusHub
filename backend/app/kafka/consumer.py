import json
from datetime import datetime, timezone

from kafka import KafkaConsumer
from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.asset import Asset
from app.models.telemetry import Telemetry


import os

KAFKA_BROKER = os.getenv(
    "KAFKA_BROKER",
    "localhost:9092",
)
KAFKA_TOPIC = "campus.telemetry"
KAFKA_GROUP = "campushub-telemetry-consumer"


def main() -> None:
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id=KAFKA_GROUP,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda value: json.loads(value.decode("utf-8")),
    )

    print(f"Connected to Kafka at {KAFKA_BROKER}")
    print(f"Listening to topic: {KAFKA_TOPIC}")
    print("Press Ctrl+C to stop.")

    try:
        for message in consumer:
            payload = message.value

            db = SessionLocal()

            try:
                asset_tag = payload.get("asset_tag")

                if not asset_tag:
                    print("Telemetry rejected: missing asset_tag")
                    continue

                asset = db.scalar(
                    select(Asset).where(Asset.asset_tag == asset_tag)
                )

                if not asset:
                    print(f"Telemetry rejected: unknown asset {asset_tag}")
                    continue

                timestamp = payload.get("timestamp")

                if timestamp:
                    recorded_at = datetime.fromtimestamp(
                        timestamp,
                        tz=timezone.utc,
                    ).replace(tzinfo=None)
                else:
                    recorded_at = datetime.utcnow()

                telemetry = Telemetry(
                    asset_id=asset.id,
                    temperature=payload.get("temperature"),
                    humidity=payload.get("humidity"),
                    status=payload.get("status", "ACTIVE"),
                    recorded_at=recorded_at,
                )

                db.add(telemetry)
                db.commit()
                db.refresh(telemetry)

                print(
                    f"PostgreSQL ← Kafka | "
                    f"asset={asset.asset_tag} | "
                    f"telemetry_id={telemetry.id} | "
                    f"partition={message.partition} | "
                    f"offset={message.offset}"
                )

            except Exception as exc:
                db.rollback()
                print(f"Failed to store telemetry: {exc}")

            finally:
                db.close()

    except KeyboardInterrupt:
        print("\nStopping Kafka consumer...")

    finally:
        consumer.close()


if __name__ == "__main__":
    main()
