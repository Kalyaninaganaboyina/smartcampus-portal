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

@router.post("")
def handle_chat(req: ChatRequest, db: Session = Depends(get_db)):
    msg = req.message.lower()
    user = req.user_name

    # 1. Fetch student info from DB to build rich context
    student = db.query(models.Student).filter(models.Student.name == user).first()
    if not student:
        student = db.query(models.Student).filter(models.Student.reg_number == user.upper()).first()
    if not student:
        student = db.query(models.Student).filter(models.Student.email == user.lower()).first()
    if not student:
        local_part = user.split('@')[0]
        student = db.query(models.Student).filter(models.Student.reg_number == local_part.upper()).first()

    student_context = ""
    if student:
        # Query marks
        marks = db.query(models.Marks).filter(models.Marks.student_id == student.id).all()
        marks_str = "\n".join([f"- {m.subject}: Internal {m.internal_marks}, External {m.external_marks}" for m in marks]) if marks else "No marks loaded yet."
        
        # Query attendance
        att = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).all()
        att_str = "\n".join([f"- Total Days: {a.total_days}, Attended Days: {a.attended_days}, Attendance Percentage: {round(a.attended_days / a.total_days * 100, 2)}%" for a in att]) if att else "No attendance loaded yet."
        
        # Query fees
        fee = db.query(models.Fee).filter(models.Fee.student_id == student.id).first()
        fee_str = f"- Total Fee: {fee.total_fee}, Paid Fee: {fee.paid_fee}, Due Fee: {fee.due_fee}" if fee else "No fee loaded yet."
        
        student_context = f"""
Official database records for student '{student.name}' (Roll Number: {student.reg_number}):
- Branch: {student.branch}
- Course: {student.course}
- Year of Study: Year {student.year}
- Email: {student.email}
- Phone Number: {student.phone_no or 'N/A'}
- Address: {student.address or 'N/A'}

Academic Grades / Marks:
{marks_str}

Attendance Record:
{att_str}

Semester Fee Dues:
{fee_str}
"""

    # 2. Check if Gemini API is configured
    api_key = os.getenv("GEMINI_API_KEY")
    if HAS_GEMINI and api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            system_instruction = f"""
You are the Smart Campus AI Assistant, a helpful and polite generative AI chatbot.
You are helping the student '{user}' in their college portal.
{student_context}
Instructions:
1. Provide extremely helpful, clear, and direct answers to the user's questions.
2. If the user asks about their grades, attendance, profile, or fees, use the official database records provided above to answer accurately.
3. Be conversational and concise, as your reply may be read aloud using Speech-to-Speech synthesis.
4. If asked about general topics or topics unrelated to the campus, answer them normally like ChatGPT.
"""
            prompt = f"{system_instruction}\n\nUser message: {req.message}"
            response = model.generate_content(prompt)
            return {"reply": response.text.strip()}
        except Exception as e:
            print(f"[DEBUG AI CHAT] Gemini execution failed: {e}")
            # Fall back to rule-based logic below on error

    # 3. Fallback Keyword Matcher (if Gemini is not configured or fails)
    # Intelligent automated replies for campus questions
    if "hi" in msg or "hello" in msg or "hey" in msg:
        reply = f"Hello {user}! I am your Smart Campus Assistant. (Note: Gemini AI is not configured. Ask me about attendance, marks, or fees!)"
    elif "attendance" in msg:
        if student and att:
            reply = f"Hi {user}, your attendance is: \n" + "\n".join([f"Attended {a.attended_days} out of {a.total_days} days ({round(a.attended_days / a.total_days * 100, 2)}%)." for a in att])
        else:
            reply = "You can track your academic attendance from the Attendance panel. Make sure to keep your attendance above 75% to avoid being flagged as 'At Risk'."
    elif "marks" in msg or "grade" in msg or "score" in msg or "subject" in msg:
        if student and marks:
            reply = f"Hi {user}, your marks are: \n" + "\n".join([f"{m.subject}: Internal {m.internal_marks}, External {m.external_marks}" for m in marks])
        else:
            reply = "Your internal and external marks are listed under the Academics/Marks section. You can review individual subject performances and overall results there."
    elif "fee" in msg or "due" in msg or "payment" in msg:
        if student and fee:
            reply = f"Hi {user}, your fee details: Total Semester Fee: {fee.total_fee}, Paid: {fee.paid_fee}, Due remaining: {fee.due_fee}."
        else:
            reply = "Your semester fee dashboard displays the total fees, amount paid, and remaining dues. Dues must be cleared before the semester examinations."
    elif "profile" in msg or "details" in msg or "branch" in msg or "course" in msg:
        if student:
            reply = f"Here are your registered details:\nRoll No: {student.reg_number}\nCourse: {student.course}\nBranch: {student.branch}\nYear: Year {student.year}\nEmail: {student.email}"
        else:
            reply = "You can view and verify all personal information (such as branch, course, and email) directly from your Profile page."
    elif "pdf" in msg or "upload" in msg:
        reply = "If you are an administrator, you can add new students by uploading their Bio PDFs in the Admin Panel. The system will automatically parse and store their details."
    elif "help" in msg or "support" in msg:
        reply = "I can guide you through the Smart Campus Portal features. Try asking me about your 'attendance', 'marks', 'fees', or 'profile'!"
    else:
        reply = f"Hi {user}. I am currently operating in offline mode because the Gemini API key is not configured in backend/.env. Please configure GEMINI_API_KEY to enable full AI ChatGPT capabilities!"

    return {"reply": reply}
