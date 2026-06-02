import psycopg2
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Import our Pydantic schemas and database helpers
from models import StudentCreate, StudentUpdate, StudentResponse
import database

# Initialize the FastAPI App
app = FastAPI(
    title="Student Management API",
    description="A simple CRUD API for managing student records using FastAPI and PostgreSQL.",
    version="1.0.0"
)

# Configure CORS Middleware
# Allowing '*' is suitable for local development. In production, specify exact origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
def read_root():
    """
    Root endpoint to verify the API server status.
    """
    return {
        "status": "online",
        "message": "Student Management API is running. Visit /docs for the interactive API documentation."
    }

@app.get("/students", response_model=List[StudentResponse], tags=["Students"])
def get_students():
    """
    Fetch all student records from the database.
    """
    try:
        students = database.get_all_students()
        return students
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@app.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED, tags=["Students"])
def create_student(student: StudentCreate):
    """
    Create a new student record. Validates email uniqueness.
    """
    # 1. Check if email already exists
    try:
        existing_student = database.get_student_by_email(student.email)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during validation: {str(e)}"
        )
        
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A student with email '{student.email}' already exists."
        )

    # 2. Insert into database
    try:
        new_student = database.create_student(
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            phone=student.phone
        )
        return new_student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create student: {str(e)}"
        )

@app.put("/students/{id}", response_model=StudentResponse, tags=["Students"])
def update_student(id: int, student: StudentUpdate):
    """
    Update details of an existing student by their ID.
    """
    # 1. Verify student exists
    try:
        existing_student = database.get_student_by_id(id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during verification: {str(e)}"
        )
        
    if not existing_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {id} not found."
        )

    # 2. Check email collision with other students
    try:
        email_owner = database.get_student_by_email(student.email)
        if email_owner and email_owner["id"] != id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{student.email}' is already in use by another student."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during email check: {str(e)}"
        )

    # 3. Perform update
    try:
        updated_student = database.update_student(
            student_id=id,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            phone=student.phone
        )
        return updated_student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update student: {str(e)}"
        )

@app.delete("/students/{id}", tags=["Students"])
def delete_student(id: int):
    """
    Delete a student record by ID.
    """
    try:
        deleted = database.delete_student(id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID {id} not found."
            )
        return {"message": f"Student with ID {id} was successfully deleted."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete student: {str(e)}"
        )
