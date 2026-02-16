# 🏢 Employee Attendance Management System

A full-stack Attendance Management System built using modern web technologies with secure authentication and role-based access control.

---

## 🚀 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt (Password Hashing)
* CSV Writer

### Frontend

* React.js
* Axios
* React Router DOM

---

## 🔐 Authentication & Security

* JWT-based authentication
* Password hashing using bcrypt
* Strong password validation:

  * Minimum 8 characters
  * At least 1 uppercase letter
  * At least 1 lowercase letter
  * At least 1 number
  * At least 1 special character
* Gmail-only registration (@gmail.com)
* Role-based route protection
* Protected CSV export endpoint

---

## 👨‍💼 Employee Features

* Secure Login / Registration
* Check In
* Check Out
* Automatic late detection (after 9:30 AM)
* Half-day detection (less than 4 hours)
* View Today’s Attendance Status
* View Monthly Summary
* View Full Attendance History

---

## 🧑‍💼 Manager Features

* View all employee attendance records
* Dashboard summary statistics
* Filter attendance records
* View employee-wise attendance
* Export attendance data as CSV file

---

## 🏗 System Architecture

React Frontend
⬇
Express REST API
⬇
MongoDB Database

---

## 📂 Project Structure

### Backend

```
server/
│
├── models/
├── middleware/
├── routes/
├── server.js
└── .env
```

### Frontend

```
src/
├── App.js
├── AuthPage.js
├── EmployeePage.js
├── ManagerPage.js
└── api.js
```

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```
git clone https://github.com/YuvaneshV12/Tap-Academy.git
cd TAP
```

---

### 2️⃣ Backend Setup

```
cd server
npm install
```

Start Backend:

```
npm start
```

---

### 3️⃣ Frontend Setup

```
cd attendance-frontend
npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

Backend runs at:

```
http://localhost:5000
```

---

## 📊 API Endpoints

### Authentication

* POST `/api/auth/register`
* POST `/api/auth/login`
* GET `/api/auth/me`

### Employee Attendance

* POST `/api/attendance/checkin`
* POST `/api/attendance/checkout`
* GET `/api/attendance/my-history`
* GET `/api/attendance/my-summary`
* GET `/api/attendance/today`

### Manager

* GET `/api/attendance/all`
* GET `/api/attendance/summary`
* GET `/api/attendance/export`

---

## 📄 CSV Export

Managers can export attendance records as:

```
attendance.csv
```

Exported file includes:

* Employee Name
* Date
* Attendance Status
* Total Working Hours

---

## 🧠 Business Logic

* Late if check-in is after 9:30 AM
* Half-day if total working hours < 4
* Unique employeeId enforced
* Role-based authorization (employee / manager)

---

## 🌟 Future Enhancements

* Email verification (OTP)
* Forgot password feature
* Dashboard analytics with charts
* Department-wise reporting
* Pagination and advanced filters
* Docker support
* Deployment on AWS / Vercel / Render

---

## Thank You Tap Academy for this opportunity