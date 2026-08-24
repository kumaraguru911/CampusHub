import httpx


PROMETHEUS_URL = "http://localhost:9090"


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