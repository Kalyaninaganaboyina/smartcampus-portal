from pydantic import BaseModel,EmailStr
 
class StudentLogin(BaseModel):
    email:EmailStr
    password:str
 
class AdminRegister(BaseModel):
    name:str
    email:EmailStr
    password:str
class AdminLogin(BaseModel):
    email:EmailStr
    password:str
class TokenResponse(BaseModel):
    access_token:str
    token_type:str
class AdminResponse(BaseModel):
    id:int
    name:str
    email:EmailStr
    class Config:
        from_attributes = True
class StudentResponse(BaseModel):
    id: int
    reg_number: str   # ✅ include reg_number in response
    name: str
    email: EmailStr
    branch: str
    year: int
    course: str
    phone_no: str
    address: str
    class Config:
        from_attributes = True
class MarksCreate(BaseModel):
    student_id: int
    subject: str
    internal_marks: int
    external_marks: int

class MarksResponse(MarksCreate):
    id: int
    class Config:
        from_attributes = True
class AttendanceCreate(BaseModel):
    student_id: int
    total_days: int
    attended_days: int
    absent_days: int

class AttendanceResponse(AttendanceCreate):
    id: int
    class Config:
        from_attributes = True
class FeeCreate(BaseModel):
    student_id: int
    total_fee: float
    paid_fee: float
    due_fee: float
class FeeResponse(FeeCreate):
    id: int
    class Config:
        from_attributes = True