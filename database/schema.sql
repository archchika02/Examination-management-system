-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'BatchRep', 'FacultyStaff', 'DeptStaff', 'Dean', 'HallAttendant', 'AcademicSupervisor') NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Details (Extension of Users)
CREATE TABLE student_details (
    user_id INT PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    level VARCHAR(10),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Courses/Modules
CREATE TABLE courses (
    course_code VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    type ENUM('Compulsory', 'Optional', 'Auxiliary') NOT NULL,
    semester INT NOT NULL COMMENT '1 or 2',
    level VARCHAR(10)
);

-- Course Enrollments/Registrations
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    type ENUM('Normal', 'Repeat', 'Medical') NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    rejection_reason TEXT,
    payment_receipt_path VARCHAR(255), -- For Repeat
    medical_letter_path VARCHAR(255), -- For Medical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id),
    FOREIGN KEY (course_code) REFERENCES courses(course_code)
);

-- Exam Timetables
CREATE TABLE exam_timetables (
    timetable_id INT AUTO_INCREMENT PRIMARY KEY,
    batch VARCHAR(50),
    academic_year VARCHAR(10),
    semester INT,
    status ENUM('Draft', 'Final') DEFAULT 'Draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Exam Slots (Specific exams in a timetable)
CREATE TABLE exam_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    timetable_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    date DATE,
    start_time TIME,
    end_time TIME,
    venue VARCHAR(100),
    FOREIGN KEY (timetable_id) REFERENCES exam_timetables(timetable_id) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES courses(course_code)
);

-- Exam Staff Allocations (Supervisors, Invigilators, Hall Attendants)
CREATE TABLE allocations (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('Supervisor', 'Invigilator', 'HallAttendant') NOT NULL,
    status ENUM('Assigned', 'Confirmed', 'ConcernRaised') DEFAULT 'Assigned',
    concern_message TEXT,
    FOREIGN KEY (slot_id) REFERENCES exam_slots(slot_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Password Resets
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Verifications
CREATE TABLE email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);
