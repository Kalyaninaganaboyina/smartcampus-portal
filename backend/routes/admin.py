from fastapi import APIRouter,Depends, File,HTTPException, UploadFile,status
from sqlalchemy.orm import Session
from backend import models,schemas
from backend.database import get_db
from backend.auth import hash_password,verify_password,create_access_token,get_current_admin
import pandas as pd
import os
from datetime import datetime
import pypdf

router=APIRouter(tags=["Admin"])

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

@router.post("/upload-students")
def upload_students(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_csv(file.file)
    for _, row in df.iterrows():
        # Derive reg_number from email (first 10 chars, uppercase)
        reg_number = row["email"].split('@')[0][:10].upper()
        student = models.Student(
            reg_number=reg_number,
            name=row["name"],
            email=row["email"],
            branch=row["branch"],
            year=row["year"],
            course=row["course"],
            phone_no=row["phone_no"],
            address=row["address"],
            password=hash_password(row["password"])  # or generate random
        )
        db.add(student)
    db.commit()
    return {"message": "Students uploaded successfully"}

@router.post("/upload-marks")
def upload_marks(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    df = pd.read_csv(file.file)

    required_columns = {"reg_number", "subject", "internal_marks", "external_marks"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail="CSV must contain reg_number, subject, internal_marks, external_marks")

    for _, row in df.iterrows():
        student = db.query(models.Student).filter(models.Student.reg_number ==row["reg_number"]).first()
        if not student:
            raise HTTPException(status_code=400, detail=f"Student with ID {row['reg_number']} not found")

        new_mark = models.Marks(
            student_id=student.id,
            reg_number=student.reg_number,
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
    required_columns = {"reg_number", "total_days", "attended_days", "absent_days"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail="CSV must contain,reg_number, total_days, attended_days, absent_days")

    for _, row in df.iterrows():
        student = db.query(models.Student).filter(models.Student.reg_number == row["reg_number"]).first()
        if not student:
            raise HTTPException(status_code=400, detail=f"Student with reg_number {row['reg_number']} not found")

        new_attendance = models.Attendance(
            student_id=student.id,
            reg_number=student.reg_number,
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
    required_columns = {"reg_number", "total_fee", "paid_fee", "due_fee"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail="CSV must contain reg_number, total_fee, paid_fee, due_fee")

    for _, row in df.iterrows():
        student = db.query(models.Student).filter(models.Student.reg_number == row["reg_number"]).first()
        if not student:
            raise HTTPException(status_code=400, detail=f"Student with reg_number {row['reg_number']} not found")

        new_fee = models.Fee(
            student_id=student.id,
            reg_number=student.reg_number,
            total_fee=float(row["total_fee"]),
            paid_fee=float(row["paid_fee"]),
            due_fee=float(row["due_fee"])
        )
        db.add(new_fee)
    db.commit()
    return {"message": "Fees uploaded successfully"}

# Student Management Endpoints
@router.get("/students", response_model=list[schemas.StudentResponse])
def get_students(db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    return db.query(models.Student).all()

@router.post("/students", response_model=schemas.StudentResponse)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    existing = db.query(models.Student).filter(models.Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this email already registered")
    
    # Derive reg_number from email (first 10 chars, uppercase)
    reg_number = student.email.split('@')[0][:10].upper()
    
    db_student = models.Student(
        reg_number=reg_number,
        name=student.name,
        email=student.email,
        password=hash_password(student.password),
        branch=student.branch,
        year=student.year,
        course=student.course,
        phone_no=student.phone_no,
        address=student.address
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.put("/students/{student_id}", response_model=schemas.StudentResponse)
def update_student(student_id: int, student_data: schemas.StudentUpdate, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    for key, value in student_data.dict(exclude_unset=True).items():
        if key == "password" and value:
            student.password = hash_password(value)
        elif key != "password":
            setattr(student, key, value)
            if key == "email":
                # Derive reg_number from email (first 10 chars, uppercase)
                student.reg_number = value.split('@')[0][:10].upper()
    
    db.commit()
    db.refresh(student)
    return student

@router.delete("/students/all")
def delete_all_students(db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    db.query(models.Marks).delete()
    db.query(models.Attendance).delete()
    db.query(models.Fee).delete()
    db.query(models.UploadedPDF).delete()
    db.query(models.Student).delete()
    db.commit()
    return {"message": "All students and associated records deleted successfully"}

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.query(models.Marks).filter(models.Marks.student_id == student_id).delete()
    db.query(models.Attendance).filter(models.Attendance.student_id == student_id).delete()
    db.query(models.Fee).filter(models.Fee.student_id == student_id).delete()
    db.query(models.UploadedPDF).filter(models.UploadedPDF.student_id == student_id).delete()
    
    db.delete(student)
    db.commit()
    return {"message": "Student and all associated records deleted successfully"}

# Faculty Management Endpoints
@router.get("/faculty", response_model=list[schemas.FacultyResponse])
def get_faculty(db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    return db.query(models.Faculty).all()

@router.post("/faculty", response_model=schemas.FacultyResponse)
def create_faculty(fac: schemas.FacultyCreate, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    existing = db.query(models.Faculty).filter(models.Faculty.email == fac.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Faculty with this email already registered")
    
    db_faculty = models.Faculty(
        name=fac.name,
        email=fac.email,
        password=hash_password(fac.password),
        department=fac.department,
        designation=fac.designation,
        phone_no=fac.phone_no,
        address=fac.address
    )
    db.add(db_faculty)
    db.commit()
    db.refresh(db_faculty)
    return db_faculty

@router.put("/faculty/{faculty_id}", response_model=schemas.FacultyResponse)
def update_faculty(faculty_id: int, fac_data: schemas.FacultyUpdate, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    fac = db.query(models.Faculty).filter(models.Faculty.id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    
    for key, value in fac_data.dict(exclude_unset=True).items():
        if key == "password" and value:
            fac.password = hash_password(value)
        elif key != "password":
            setattr(fac, key, value)
    
    db.commit()
    db.refresh(fac)
    return fac

@router.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    fac = db.query(models.Faculty).filter(models.Faculty.id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    db.delete(fac)
    db.commit()
    return {"message": "Faculty member deleted successfully"}

# Student Import via PDF
@router.post("/upload-student-pdf")
def upload_student_pdf(file: UploadFile = File(...), db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    os.makedirs("backend/uploads", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = os.path.basename(file.filename)
    filepath = f"backend/uploads/{timestamp}_{filename}"
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    
    try:
        reader = pypdf.PdfReader(filepath)
        students_added = 0
        for page in reader.pages:
            text = page.extract_text()
            if not text:
                continue
            lines = text.strip().split("\n")
            for line in lines:
                tokens = line.strip().split()
                if len(tokens) >= 5:
                    if "RollNumber" in tokens or "RollNo" in tokens or "email" in tokens or "Email" in tokens:
                        continue
                    
                    try:
                        year = int(tokens[-2])
                        course = tokens[-1]
                        branch = tokens[-3]
                        
                        # Find the email token (token containing '@')
                        email = next((t for t in tokens if "@" in t), None)
                        if not email:
                            continue
                        
                        # Derive roll_number from email (first 10 chars, uppercase)
                        roll_number = email.split('@')[0][:10].upper()
                        
                        # Determine name from tokens between index 2 and branch (index -3).
                        # If no name is provided, use the email prefix as a default.
                        name_tokens = tokens[2:-3]
                        if name_tokens:
                            name = " ".join(name_tokens)
                        else:
                            name = email.split('@')[0].upper()
                        
                        existing = db.query(models.Student).filter(models.Student.email == email).first()
                        if existing:
                            continue
                        
                        new_student = models.Student(
                            reg_number=roll_number,
                            name=name,
                            email=email,
                            password=hash_password("123456789"),
                            branch=branch,
                            year=year,
                            course=course,
                            bio_pdf_path=os.path.abspath(filepath)
                        )
                        db.add(new_student)
                        db.commit()
                        db.refresh(new_student)
                        
                        uploaded_pdf = models.UploadedPDF(
                            student_id=new_student.id,
                            filename=file.filename,
                            filepath=os.path.abspath(filepath),
                            uploaded_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        )
                        db.add(uploaded_pdf)
                        db.commit()
                        
                        students_added += 1
                    except Exception as e:
                        db.rollback()
                        print(f"Skipping line error: {e}")
                        continue
        return {"message": f"Successfully parsed PDF and added {students_added} students"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

