
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend import models
from backend.database import engine
from backend.routes import auth,student,admin,chat
models.Base.metadata.create_all(bind=engine)

def run_migrations():
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    # Check student table for missing columns
    if "student" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("student")]
        with engine.begin() as conn:
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

    # Check marks table for subject and reg_number
    if "marks" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("marks")]
        with engine.begin() as conn:
            if "subject" not in columns:
                conn.execute(text("ALTER TABLE marks ADD COLUMN subject VARCHAR"))
            if "reg_number" not in columns:
                conn.execute(text("ALTER TABLE marks ADD COLUMN reg_number VARCHAR"))

    # Check attendance table for reg_number
    if "attendance" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("attendance")]
        with engine.begin() as conn:
            if "reg_number" not in columns:
                conn.execute(text("ALTER TABLE attendance ADD COLUMN reg_number VARCHAR"))

    # Check fees table for reg_number
    if "fees" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("fees")]
        with engine.begin() as conn:
            if "reg_number" not in columns:
                conn.execute(text("ALTER TABLE fees ADD COLUMN reg_number VARCHAR"))

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
app.include_router(chat.router,prefix="/chat",tags=["Chat"])
@app.get("/")
def root():
    return {"message":"smart campus-portal is live now..!"}
@app.get("/health")
def read_health():
    return{"status": "ok"}
 
