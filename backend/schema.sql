-- School Management System Database Schema

CREATE DATABASE school_management;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users / Staff table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'accountant')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_url VARCHAR(500),
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  class VARCHAR(50) NOT NULL,
  section VARCHAR(10),
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  address TEXT,
  blood_group VARCHAR(10),
  transport_route VARCHAR(100),
  admission_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fees table
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  total_fee DECIMAL(10,2) NOT NULL,
  paid_fee DECIMAL(10,2) DEFAULT 0,
  pending_fee DECIMAL(10,2) GENERATED ALWAYS AS (total_fee - paid_fee) STORED,
  due_date DATE,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending')),
  month VARCHAR(20),
  year INT,
  receipt_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marks table
CREATE TABLE marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  exam_name VARCHAR(100) NOT NULL,
  marks_obtained DECIMAL(5,2) NOT NULL,
  total_marks DECIMAL(5,2) NOT NULL,
  grade VARCHAR(5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'holiday')),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_fees_student_id ON fees(student_id);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_marks_student_id ON marks(student_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Seed default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('School Admin', 'admin@school.com', '$2a$10$L8nGBFQ8B3O6G5H4K2X3Z.YhJ0Y1m2n3o4p5q6r7s8t9u0v1w2x3y4z', 'admin'),
('John Teacher', 'teacher@school.com', '$2a$10$L8nGBFQ8B3O6G5H4K2X3Z.YhJ0Y1m2n3o4p5q6r7s8t9u0v1w2x3y4z', 'teacher'),
('Jane Accountant', 'accountant@school.com', '$2a$10$L8nGBFQ8B3O6G5H4K2X3Z.YhJ0Y1m2n3o4p5q6r7s8t9u0v1w2x3y4z', 'accountant');
