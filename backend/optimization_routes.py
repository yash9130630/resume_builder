from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, Optional
import uuid
import os
from datetime import datetime
import shutil
from optimization_service import OptimizationService
from motor.motor_asyncio import AsyncIOMotorClient
import logging

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

router = APIRouter(prefix="/api/optimize", tags=["optimization"])

# Initialize optimization service
optimization_service = OptimizationService()

# Pydantic models
class OptimizationSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_filename: str
    extracted_text: str
    job_description: str
    analysis: Optional[Dict] = None
    optimized_content: Optional[Dict] = None
    status: str = "uploaded"  # uploaded, analyzing, optimized, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    file_paths: Optional[Dict[str, str]] = None

class UploadResponse(BaseModel):
    session_id: str
    original_filename: str
    extracted_text: str
    status: str
    message: str

class AnalysisResponse(BaseModel):
    session_id: str
    analysis: Dict
    optimized_content: Dict
    status: str
    message: str

class SessionStatus(BaseModel):
    session_id: str
    status: str
    progress: int
    message: str

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=UploadResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """Upload resume file and job description for optimization"""
    
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in ['pdf', 'docx', 'doc']:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload PDF or DOCX files only."
        )
    
    # Validate file size (10MB limit)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File size too large. Maximum 10MB allowed.")
    
    # Validate job description
    if not job_description or len(job_description.strip()) < 50:
        raise HTTPException(
            status_code=400, 
            detail="Job description is required and must be at least 50 characters long."
        )
    
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Save uploaded file
        upload_dir = "/app/backend/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, f"{session_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create initial session record
        session_data = OptimizationSession(
            id=session_id,
            original_filename=file.filename,
            extracted_text="",  # Will be populated during processing
            job_description=job_description,
            status="uploaded"
        )
        
        # Save to database
        await db.optimization_sessions.insert_one(session_data.dict())
        
        # Start background processing
        background_tasks.add_task(
            process_resume_background, 
            session_id, 
            file_path, 
            job_description
        )
        
        return UploadResponse(
            session_id=session_id,
            original_filename=file.filename,
            extracted_text="Processing...",
            status="uploaded",
            message="File uploaded successfully. Processing will begin shortly."
        )
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def process_resume_background(session_id: str, file_path: str, job_description: str):
    """Background task to process resume optimization"""
    try:
        # Update status to analyzing
        await db.optimization_sessions.update_one(
            {"id": session_id},
            {"$set": {"status": "analyzing", "updated_at": datetime.utcnow()}}
        )
        
        # Process resume
        result = await optimization_service.process_resume(file_path, job_description)
        
        # Update status to optimized
        await db.optimization_sessions.update_one(
            {"id": session_id},
            {
                "$set": {
                    "extracted_text": result["extracted_text"],
                    "analysis": result["analysis"],
                    "optimized_content": result["optimized_content"],
                    "status": "optimized",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Generate documents
        file_paths = await optimization_service.generate_documents(
            result["optimized_content"], 
            session_id
        )
        
        # Update with file paths and mark as completed
        await db.optimization_sessions.update_one(
            {"id": session_id},
            {
                "$set": {
                    "file_paths": file_paths,
                    "status": "completed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)
            
    except Exception as e:
        logger.error(f"Background processing error for session {session_id}: {str(e)}")
        # Update status to failed
        await db.optimization_sessions.update_one(
            {"id": session_id},
            {
                "$set": {
                    "status": "failed",
                    "error_message": str(e),
                    "updated_at": datetime.utcnow()
                }
            }
        )

@router.get("/status/{session_id}", response_model=SessionStatus)
async def get_optimization_status(session_id: str):
    """Get the current status of optimization process"""
    
    session = await db.optimization_sessions.find_one({"id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate progress based on status
    progress_map = {
        "uploaded": 10,
        "analyzing": 30,
        "optimized": 80,
        "completed": 100,
        "failed": 0
    }
    
    status_messages = {
        "uploaded": "File uploaded, starting analysis...",
        "analyzing": "Analyzing resume and optimizing content...",
        "optimized": "Content optimized, generating documents...",
        "completed": "Optimization completed successfully!",
        "failed": f"Optimization failed: {session.get('error_message', 'Unknown error')}"
    }
    
    return SessionStatus(
        session_id=session_id,
        status=session["status"],
        progress=progress_map.get(session["status"], 0),
        message=status_messages.get(session["status"], "Processing...")
    )

@router.get("/results/{session_id}", response_model=AnalysisResponse)
async def get_optimization_results(session_id: str):
    """Get the optimization results for a session"""
    
    session = await db.optimization_sessions.find_one({"id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session["status"] not in ["optimized", "completed"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Results not ready. Current status: {session['status']}"
        )
    
    return AnalysisResponse(
        session_id=session_id,
        analysis=session.get("analysis", {}),
        optimized_content=session.get("optimized_content", {}),
        status=session["status"],
        message="Optimization results retrieved successfully"
    )

@router.get("/download/{session_id}")
async def download_optimized_resume(session_id: str, format: str = "pdf"):
    """Download the optimized resume in specified format"""
    
    if format not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'docx'")
    
    session = await db.optimization_sessions.find_one({"id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Download not ready. Current status: {session['status']}"
        )
    
    file_paths = session.get("file_paths", {})
    file_path = file_paths.get(format)
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Optimized {format.upper()} file not found")
    
    # Determine content type
    content_type = "application/pdf" if format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    filename = f"optimized_resume_{session_id}.{format}"
    
    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename
    )

@router.delete("/session/{session_id}")
async def delete_optimization_session(session_id: str):
    """Delete optimization session and associated files"""
    
    session = await db.optimization_sessions.find_one({"id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Clean up files
    file_paths = session.get("file_paths", {})
    for file_path in file_paths.values():
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to delete file {file_path}: {str(e)}")
    
    # Delete from database
    await db.optimization_sessions.delete_one({"id": session_id})
    
    return {"message": "Session deleted successfully"}

@router.get("/sessions")
async def list_optimization_sessions(limit: int = 10, skip: int = 0):
    """List recent optimization sessions"""
    
    sessions = await db.optimization_sessions.find(
        {},
        {"_id": 0}  # Exclude MongoDB _id field
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"sessions": sessions, "count": len(sessions)}