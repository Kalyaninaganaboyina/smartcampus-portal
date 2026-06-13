from fastapi import FastAPI
from backend import models
from backend.database import engine
models.Base.metadata.create_all(bind=engine)
app=FastAPI()
@app.get("/")
def root():
    return {"message":"smart campus -portal is live now..!"}
@app.get("/health")
def read_health():
    return{"status": "ok"}
 