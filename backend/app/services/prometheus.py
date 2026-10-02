import httpx
import os

PROMETHEUS_URL = os.getenv(
	"PROMETHEUS_URL",
	"http://localhost:9090",
)

async def query_prometheus(query: str):
    url = f"{PROMETHEUS_URL}/api/v1/query"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={"query": query},
            timeout=5.0,
        )

        response.raise_for_status()

        data = response.json()

    if data["status"] != "success":
        raise RuntimeError("Prometheus query failed")

    return data["data"]["result"]


async def query_prometheus_range(
    query: str,
    start: int,
    end: int,
    step: int,
):
    url = f"{PROMETHEUS_URL}/api/v1/query_range"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={
                "query": query,
                "start": start,
                "end": end,
                "step": step,
            },
            timeout=10.0,
        )

        response.raise_for_status()

        data = response.json()

    if data["status"] != "success":
        raise RuntimeError(
            "Prometheus range query failed"
        )

    return data["data"]["result"]
