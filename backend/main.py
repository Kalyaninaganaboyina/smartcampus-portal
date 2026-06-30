from fastapi import FastAPI
from backend import models
from backend.database import engine
from backend.routes import auth,student
models.Base.metadata.create_all(bind=engine)
app=FastAPI()
app.include_router(auth.router,prefix="/auth",tags=["Authentication"])
app.include_router(student.router,prefix="/student",tags=["Student"])
@app.get("/")
def root():
    return {"message":"smart campus-portal is live now..!"}
@app.get("/health")
def read_health():
    return{"status": "ok"}
 