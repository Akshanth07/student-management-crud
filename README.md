# Student Management System

A premium, modern Student Management CRUD (Create, Read, Update, Delete) web application. This project uses a **FastAPI** backend, a **PostgreSQL** database (via `psycopg2`), and a vanilla **HTML/CSS/JavaScript** frontend designed with a responsive glassmorphism theme.

---

## Project Structure

```text
student-management/
│
├── backend/
│   ├── main.py            # FastAPI main application & CORS setup
│   ├── database.py        # PostgreSQL connectivity and raw SQL queries
│   ├── models.py          # Pydantic validation schemas
│   └── requirements.txt   # Python project dependencies
│
├── frontend/
│   ├── index.html         # Portal dashboard skeleton (HTML5)
│   ├── style.css          # Glassmorphism styling and animations (CSS3)
│   └── script.js          # Fetch API logic and DOM interactions (ES6+)
│
├── schema.sql             # SQL Script to create the database table
└── README.md              # Project setup & usage guide (This file)
```

---

## Features

- **Responsive Grid Dashboard**: Gorgeous design styled with custom typography, gradients, animations, and translucent cards.
- **Full CRUD Endpoints**: Add, read, update, and delete students with instant table updates.
- **In-Memory Live Filter**: Instantly search students by ID, name, email, or phone.
- **Database Status Indicator**: Automatic periodic polling to confirm database connectivity.
- **Beautiful Toast Alerts**: Sliding notifications providing feedback for operations (success, error, loading).

---

## Step-by-Step Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python** (version 3.8 or higher)
- **PostgreSQL** (version 12 or higher)

---

### 2. Database Setup

1. Open your PostgreSQL administration client (e.g., pgAdmin or `psql` shell).
2. Create a new database named `student_db`:
   ```sql
   CREATE DATABASE student_db;
   ```
3. Connect to the `student_db` database and run the queries defined in the [schema.sql](schema.sql) file:
   ```sql
   CREATE TABLE students (
       id SERIAL PRIMARY KEY,
       first_name VARCHAR(100) NOT NULL,
       last_name VARCHAR(100) NOT NULL,
       email VARCHAR(150) UNIQUE NOT NULL,
       phone VARCHAR(20)
   );

   -- (Optional) Seed the table with some initial dummy data
   INSERT INTO students (first_name, last_name, email, phone) 
   VALUES 
   ('John', 'Doe', 'john.doe@example.com', '123-456-7890'),
   ('Jane', 'Smith', 'jane.smith@example.com', '987-654-3210');
   ```

---

### 3. Backend (FastAPI) Setup

1. Open a terminal (PowerShell, Command Prompt, or bash) and navigate to the `backend` folder:
   ```bash
   cd student-management/backend
   ```

2. (Recommended) Create and activate a Python virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # Windows Command Prompt
   python -m venv venv
   .\venv\Scripts\activate.bat

   # macOS/Linux Bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Database Credentials:
   By default, the backend checks for environment variables or falls back to standard PostgreSQL defaults:
   - Host: `localhost`
   - Database Name: `student_db`
   - Username: `postgres`
   - Password: `postgres`
   - Port: `5432`

   If your configuration differs, create a `.env` file inside the `backend/` directory with your specific credentials:
   ```env
   DB_HOST=localhost
   DB_NAME=student_db
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will start running on **`http://127.0.0.1:8000`**. You can view the interactive API documentation at `http://127.0.0.1:8000/docs`.

---

### 4. Frontend Setup

1. The frontend is built using standard web files and interacts with the API via the standard `fetch()` utility.
2. You can run the frontend in any of the following ways:
   - **Double-click** the `frontend/index.html` file to open it directly in your web browser.
   - **Use VSCode's Live Server extension** to serve the `frontend/` directory.
   - **Use a Python command** in another terminal inside the `frontend/` folder:
     ```bash
     cd student-management/frontend
     python -m http.server 8080
     ```
     Then open **`http://localhost:8080`** in your browser.

---

## API Endpoints List

- **`GET /`**: Health Check showing if server is running.
- **`GET /students`**: Fetches all student records from PostgreSQL.
- **`POST /students`**: Creates a new student record (Validates unique email address).
- **`PUT /students/{id}`**: Updates information for the student matching the provided ID.
- **`DELETE /students/{id}`**: Permanently deletes a student record.
