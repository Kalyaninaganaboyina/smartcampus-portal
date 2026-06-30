from pydantic import BaseModel,EmailStr
class StudentRegister(BaseModel):
    name:str
    email:EmailStr
    password:str
    branch:str
    year:int
    course:str
    phone_no:str
    address:str
class StudentLogin(BaseModel):
    email:EmailStr
    password:str
class TokenResponse(BaseModel):
    access_token:str
    token_type:str