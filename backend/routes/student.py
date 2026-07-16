from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Student,Marks,Attendance,Fee
from backend.auth import get_current_student
router=APIRouter()
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
                #"subject":m.subject,
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