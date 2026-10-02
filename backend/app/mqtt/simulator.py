import random
import time
from dataclasses import dataclass


@dataclass
class CampusDevice:
    asset_tag: str
    device_type: str


DEVICES = [
    CampusDevice("AC-001", "AIR_CONDITIONER"),
    CampusDevice("AC-002", "AIR_CONDITIONER"),
    CampusDevice("PC-LAB01-001", "COMPUTER"),
]


def generate_telemetry(device: CampusDevice) -> dict:
    return {
        "asset_tag": device.asset_tag,
        "device_type": device.device_type,
        "temperature": round(random.uniform(20.0, 30.0), 2),
        "humidity": round(random.uniform(40.0, 70.0), 2),
        "status": "ACTIVE",
        "timestamp": int(time.time()),
    }


def main() -> None:
    print("CampusHub Device Simulator")
    print("Simulated devices:")

    for device in DEVICES:
        print(f"- {device.asset_tag} ({device.device_type})")

    print("\nGenerating telemetry every 5 seconds...")
    print("Press Ctrl+C to stop.")

    try:
        while True:
            for device in DEVICES:
                telemetry = generate_telemetry(device)
                print(telemetry)

            print("-" * 50)
            time.sleep(5)

    except KeyboardInterrupt:
        print("\nStopping simulator...")


if __name__ == "__main__":
    main()
