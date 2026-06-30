from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Student
from fastapi.security import OAuth2PasswordRequestForm
from backend.schemas import StudentRegister,StudentLogin,TokenResponse
from backend.auth import (create_access_token,hash_password,verify_password)
router=APIRouter()
@router.post("/register")
def register(student:StudentRegister,db: Session = Depends(get_db)):
    existing=db.query(Student).filter(Student.email==student.email).first()
    if existing:
        raise HTTPException(status_code=400,detail="Email already registered")
    new_student=Student(
        name=student.name,
        email=student.email,
        password=hash_password(student.password),
        branch=student.branch,
        year=student.year,
        course=student.course,
        phone_no=student.phone_no,
        address=student.address

    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return {"message":"Student registered successfully","id":new_student.id}
@router.post("/login",response_model=TokenResponse)
def login(credentials: StudentLogin,db:Session=Depends(get_db)):
    student=db.query(Student).filter(Student.email==credentials.email).first()
    if not student:
        raise HTTPException(status_code=404,detail="Student not found")
    if not verify_password(credentials.password,student.password):
        raise HTTPException(status_code=401,detail="Incorrect password")
    token=create_access_token(data={"sub":student.email})
    return {"access_token":token,"token_type":"bearer"}

 