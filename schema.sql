-- SQL Script to set up the Student Management Database

-- Step 1: Create the database (Run this as a superuser, e.g., postgres)
-- CREATE DATABASE student_db;

-- Step 2: Connect to the student_db database and run the following to create the table:
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20)
);

-- (Optional) Insert some dummy seed data for testing
INSERT INTO students (first_name, last_name, email, phone) 
VALUES 
('John', 'Doe', 'john.doe@example.com', '123-456-7890'),
('Jane', 'Smith', 'jane.smith@example.com', '987-654-3210')
ON CONFLICT (email) DO NOTHING;
