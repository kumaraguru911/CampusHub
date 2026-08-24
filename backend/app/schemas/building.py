from pydantic import BaseModel, ConfigDict


class BuildingCreate(BaseModel):
    name: str
    code: str
    location: str


class BuildingResponse(BuildingCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
