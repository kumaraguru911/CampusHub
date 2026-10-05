import json
import os
from app.kafka.producer import publish_telemetry

import paho.mqtt.client as mqtt

MQTT_BROKER = os.getenv(
    "MQTT_BROKER",
    "127.0.0.1",
)

MQTT_PORT = int(
    os.getenv(
        "MQTT_PORT",
        "1883",
    )
)
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
    try:
        payload = json.loads(message.payload.decode())

        asset_tag = payload.get("asset_tag")

        if not asset_tag:
            print("Telemetry rejected: missing asset_tag")
            return

        publish_telemetry(payload)

        print("\nTelemetry forwarded to Kafka")
        print(f"Asset: {asset_tag}")
        print(f"Temperature: {payload.get('temperature')}°C")
        print(f"Humidity: {payload.get('humidity')}%")
        print(f"Status: {payload.get('status')}")

    except json.JSONDecodeError:
        print(f"Invalid JSON received: {message.payload!r}")

    except Exception as exc:
        print(f"Failed to publish telemetry to Kafka: {exc}")

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
