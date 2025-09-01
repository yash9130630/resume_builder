from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import optimization routes
from optimization_routes import router as optimization_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Resume PDF Export
from fastapi.responses import FileResponse
from optimization_service import DocumentGenerator
import json

class ResumeExportRequest(BaseModel):
    resume_data: dict
    template_id: str

@api_router.post("/export/pdf")
async def export_resume_pdf(request: ResumeExportRequest):
    """Export resume data as PDF"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "/app/backend/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        export_id = str(uuid.uuid4())
        pdf_path = os.path.join(upload_dir, f"resume_export_{export_id}.pdf")
        
        # Convert resume data to the format expected by DocumentGenerator
        optimized_content = {
            "personal_info": {
                "name": request.resume_data.get("personalInfo", {}).get("fullName", ""),
                "email": request.resume_data.get("personalInfo", {}).get("email", ""),
                "phone": request.resume_data.get("personalInfo", {}).get("phone", ""),
                "location": request.resume_data.get("personalInfo", {}).get("location", ""),
                "linkedin": request.resume_data.get("personalInfo", {}).get("linkedin", ""),
                "website": request.resume_data.get("personalInfo", {}).get("website", "")
            },
            "summary": request.resume_data.get("summary", ""),
            "experience": [
                {
                    "company": exp.get("company", ""),
                    "position": exp.get("position", ""),
                    "location": exp.get("location", ""),
                    "start_date": exp.get("startDate", ""),
                    "end_date": exp.get("endDate", ""),
                    "achievements": exp.get("description", []) if isinstance(exp.get("description"), list) else exp.get("description", "").split('\n') if exp.get("description") else []
                }
                for exp in request.resume_data.get("experience", [])
            ],
            "education": [
                {
                    "institution": edu.get("institution", ""),
                    "degree": edu.get("degree", ""),
                    "location": edu.get("location", ""),
                    "graduation": f"{edu.get('startDate', '')} - {edu.get('endDate', '')}" if edu.get('startDate') and edu.get('endDate') else "",
                    "gpa": edu.get("gpa", "")
                }
                for edu in request.resume_data.get("education", [])
            ],
            "skills": {
                "technical": request.resume_data.get("skills", {}).get("technical", []),
                "soft": request.resume_data.get("skills", {}).get("soft", [])
            },
            "certifications": request.resume_data.get("certifications", [])
        }
        
        # Generate PDF using the DocumentGenerator
        generator = DocumentGenerator()
        generator.generate_pdf(optimized_content, pdf_path)
        
        # Return file for download
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"resume_{request.template_id}.pdf"
        )
        
    except Exception as e:
        logger.error(f"PDF export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")

# Include the optimization router
app.include_router(optimization_router)

# Include the main API router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()