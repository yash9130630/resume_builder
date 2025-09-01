# Resume Optimization Feature - Implementation Contracts

## API Contracts

### 1. Resume Upload & Analysis API
**Endpoint:** `POST /api/optimize/upload`
- **Input:** 
  - `file`: PDF/DOCX resume file (multipart/form-data)
  - `job_description`: Text string of job description
- **Output:**
  ```json
  {
    "analysis_id": "unique_id",
    "extracted_text": "resume content...",
    "status": "uploaded",
    "file_type": "pdf|docx"
  }
  ```

### 2. Resume Optimization API
**Endpoint:** `POST /api/optimize/analyze`
- **Input:**
  ```json
  {
    "analysis_id": "unique_id",
    "job_description": "job requirements...",
    "extracted_resume": "resume text..."
  }
  ```
- **Output:**
  ```json
  {
    "analysis_id": "unique_id",
    "optimization_report": {
      "missing_keywords": ["python", "aws", "docker"],
      "suggested_improvements": ["Add cloud experience", "Highlight leadership skills"],
      "ats_score": 85,
      "keyword_matches": 12
    },
    "optimized_resume": {
      "personal_info": {...},
      "summary": "optimized summary...",
      "experience": [...],
      "skills": [...]
    },
    "status": "optimized"
  }
  ```

### 3. Resume Download API
**Endpoint:** `GET /api/optimize/download/{analysis_id}`
- **Query Params:** `format=pdf|docx`
- **Output:** File download stream

## Frontend Implementation

### Step-by-Step Wizard Components:
1. **Step 1: Upload Resume** (`/optimize` route)
   - File upload dropzone for PDF/DOCX
   - Job description textarea
   - Basic validation

2. **Step 2: Analysis** (`/optimize/analysis`)
   - Loading screen with progress
   - Display extracted resume content
   - Show job description analysis

3. **Step 3: Optimization Results** (`/optimize/results`)
   - Side-by-side comparison (original vs optimized)
   - ATS score and improvements
   - Missing keywords highlighted

4. **Step 4: Download** (`/optimize/download`)
   - Download buttons for PDF/DOCX
   - Option to edit further or start over

## Backend Dependencies to Add:
- `emergentintegrations` - LLM integration
- `pypdf2` or `pdfplumber` - PDF text extraction
- `python-docx` - DOCX parsing and generation
- `reportlab` - PDF generation
- `python-multipart` - File upload handling

## Database Models:
```python
class OptimizationSession(BaseModel):
    id: str
    user_id: str = None
    original_filename: str
    extracted_text: str
    job_description: str
    optimization_report: dict
    optimized_content: dict
    created_at: datetime
    status: str  # uploaded, analyzing, optimized, downloaded
```

## Mock Data Replacement:
- Remove mock PDF export from `mockData.js`
- Replace with actual API calls to optimization endpoints
- Add new route `/optimize` to React Router

## Integration Points:
1. **File Processing:** Server-side parsing of uploaded resumes
2. **AI Analysis:** Use GPT-4o-mini via Emergent LLM for content optimization
3. **Document Generation:** Generate ATS-friendly PDF/DOCX files
4. **Progress Tracking:** Real-time status updates during processing

## Error Handling:
- File format validation
- File size limits (max 10MB)
- AI API timeout handling
- Malformed resume parsing errors
- Job description validation