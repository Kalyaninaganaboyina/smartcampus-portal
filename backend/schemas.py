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
    is_default_password:bool = False
    name_set:bool = True

class SetNameRequest(BaseModel):
    name: str
    branch: str | None = None
    course: str | None = None
    year: int | None = None

class AdminResponse(BaseModel):
    id:int
    name:str
    email:EmailStr
    class Config:
        from_attributes = True
class StudentResponse(BaseModel):
    id: int
    reg_number: str | None = None
    roll_number: str | None = None
    name: str | None = None
    email: EmailStr
    branch: str | None = None
    year: int | None = None
    course: str | None = None
    phone_no: str | None = None
    address: str | None = None
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

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch: str
    year: int
    course: str
    phone_no: str | None = None
    address: str | None = None

class StudentUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    branch: str | None = None
    year: int | None = None
    course: str | None = None
    phone_no: str | None = None
    address: str | None = None

class FacultyCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    designation: str | None = None
    phone_no: str | None = None
    address: str | None = None

class FacultyUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    department: str | None = None
    designation: str | None = None
    phone_no: str | None = None
    address: str | None = None

class FacultyResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str
    designation: str | None = None
    phone_no: str | None = None
    address: str | None = None
    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
