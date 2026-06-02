import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Database Connection Configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "student_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")

def get_db_connection():
    """
    Establishes and returns a connection to the PostgreSQL database.
    """
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        raise e

def get_all_students():
    """
    Fetches all student records from the database.
    """
    conn = get_db_connection()
    try:
        # Use RealDictCursor to return results as dictionaries (key-value pairs)
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, first_name, last_name, email, phone FROM students ORDER BY id ASC;")
            return cur.fetchall()
    finally:
        conn.close()

def get_student_by_id(student_id: int):
    """
    Fetches a single student record by their ID.
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, first_name, last_name, email, phone FROM students WHERE id = %s;",
                (student_id,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def get_student_by_email(email: str):
    """
    Fetches a student record by their email (useful for validation).
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, first_name, last_name, email, phone FROM students WHERE email = %s;",
                (email,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def create_student(first_name: str, last_name: str, email: str, phone: str = None):
    """
    Inserts a new student record into the database.
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO students (first_name, last_name, email, phone)
                VALUES (%s, %s, %s, %s)
                RETURNING id, first_name, last_name, email, phone;
                """,
                (first_name, last_name, email, phone)
            )
            new_student = cur.fetchone()
            conn.commit()
            return new_student
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def update_student(student_id: int, first_name: str, last_name: str, email: str, phone: str = None):
    """
    Updates an existing student record in the database.
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                UPDATE students
                SET first_name = %s, last_name = %s, email = %s, phone = %s
                WHERE id = %s
                RETURNING id, first_name, last_name, email, phone;
                """,
                (first_name, last_name, email, phone, student_id)
            )
            updated_student = cur.fetchone()
            conn.commit()
            return updated_student
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def delete_student(student_id: int):
    """
    Deletes a student record from the database by ID.
    Returns True if a row was deleted, False otherwise.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM students WHERE id = %s;", (student_id,))
            # rowcount tells us how many rows were affected by the query
            deleted_rows = cur.rowcount
            conn.commit()
            return deleted_rows > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
