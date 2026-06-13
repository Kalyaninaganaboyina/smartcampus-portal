from fastapi import FastAPI
app=FastAPI()
@app.get("/")
def root():
    return {"message":"smart campus -portal is live now..!"}
@app.get("/health")
def read_health():
    return{"status": "ok"}