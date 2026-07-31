from sqlalchemy import Column,Integer,String,Float,ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from  .database import Base
Base=declarative_base()
class Student(Base):
    __tablename__="student"
    id=Column(Integer,primary_key=True,index=True)
    reg_number=Column("roll_number",String,unique=True,index=True,nullable=False)
    name=Column(String,nullable=False)
   # age=Column(Integer,nullable=False)
    branch=Column(String)
    year=Column(Integer)
    course=Column(String)
    phone_no=Column(String)
    email=Column(String,unique=True,nullable=False)
    address=Column(String)
    password=Column(String,nullable=False)
    bio_pdf_path=Column(String)

    @property
    def roll_number(self) -> str:
        return self.reg_number
class Fee(Base):
    __tablename__="fees"
    id=Column(Integer,primary_key=True,index=True)
    student_id=Column(Integer,ForeignKey("student.id"))
    reg_number=Column(String,ForeignKey("student.roll_number"))
    total_fee=Column(Float)
    paid_fee=Column(Float)
    due_fee=Column(Float)
class Marks(Base):
    __tablename__="marks"
    id=Column(Integer,primary_key=True,index=True)
    student_id=Column(Integer,ForeignKey("student.id"))
    reg_number=Column(String,ForeignKey("student.roll_number"))
    subject=Column(String)
    internal_marks=Column(Float)
    external_marks=Column(Float)
class Attendance(Base):
    __tablename__="attendance"
    id=Column(Integer,primary_key=True,index=True)
    student_id=Column(Integer,ForeignKey("student.id"))
    reg_number=Column(String,ForeignKey("student.roll_number"))
    total_days=Column(Integer)
    attended_days=Column(Integer)
    absent_days=Column(Integer)
    
class Admin(Base):
    __tablename__="admins"

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    email=Column(String,unique=True,index=True,nullable=False)
    password=Column(String,nullable=False)

class Faculty(Base):
    __tablename__="faculty"

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    email=Column(String,unique=True,index=True,nullable=False)
    password=Column(String,nullable=False)
    department=Column(String,nullable=False)
    designation=Column(String)
    phone_no=Column(String)
    address=Column(String)

class UploadedPDF(Base):
    __tablename__="uploaded_pdfs"

    id=Column(Integer,primary_key=True,index=True)
    student_id=Column(Integer,ForeignKey("student.id"))
    filename=Column(String,nullable=False)
    filepath=Column(String,nullable=False)
    uploaded_at=Column(String,nullable=False)

