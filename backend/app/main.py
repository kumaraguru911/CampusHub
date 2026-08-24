from fastapi import FastAPI

from app.db.database import Base, engine
from app.models.building import Building
from app.models.room import Room
from app.models.asset import Asset
from app.routers.buildings import router as buildings_router
from app.routers.rooms import router as rooms_router
from app.routers.assets import router as assets_router
from app.routers.metrics import router as metrics_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusHub API",
    description="University Infrastructure Management Platform",
    version="0.1.0",
)

app.include_router(buildings_router)
app.include_router(rooms_router)
app.include_router(assets_router)
app.include_router(metrics_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "campushub-api",
    }