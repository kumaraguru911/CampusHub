import json
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.asset import Asset
from app.models.telemetry import Telemetry


MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_TOPIC = "campus/assets/+/telemetry"


def on_connect(
    client: mqtt.Client,
    userdata,
    flags,
    reason_code,
    properties,
) -> None:
    if reason_code == 0:
        print("Connected to MQTT broker.")
        print(f"Subscribing to: {MQTT_TOPIC}")

        client.subscribe(MQTT_TOPIC, qos=1)

    else:
        print(f"MQTT connection failed: {reason_code}")


def on_message(
    client: mqtt.Client,
    userdata,
    message: mqtt.MQTTMessage,
) -> None:
    db = SessionLocal()

    try:
        payload = json.loads(message.payload.decode())

        asset_tag = payload.get("asset_tag")

        if not asset_tag:
            print("Telemetry rejected: missing asset_tag")
            return

        asset = db.scalar(
            select(Asset).where(Asset.asset_tag == asset_tag)
        )

        if not asset:
            print(f"Telemetry rejected: unknown asset {asset_tag}")
            return

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

        print("\nTelemetry stored")
        print(f"Asset: {asset.asset_tag}")
        print(f"Telemetry ID: {telemetry.id}")
        print(f"Temperature: {telemetry.temperature}°C")
        print(f"Humidity: {telemetry.humidity}%")
        print(f"Status: {telemetry.status}")

    except json.JSONDecodeError:
        print(f"Invalid JSON received: {message.payload!r}")

    except Exception as exc:
        db.rollback()
        print(f"Failed to store telemetry: {exc}")

    finally:
        db.close()


def main() -> None:
    client = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2,
        client_id="campushub-subscriber",
    )

    client.on_connect = on_connect
    client.on_message = on_message

    print(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}...")

    client.connect(
        MQTT_BROKER,
        MQTT_PORT,
        keepalive=60,
    )

    print("Waiting for telemetry...")
    print("Press Ctrl+C to stop.")

    try:
        client.loop_forever()

    except KeyboardInterrupt:
        print("\nStopping subscriber...")

    finally:
        client.disconnect()


if __name__ == "__main__":
    main()