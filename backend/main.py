
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend import models
from backend.database import engine
from backend.routes import auth,student,admin
models.Base.metadata.create_all(bind=engine)

def run_migrations():
    from sqlalchemy import text
    with engine.connect() as conn:
        # Check student table for missing columns
        res = conn.execute(text("PRAGMA table_info(student)"))
        columns = [row[1] for row in res.fetchall()]

        if "bio_pdf_path" not in columns:
            conn.execute(text("ALTER TABLE student ADD COLUMN bio_pdf_path VARCHAR"))
        if "name" not in columns:
            conn.execute(text("ALTER TABLE student ADD COLUMN name VARCHAR"))
        if "phone_no" not in columns:
            conn.execute(text("ALTER TABLE student ADD COLUMN phone_no VARCHAR"))
        if "address" not in columns:
            conn.execute(text("ALTER TABLE student ADD COLUMN address VARCHAR"))
        if "roll_number" not in columns:
            conn.execute(text("ALTER TABLE student ADD COLUMN roll_number VARCHAR"))
        conn.commit()

        # Check marks table for subject
        res = conn.execute(text("PRAGMA table_info(marks)"))
        columns = [row[1] for row in res.fetchall()]
        if "subject" not in columns:
            conn.execute(text("ALTER TABLE marks ADD COLUMN subject VARCHAR"))
            conn.commit()

run_migrations()

app=FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router,prefix="/auth",tags=["Authentication"])
app.include_router(student.router,prefix="/student",tags=["Student"])
app.include_router(admin.router,prefix="/admin",tags=["Admin"])
@app.get("/")
def root():
    return {"message":"smart campus-portal is live now..!"}
@app.get("/health")
def read_health():
    return{"status": "ok"}
 
