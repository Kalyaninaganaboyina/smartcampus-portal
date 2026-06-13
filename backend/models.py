from sqlalchemy import Column,Integer,String,Float,ForeignKey
from sqlalchemy.ext.declarative import declarative_base
Base=declarative_base()
class Student(Base):
    __tablename__="students"
    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    age=Column(Integer,nullable=False)
    branch=Column(String)
    year=Column(Integer)
    course=Column(String)
    ph_no=Column(Integer)
    email=Column(String,unique=True,nullable=False)
    address=Column(String)
    password=Column(String,nullable=False)
class fee(Base):
    __tablename__="Fees"
    id=Column(Integer,primary_key=True,index=True)
    student_id=Column(Integer,ForeignKey("students.id"))
    total_fee=Column(Float)
    paid_fee=Column(Float)
    due_fee=Column(Float)
class Marks(Base):
    __tablename__="marks"
    id=Column(Integer,primary_key=True,index=True)
    student_id=Column(Integer,ForeignKey("students.id"))
    internal_marks=Column(Float)
    external_marks=Column(Float)
class Attendance(Base):
    __tablename__="attendance"
    id=Column(Integer,primary_key=True,index=True)
    student_id=Column(Integer,ForeignKey("students.id"))
    total_days=Column(Integer)
    attended_days=Column(Integer)
    absent_days=Column(Integer)
