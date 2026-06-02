from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Base schema containing common fields for a Student
class StudentBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100, description="First name of the student")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name of the student")
    email: EmailStr = Field(..., max_length=150, description="Valid email address of the student")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number of the student")

# Schema for creating a student (same as base schema)
class StudentCreate(StudentBase):
    pass

# Schema for updating a student's information
class StudentUpdate(StudentBase):
    pass

# Schema for returning student details (includes the auto-incremented ID)
class StudentResponse(StudentBase):
    id: int

    # Config to support ORM-like conversion if needed (Pydantic v2 compatible)
    model_config = {
        "from_attributes": True
    }
