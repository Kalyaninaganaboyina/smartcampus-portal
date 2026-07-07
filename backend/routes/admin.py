from fastapi import APIRouter,Depends, File,HTTPException, UploadFile,status
from sqlalchemy.orm import Session
from backend import models,schemas
from backend.database import get_db
from backend.auth import hash_password,verify_password,create_access_token
import pandas as pd
router=APIRouter(prefix="/admin",tags=["Admin"])

# Register Admin
@router.post("/register", response_model=schemas.AdminResponse)
def register_admin(admin: schemas.AdminRegister, db: Session = Depends(get_db)):
    existing_admin = db.query(models.Admin).filter(models.Admin.email == admin.email).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_admin = models.Admin(name=admin.name, email=admin.email, password=hash_password(admin.password))
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

# Login Admin
@router.post("/login")
def login_admin(admin: schemas.AdminLogin, db: Session = Depends(get_db)):
    db_admin = db.query(models.Admin).filter(models.Admin.email == admin.email).first()
    if not db_admin or not verify_password(admin.password, db_admin.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": db_admin.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/upload-marks")
def upload_marks(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    df = pd.read_csv(file.file)

    required_columns = {"student_id", "subject", "internal_marks", "external_marks"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail="CSV must contain student_id, subject, internal_marks, external_marks")

    for _, row in df.iterrows():
        new_mark = models.Marks(
            student_id=row["student_id"],
            subject=row["subject"],
            internal_marks=row["internal_marks"],
            external_marks=row["external_marks"]
        )
        db.add(new_mark)
    db.commit()
    return {"message": "Marks uploaded successfully"}
@router.post("/upload-attendance")
def upload_attendance(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    df = pd.read_csv(file.file)
    required_columns = {"student_id", "total_days", "attended_days", "absent_days"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail="CSV must contain,student_id, total_days, attended_days, absent_days")

    for _, row in df.iterrows():
        new_attendance = models.Attendance(
            student_id =int(row["student_id"]),
            total_days=int(row["total_days"]),
            attended_days=int(row["attended_days"]),
            absent_days=int(row["absent_days"])
        )
        db.add(new_attendance)
    db.commit()
    return {"message": "Attendance uploaded successfully"}
@router.post("/upload-fees")
def upload_fees(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    df = pd.read_csv(file.file)
    required_columns = {"student_id", "total_fee", "paid_fee", "due_fee"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail="CSV must contain student_id, total_fee, paid_fee, due_fee")

    for _, row in df.iterrows():
        new_fee = models.Fee(
            student_id=int(row["student_id"]),
            total_fee=float(row["total_fee"]),
            paid_fee=float(row["paid_fee"]),
            due_fee=float(row["due_fee"])
        )
        db.add(new_fee)
    db.commit()
    return {"message": "Fees uploaded successfully"}
