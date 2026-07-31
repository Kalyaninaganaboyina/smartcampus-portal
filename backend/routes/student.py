from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Student,Marks,Attendance,Fee
from backend.auth import get_current_student, verify_password, hash_password
from backend.schemas import SetNameRequest, StudentUpdate, StudentResponse, ChangePasswordRequest
router=APIRouter()

@router.put("/set-name")
def set_student_name(
    payload: SetNameRequest,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Save the student's full name and optional branch/course/year."""
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    current_student.name = name
    if payload.branch:
        current_student.branch = payload.branch.strip()
    if payload.course:
        current_student.course = payload.course.strip()
    if payload.year:
        current_student.year = payload.year

    db.commit()
    db.refresh(current_student)
    return {
        "message": "Student details saved successfully",
        "id": current_student.id,
        "reg_number": current_student.reg_number,
        "name": current_student.name,
        "branch": current_student.branch,
        "course": current_student.course,
        "year": current_student.year,
    }


@router.get("/profile")
def get_profile(current_student:Student =Depends(get_current_student)):
    return{
        "id":current_student.id,
        "reg_number":current_student.reg_number,
        "name":current_student.name,
        "email":current_student.email,
        "branch":current_student.branch,
        "year":current_student.year,
        "course":current_student.course,
        "phone_no":current_student.phone_no,
        "address":current_student.address
    }

@router.put("/profile", response_model=StudentResponse)
def update_profile(
    payload: StudentUpdate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        current_student.name = payload.name.strip()
    if payload.email is not None:
        current_student.email = payload.email.strip()
    if payload.branch is not None:
        current_student.branch = payload.branch
    if payload.year is not None:
        current_student.year = payload.year
    if payload.course is not None:
        current_student.course = payload.course
    if payload.phone_no is not None:
        current_student.phone_no = payload.phone_no
    if payload.address is not None:
        current_student.address = payload.address

    db.commit()
    db.refresh(current_student)
    return current_student

@router.get("/profile/marks")
def get_marks(
    current_student: Student = Depends(get_current_student),
    db:Session=Depends(get_db)
):
    marks=db.query(Marks).filter(
        Marks.reg_number == current_student.reg_number
    ).all()
    if not marks:
       raise HTTPException(status_code=404, detail="No marks found")  
    return {
        "student":current_student.name,
        "marks":[
            {
                "subject":m.subject,
                "internal":m.internal_marks,
                "external":m.external_marks,
                "total":m.internal_marks+m.external_marks
            }
            for m in marks
        ]
    }
@router.get("/profile/attendance")
def get_attendance(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    attendance = db.query(Attendance).filter(
        Attendance.student_id == current_student.id
    ).all()
    if not attendance:
       raise HTTPException(status_code=404, detail="No attendance records found")
    return {
        "student": current_student.name,
        "attendance": [
            {
                 #"subject":a.subject,
                 "total_days":a.total_days,
                 "attended_days":a.attended_days,
                 "percentage":round((a.attended_days/a.total_days)*100,2),
                 "status":"Safe" if (a.attended_days/a.total_days)*100 >= 75 else "At Risk"
            }
            for a in attendance
        ]
    }
@router.get("/profile/fees")
def get_fees(
    current_student: Student=Depends(get_current_student),
    db:Session =Depends(get_db)

):
    fees=db.query(Fee).filter(
        Fee.student_id ==current_student.id
    ).first()
    if not fees:
        raise HTTPException(status_code=404, detail="No fee details found")
    return {
        "student":current_student.name,
        "total_fee":fees.total_fee,
        "paid_fee":fees.paid_fee,
        "due_fee":fees.due_fee,
        #"due_date":fees.due_date,
        "status":"Paid" if fees.due_fee ==0 else "Pending"

    }

@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    if not verify_password(payload.current_password, current_student.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long")
        
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
        
    current_student.password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}