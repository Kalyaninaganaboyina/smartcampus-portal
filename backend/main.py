from fastapi import FastAPI
from backend import models
from backend.database import engine
from backend.routes import auth
app=FastAPI(
    title="Smart Campus Portal",
    description="Authentication and health endpoints for Smart Campus",
    version="1.0.0"
)
@app.on_event("startup")
def on_startup():
   models.Base.metadata.create_all(bind=engine)
 
app.include_router(auth.router,prefix="/auth",tags=["Authentication"])
@app.get("/")
def root():
    return {"message":"smart campus -portal is live now..!"}
@app.get("/health")
def read_health():
    return{"status": "ok"}
 