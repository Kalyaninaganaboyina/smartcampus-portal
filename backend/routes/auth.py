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
    
    is_default = verify_password("123456789", student.password)
    token=create_access_token(data={"sub":student.email})
    # name_set is False when name is blank or still the default placeholder
    name_set = bool(student.name and student.name.strip() and student.name.strip() not in ("", "Unknown", "Student"))
    return {"access_token":token,"token_type":"bearer","is_default_password":is_default,"name_set":name_set}

 