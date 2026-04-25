# Examination Management System (EMS)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61dafb)
![Node](https://img.shields.io/badge/backend-Node.js-339933)
![MySQL](https://img.shields.io/badge/database-MySQL-4479a1)

## 📌 Project Overview

The **Examination Management System (EMS)** is a robust, full-stack web application designed to streamline the complex processes of academic examination scheduling, allocation, and communication. It provides a centralized platform for administrators, faculty, and students to manage timetables, notifications, and academic records efficiently.

---

## 🚀 Key Features

### 👥 User Roles & Dashboards
The system features a tailored experience for 7 distinct user roles:
- **Academic Supervisor**: High-level oversight, approval workflows, system configuration and department staff management.
- **Dean**: approve forms and faculty staff management.
- **Faculty Staff**: Handling timetable, hall attendants allocations, generate admission forms and attendance sheet.
- **Department Staff**: View personalized timetable and ask concerns, generate marking sheet.
- **Hall Attendants**: View assigned duties and concerns.
- **Students**: Personalized timetables, deadline notifications, and handle forms.
- **Batch Representatives**: Coordination between students and academic supervisor.

Email notifications to important steps.

### 📅 Examination Scheduling
- Automated and manual allocation of examination halls and timeslots.
- Conflict detection (overlapping exams).
- Publication workflow for draft and final timetables.

### 🔔 Communication & Notifications
- **Automated Emails**: Notifications via Nodemailer for account approvals and timetable publications.
- **Internal Alerts**: Real-time dashboard notifications for deadlines and updates.
- **Document Export**: PDF generation for personalized timetables and reports using `jspdf`.

---

## 🛠️ Tech Stack

- **Frontend**: [React.js](https://reactjs.org/) (Vite), [Tailwind CSS](https://tailwindcss.com/) for modern, responsive UI.
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/).
- **Database**: [MySQL](https://www.mysql.com/) managed via [Sequelize ORM](https://sequelize.org/).
- **Authentication**: Secure JWT-based authentication and Bcrypt password hashing.
- **Others**: `node-cron` for scheduled tasks, `Multer` for file uploads.

---

## 📸 Screenshots Gallery

| Feature | Screenshot |
|---------|------------|
| **Login Page** | ![Login Screen](docs/screenshots/login.png) |
| **Academic Supervisor Dashboard** | ![Academic Supervisor Dashboard](docs/screenshots/dashboard.png) |
| **Timetable Allocation** | ![Allocation View](docs/screenshots/allocation.png) |
| **Student Timetable** | ![Student View](docs/screenshots/student_view.png) |
| **Generate Reports** | ![Generate Reports](docs/screenshots/generate_reports.png) |
| **Personalized Timetable of Department Staff** | ![Personalized Timetable of Department Staff](docs/screenshots/department_staff_timetable.png) |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MySQL Server

### 1. Database Setup
- Create a MySQL database named `ems_db` (or as configured in `.env`).
- Import the provided schema scripts from the `/database` folder if available.

### 2. Backend Configuration
```bash
cd server
npm install
# Create a .env file based on .env.example
npm run dev
```

### 3. Frontend Configuration
```bash
cd client
npm install
npm run dev
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
