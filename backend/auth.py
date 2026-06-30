from passlib.context import CryptContext
from jose import JWTError,jwt
from datetime import datetime,timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends,HTTPException,status
from sqlalchemy.orm import Session
from backend.database import get_db
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)
def verify_password(plain_password: str,hashed_password:str) -> bool:
    return pwd_context.verify(plain_password,hashed_password)
def create_access_token(data:dict) -> str:
    to_encode=data.copy()
    expire=datetime.utcnow() + timedelta(minutes =ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
def decode_access_token(token: str):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/auth/login")
def get_current_student(
        token: str = Depends(oauth2_scheme),
        db: Session =Depends(get_db)
):
    credentials_exception =HTTPException(
        status_code =status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate":"Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str =payload.get("sub")
    if email is None:
        raise credentials_exception
    from backend.models import Student
    student =db.query(Student).filter(Student.email ==email).first()
    if student is None:
        raise credentials_exception
    return student