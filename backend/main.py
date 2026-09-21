
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

def seed_initial_data():
    from sqlalchemy.orm import Session
    from backend.database import SessionLocal
    from backend.models import Student, Attendance, Marks, Fee
    from backend.auth import hash_password

    db: Session = SessionLocal()
    try:
        # Check if 23AJ1A4255 exists
        pwd_hash = hash_password("123456789")
        student_4255 = db.query(Student).filter(Student.email == "23aj1a4255@amritasai.org.in").first()
        if not student_4255:
            student_4255 = Student(
                reg_number="23AJ1A4255",
                name="THOTA MAHESH",
                email="23aj1a4255@amritasai.org.in",
                branch="CSM",
                year=4,
                course="B.Tech",
                password=pwd_hash,
                phone_no="9876543210",
                address="Vijayawada"
            )
            db.add(student_4255)
            db.commit()
            db.refresh(student_4255)
            
        # Seed default demo students if total students < 5
        demo_students = [
            ("23AJ1A0501", "Ravi Kumar", "ravi@example.com", "CSE", 3, "B.Tech"),
            ("23AJ1A0502", "Anita Sharma", "anita@example.com", "ECE", 2, "B.Tech"),
            ("24AJ1A4255", "Student 4255", "24aj1a4255@amritasai.org.in", "CSM", 3, "B.Tech"),
            ("25AJ1A4255", "Student 4255", "25aj1a4255@amritasai.org.in", "CSM", 2, "B.Tech")
        ]
        for r_num, s_name, s_email, s_br, s_yr, s_cr in demo_students:
            if not db.query(Student).filter(Student.email == s_email).first():
                db.add(Student(
                    reg_number=r_num,
                    name=s_name,
                    email=s_email,
                    branch=s_br,
                    year=s_yr,
                    course=s_cr,
                    password=pwd_hash,
                    phone_no="",
                    address=""
                ))
        db.commit()

        # Seed Attendance, Fee, and Marks for all students missing them
        all_students = db.query(Student).all()
        for st in all_students:
            # Attendance
            att = db.query(Attendance).filter(Attendance.student_id == st.id).first()
            if not att:
                db.add(Attendance(
                    student_id=st.id,
                    reg_number=st.reg_number,
                    total_days=120,
                    attended_days=106 if "4255" in st.reg_number else 100,
                    absent_days=14 if "4255" in st.reg_number else 20
                ))

            # Fees
            fee = db.query(Fee).filter(Fee.student_id == st.id).first()
            if not fee:
                db.add(Fee(
                    student_id=st.id,
                    reg_number=st.reg_number,
                    total_fee=75000.0,
                    paid_fee=75000.0 if "4255" in st.reg_number else 50000.0,
                    due_fee=0.0 if "4255" in st.reg_number else 25000.0
                ))

            # Marks
            m_count = db.query(Marks).filter(Marks.student_id == st.id).count()
            if m_count == 0:
                subjects = [
                    ("Database Management Systems", 45, 80),
                    ("Formal Languages & Automata Theory", 42, 78),
                    ("Web Development Laboratory", 48, 90),
                    ("Artificial Intelligence", 44, 82)
                ]
                for subj, int_m, ext_m in subjects:
                    db.add(Marks(
                        student_id=st.id,
                        reg_number=st.reg_number,
                        subject=subj,
                        internal_marks=float(int_m),
                        external_marks=float(ext_m)
                    ))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

run_migrations()
seed_initial_data()

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
 
