from fastapi import FastAPI
from pydantic import BaseModel
import redis
import os

app = FastAPI()

redis_url = os.getenv("REDIS_URL", "redis://redis:6379")
r = redis.from_url(redis_url)

class HealthCheck(BaseModel):
    status: str

@app.get("/", response_model=HealthCheck)
def read_root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}
