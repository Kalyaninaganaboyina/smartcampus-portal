from fastapi import APIRouter, Depends
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from backend import models
from backend.database import get_db

load_dotenv()

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

router = APIRouter(tags=["Chat"])

class ChatRequest(BaseModel):
    message: str
    user_name: str
    language: str = "en-IN"  # "en-IN", "te-IN", "en-US"

@router.post("")
def handle_chat(req: ChatRequest, db: Session = Depends(get_db)):
    msg = req.message.lower().strip()
    user = req.user_name
    lang = req.language or "en-IN"
    is_telugu = lang.startswith("te") or any("\u0c00" <= c <= "\u0c7f" for c in req.message)

    # 1. Fetch student info from DB
    student = db.query(models.Student).filter(models.Student.name == user).first()
    if not student:
        student = db.query(models.Student).filter(models.Student.reg_number == user.upper()).first()
    if not student:
        student = db.query(models.Student).filter(models.Student.email == user.lower()).first()
    if not student:
        local_part = user.split('@')[0]
        student = db.query(models.Student).filter(models.Student.reg_number == local_part.upper()).first()

    student_context = ""
    marks = []
    att = []
    fee = None

    if student:
        marks = db.query(models.Marks).filter(models.Marks.student_id == student.id).all()
        marks_str = "\n".join([f"- {m.subject}: Internal {m.internal_marks}, External {m.external_marks}" for m in marks]) if marks else "No marks loaded yet."
        
        att = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).all()
        att_str = "\n".join([f"- Total Days: {a.total_days}, Attended Days: {a.attended_days}, Attendance Percentage: {round(a.attended_days / a.total_days * 100, 2)}%" for a in att]) if att else "No attendance loaded yet."
        
        fee = db.query(models.Fee).filter(models.Fee.student_id == student.id).first()
        fee_str = f"- Total Fee: {fee.total_fee}, Paid Fee: {fee.paid_fee}, Due Fee: {fee.due_fee}" if fee else "No fee loaded yet."
        
        student_context = f"""
Official database records for student '{student.name}' (Roll Number: {student.reg_number}):
- Branch: {student.branch}
- Course: {student.course}
- Year of Study: Year {student.year}
- Email: {student.email}
- Phone Number: {student.phone_no or 'N/A'}

Grades/Marks: {marks_str}
Attendance: {att_str}
Fees: {fee_str}
"""

    widget = None

    # Detect topics & populate graphical widget
    if any(k in msg for k in ["attendance", "హాజరు", "అటెండెన్స్", "present", "absent"]):
        att_item = att[0] if att else None
        tot_days = att_item.total_days if att_item else 100
        att_days = att_item.attended_days if att_item else 88
        pct = round((att_days / tot_days) * 100, 1)
        status = "Safe" if pct >= 75 else "At Risk"

        widget = {
            "type": "attendance",
            "title": "Attendance Status",
            "data": {
                "total_days": tot_days,
                "attended_days": att_days,
                "percentage": pct,
                "status": status
            }
        }
        if is_telugu:
            reply = f"నమస్కారం {user}! మీ హాజరు (Attendance) {pct}% గా ఉంది. మీరు {att_days}/{tot_days} రోజులు హాజరయ్యారు. ({status} స్టేటస్)"
        else:
            reply = f"Hello {user}! Your attendance is {pct}% ({att_days}/{tot_days} days attended). You are in {status} standing."

    elif any(k in msg for k in ["mark", "grade", "score", "మార్కులు", "గ్రేడ్", "gpa"]):
        m_list = []
        if marks:
            for m in marks:
                m_list.append({
                    "subject": m.subject,
                    "internal": m.internal_marks,
                    "external": m.external_marks,
                    "total": m.internal_marks + m.external_marks
                })
        else:
            m_list = [
                {"subject": "DBMS", "internal": 42, "external": 88, "total": 130},
                {"subject": "FLAT", "internal": 40, "external": 82, "total": 122},
                {"subject": "Web Dev Lab", "internal": 48, "external": 92, "total": 140}
            ]

        widget = {
            "type": "marks",
            "title": "Academic Marks Breakdown",
            "data": {
                "gpa": 8.42,
                "items": m_list
            }
        }
        if is_telugu:
            reply = f"నమస్కారం {user}! మీ అకాడమిక్ మార్కుల సారాంశం మరియు GPA (8.42/10) క్రింద విజువల్ చార్ట్‌లో ఇవ్వబడ్డాయి."
        else:
            reply = f"Here is your academic performance breakdown and current GPA (8.42 / 10)."

    elif any(k in msg for k in ["fee", "due", "payment", "ఫీజు", "బకాయి", "చెల్లింపు"]):
        tf = fee.total_fee if fee else 75000
        pf = fee.paid_fee if fee else 75000
        df = fee.due_fee if fee else 0
        f_status = "Paid" if df == 0 else "Pending"

        widget = {
            "type": "fees",
            "title": "Semester Fee Dues",
            "data": {
                "total_fee": tf,
                "paid_fee": pf,
                "due_fee": df,
                "status": f_status
            }
        }
        if is_telugu:
            reply = f"నమస్కారం {user}! మొత్తం ఫీజు ₹{tf:,.0f}, చెల్లించినది ₹{pf:,.0f}, బకాయి ఫీజు ₹{df:,.0f}. ({f_status})"
        else:
            reply = f"Your fee summary: Total ₹{tf:,.0f}, Paid ₹{pf:,.0f}, Remaining Due ₹{df:,.0f}. Status: {f_status}."

    elif any(k in msg for k in ["profile", "roll", "branch", "course", "ప్రొఫైల్", "వివరాలు"]):
        widget = {
            "type": "profile",
            "title": "Student Registration Card",
            "data": {
                "name": student.name if student else user,
                "reg_number": student.reg_number if student else "22A51A0501",
                "branch": student.branch if student else "Computer Science & Engineering",
                "course": student.course if student else "B.Tech",
                "year": student.year if student else 3
            }
        }
        if is_telugu:
            reply = f"మీ ప్రొఫైల్ వివరాలు మరియు రిజిస్ట్రేషన్ కార్డు క్రింద చూడండి:"
        else:
            reply = f"Here are your registered profile details and digital student badge:"

    elif any(k in msg for k in ["class", "timetable", "schedule", "క్లాస్", "షెడ్యూల్"]):
        widget = {
            "type": "classes",
            "title": "Today's Class Schedule",
            "data": {
                "items": [
                    {"time": "09:00 - 10:30 AM", "subject": "Database Management Systems", "room": "CSE LH-302", "active": True},
                    {"time": "10:45 - 12:15 PM", "subject": "Formal Languages & Automata", "room": "CSE LH-302", "active": False},
                    {"time": "01:30 - 03:00 PM", "subject": "Web Development Lab", "room": "Lab 4", "active": False},
                    {"time": "03:15 - 04:30 PM", "subject": "Soft Skills & Professional Ethics", "room": "Seminar Hall 1", "active": False}
                ]
            }
        }
        if is_telugu:
            reply = f"ఈరోజు మీ క్లాసుల షెడ్యూల్ క్రింది టైమ్‌లైన్‌లో చూడవచ్చు:"
        else:
            reply = f"Here is your class schedule for today:"

    else:
        # Check Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if HAS_GEMINI and api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                
                lang_instruction = "Respond in Telugu language using clear Telugu script." if is_telugu else "Respond in clear Indian English."
                system_instruction = f"""
You are the Smart Campus AI Assistant.
User: '{user}'.
Language Directive: {lang_instruction}
{student_context}
Provide a clear, helpful reply.
"""
                prompt = f"{system_instruction}\n\nUser message: {req.message}"
                response = model.generate_content(prompt)
                reply = response.text.strip()
            except Exception as e:
                print(f"[DEBUG AI CHAT] Gemini failed: {e}")
                reply = f"నమస్కారం {user}! హాజరు (Attendance), మార్కులు (Marks), లేదా ఫీజు (Fees) గురించి నన్ను అడగండి." if is_telugu else f"Hello {user}! Ask me about your attendance, marks, fees, or class schedule!"
        else:
            if is_telugu:
                reply = f"నమస్కారం {user}! నేను మీ స్మార్ట్ క్యాంపస్ AI అసిస్టెంట్ ని. మీ అటెండెన్స్, మార్కులు, ఫీజులు, లేదా క్లాసుల గురించి నన్ను అడగవచ్చు."
            else:
                reply = f"Hello {user}! I am your Smart Campus AI Assistant. Ask me about your attendance, marks, fee dues, or class schedule!"

    return {"reply": reply, "widget": widget}
