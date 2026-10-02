import json
import random
import time

import paho.mqtt.client as mqtt


MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883

ASSETS = [
    "AC-001",
    "AC-002",
    "PC-LAB01-001",
]


def publish_telemetry(client: mqtt.Client, asset_tag: str) -> None:
    telemetry = {
        "asset_tag": asset_tag,
        "temperature": round(random.uniform(20.0, 30.0), 2),
        "humidity": round(random.uniform(40.0, 70.0), 2),
        "status": "ACTIVE",
        "timestamp": int(time.time()),
    }

    topic = f"campus/assets/{asset_tag}/telemetry"

    client.publish(
        topic,
        json.dumps(telemetry),
        qos=1,
    )

    print(f"Published → {topic}")
    print(json.dumps(telemetry, indent=2))


def main() -> None:
    client = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2,
        client_id="campushub-publisher",
    )

    print(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}...")

    client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)

    print("Connected to MQTT broker.")
    print("Publishing telemetry every 5 seconds...")
    print("Press Ctrl+C to stop.")

    client.loop_start()

    try:
        while True:
            for asset_tag in ASSETS:
                publish_telemetry(client, asset_tag)

            time.sleep(5)

    except KeyboardInterrupt:
        print("\nStopping publisher...")

    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
