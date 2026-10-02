import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.models.building import Building
from app.models.room import Room
from app.models.asset import Asset
from app.models.alert import Alert

from app.routers.buildings import router as buildings_router
from app.routers.rooms import router as rooms_router
from app.routers.assets import router as assets_router
from app.routers.metrics import router as metrics_router
from app.routers.alerts import router as alerts_router

from app.services.alert_scheduler import (
    alert_evaluation_loop,
)
from prometheus_fastapi_instrumentator import Instrumentator



@asynccontextmanager
async def lifespan(app: FastAPI):
    evaluator_task = asyncio.create_task(
        alert_evaluation_loop()
    )

    try:
        yield
    finally:
        evaluator_task.cancel()

        try:
            await evaluator_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="CampusHub API",
    description="University Infrastructure Management Platform",
    version="0.1.0",
    lifespan=lifespan,
)
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(buildings_router)
app.include_router(rooms_router)
app.include_router(assets_router)
app.include_router(metrics_router)
app.include_router(alerts_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "campushub-api",
    }
