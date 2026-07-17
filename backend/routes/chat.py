from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["Chat"])

class ChatRequest(BaseModel):
    message: str
    user_name: str

@router.post("")
def handle_chat(req: ChatRequest):
    msg = req.message.lower()
    user = req.user_name

    # Intelligent automated replies for campus questions
    if "hi" in msg or "hello" in msg or "hey" in msg:
        reply = f"Hello {user}! I am your Smart Campus Assistant. How can I help you today?"
    elif "attendance" in msg:
        reply = "You can track your academic attendance from the Attendance panel. Make sure to keep your attendance above 75% to avoid being flagged as 'At Risk'."
    elif "marks" in msg or "grade" in msg or "score" in msg or "subject" in msg:
        reply = "Your internal and external marks are listed under the Academics/Marks section. You can review individual subject performances and overall results there."
    elif "fee" in msg or "due" in msg or "payment" in msg:
        reply = "Your semester fee dashboard displays the total fees, amount paid, and remaining dues. Dues must be cleared before the semester examinations."
    elif "profile" in msg or "details" in msg or "branch" in msg or "course" in msg:
        reply = "You can view and verify all personal information (such as branch, course, and email) directly from your Profile page."
    elif "pdf" in msg or "upload" in msg:
        reply = "If you are an administrator, you can add new students by uploading their Bio PDFs in the Admin Panel. The system will automatically parse and store their details."
    elif "help" in msg or "support" in msg:
        reply = "I can guide you through the Smart Campus Portal features. Try asking me about your 'attendance', 'marks', 'fees', or 'profile'!"
    else:
        reply = f"Thank you for your message, {user}. I am here to help you with your Smart Campus Portal. You can check your attendance, academic grades, and due fees from the sidebar tabs."

    return {"reply": reply}
