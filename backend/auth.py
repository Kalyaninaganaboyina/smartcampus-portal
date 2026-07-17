import bcrypt
from jose import JWTError,jwt
from datetime import datetime,timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends,HTTPException,status
from sqlalchemy.orm import Session
from backend.database import get_db
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
def create_access_token(data:dict) -> str:
    to_encode=data.copy()
    expire=datetime.utcnow() + timedelta(minutes =ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
def decode_access_token(token: str):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        print(f"[DEBUG JWT] Token decoded successfully. Payload: {payload}")
        return payload
    except JWTError as e:
        print(f"[DEBUG JWT] JWTError occurred while decoding token: {e}")
        return None
oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/auth/login")
def get_current_student(
        token: str = Depends(oauth2_scheme),
        db: Session =Depends(get_db)
):
    print(f"[DEBUG AUTH] get_current_student called with token: {token[:15]}...")
    credentials_exception =HTTPException(
        status_code =status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate":"Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        print("[DEBUG AUTH] Student token payload is None")
        raise credentials_exception
    email: str =payload.get("sub")
    if email is None:
        print("[DEBUG AUTH] Student token sub (email) is None")
        raise credentials_exception
    from backend.models import Student
    student =db.query(Student).filter(Student.email ==email).first()
    if student is None:
        print(f"[DEBUG AUTH] Student with email {email} not found in database")
        raise credentials_exception
    print(f"[DEBUG AUTH] Student {email} validated successfully")
    return student

def get_current_admin(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    print(f"[DEBUG AUTH] get_current_admin called with token: {token[:15]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        print("[DEBUG AUTH] Admin token payload is None")
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        print("[DEBUG AUTH] Admin token sub (email) is None")
        raise credentials_exception
    from backend.models import Admin
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin is None:
        print(f"[DEBUG AUTH] Admin with email {email} not found in database. Raising 403.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    print(f"[DEBUG AUTH] Admin {email} validated successfully")
    return admin
