from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Student
from fastapi.security import OAuth2PasswordRequestForm
from backend.schemas import StudentLogin,TokenResponse
from backend.auth import (create_access_token,hash_password,verify_password)
router=APIRouter()
 
    
@router.post("/login",response_model=TokenResponse)
def login(credentials: StudentLogin,db:Session=Depends(get_db)):
    student=db.query(Student).filter(Student.email==credentials.email).first()
    if not student:
        raise HTTPException(status_code=404,detail="Student not found")
    if not verify_password(credentials.password,student.password):
        raise HTTPException(status_code=401,detail="Incorrect password")
    token=create_access_token(data={"sub":student.email})
    return {"access_token":token,"token_type":"bearer"}

 