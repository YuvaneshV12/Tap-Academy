require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const { createObjectCsvWriter } = require("csv-writer")

const app = express()
app.use(express.json())
app.use(cors())

// --------------------
// MongoDB Connection
// --------------------
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo Connected"))
.catch(err => console.log(err))

// --------------------
// User Schema
// --------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["employee", "manager"] },
  employeeId: { type: String, unique: true },
  department: String,
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model("User", userSchema)

// --------------------
// Attendance Schema
// --------------------
const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  checkInTime: Date,
  checkOutTime: Date,
  status: { type: String, enum: ["present", "late", "half-day"] },
  totalHours: Number,
  createdAt: { type: Date, default: Date.now }
})

const Attendance = mongoose.model("Attendance", attendanceSchema)

// --------------------
// Auth Middleware
// --------------------
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "No token" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}

// --------------------
// AUTH ROUTES
// --------------------

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, employeeId, department } = req.body

  const hash = await bcrypt.hash(password, 10)

  const user = new User({
    name,
    email,
    password: hash,
    role,
    employeeId,
    department
  })

  await user.save()
  res.json({ message: "Registered successfully" })
})

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ message: "User not found" })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ message: "Wrong password" })

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  )

  res.json({ token, user })
})

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password")
  res.json(user)
})

// --------------------
// CHECK IN
// --------------------
app.post("/api/attendance/checkin", auth, async (req, res) => {
  if (req.user.role !== "employee")
    return res.status(403).json({ message: "Only employee allowed" })

  const today = new Date().toISOString().split("T")[0]

  const existing = await Attendance.findOne({
    userId: req.user.id,
    date: today
  })

  if (existing)
    return res.status(400).json({ message: "Already checked in" })

  const now = new Date()
  let status = "present"

  // Late after 9:30 AM
  if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30)) {
    status = "late"
  }

  const attendance = new Attendance({
    userId: req.user.id,
    date: today,
    checkInTime: now,
    status
  })

  await attendance.save()
  res.json({ message: "Checked In", status })
})

// --------------------
// CHECK OUT
// --------------------
app.post("/api/attendance/checkout", auth, async (req, res) => {
  const today = new Date().toISOString().split("T")[0]

  const attendance = await Attendance.findOne({
    userId: req.user.id,
    date: today
  })

  if (!attendance)
    return res.status(400).json({ message: "Check in first" })

  attendance.checkOutTime = new Date()

  const hours =
    (attendance.checkOutTime - attendance.checkInTime) /
    (1000 * 60 * 60)

  attendance.totalHours = parseFloat(hours.toFixed(2))

  if (attendance.totalHours < 4) {
    attendance.status = "half-day"
  }

  await attendance.save()

  res.json({ message: "Checked Out", totalHours: attendance.totalHours })
})

// --------------------
// EMPLOYEE APIs
// --------------------

app.get("/api/attendance/my-history", auth, async (req, res) => {
  const records = await Attendance.find({ userId: req.user.id })
  res.json(records)
})

app.get("/api/attendance/today", auth, async (req, res) => {
  const today = new Date().toISOString().split("T")[0]
  const record = await Attendance.findOne({
    userId: req.user.id,
    date: today
  })

  res.json(record || { message: "Not checked in today" })
})

app.get("/api/attendance/my-summary", auth, async (req, res) => {
  const month = new Date().getMonth()
  const year = new Date().getFullYear()

  const records = await Attendance.find({ userId: req.user.id })

  const filtered = records.filter(r => {
    const d = new Date(r.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const present = filtered.filter(r => r.status === "present").length
  const late = filtered.filter(r => r.status === "late").length
  const halfDay = filtered.filter(r => r.status === "half-day").length

  const totalHours = filtered.reduce(
    (sum, r) => sum + (r.totalHours || 0),
    0
  )

  res.json({ present, late, halfDay, totalHours })
})

// --------------------
// MANAGER APIs
// --------------------

app.get("/api/attendance/all", auth, async (req, res) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Only manager allowed" })

  const { employeeId, date, status } = req.query

  let filter = {}
  if (date) filter.date = date
  if (status) filter.status = status

  let records = await Attendance.find(filter).populate("userId")

  if (employeeId) {
    records = records.filter(r => r.userId.employeeId === employeeId)
  }

  res.json(records)
})

app.get("/api/attendance/employee/:id", auth, async (req, res) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Only manager allowed" })

  const records = await Attendance.find({ userId: req.params.id })
  res.json(records)
})

app.get("/api/attendance/summary", auth, async (req, res) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Only manager allowed" })

  const today = new Date().toISOString().split("T")[0]

  const totalEmployees = await User.countDocuments({ role: "employee" })
  const todayRecords = await Attendance.find({ date: today })

  const presentToday = todayRecords.filter(r => r.status === "present").length
  const lateToday = todayRecords.filter(r => r.status === "late").length

  res.json({ totalEmployees, presentToday, lateToday })
})

app.get("/api/attendance/today-status", auth, async (req, res) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Only manager allowed" })

  const today = new Date().toISOString().split("T")[0]
  const records = await Attendance.find({ date: today }).populate("userId")
  res.json(records)
})

// --------------------
// EXPORT CSV
// --------------------
app.get("/api/attendance/export", auth, async (req, res) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Only manager allowed" })

  const records = await Attendance.find().populate("userId")

  const csvWriter = createObjectCsvWriter({
    path: "attendance.csv",
    header: [
      { id: "name", title: "Name" },
      { id: "date", title: "Date" },
      { id: "status", title: "Status" },
      { id: "hours", title: "Total Hours" }
    ]
  })

  const data = records.map(r => ({
    name: r.userId.name,
    date: r.date,
    status: r.status,
    hours: r.totalHours
  }))

  await csvWriter.writeRecords(data)

  res.download("attendance.csv")
})

// --------------------
// DASHBOARD APIs
// --------------------

app.get("/api/dashboard/employee", auth, async (req, res) => {
  const records = await Attendance.find({ userId: req.user.id })

  const totalHours = records.reduce(
    (sum, r) => sum + (r.totalHours || 0),
    0
  )

  res.json({
    totalDays: records.length,
    totalHours
  })
})

app.get("/api/dashboard/manager", auth, async (req, res) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Only manager allowed" })

  const totalEmployees = await User.countDocuments({ role: "employee" })
  const totalAttendance = await Attendance.countDocuments()

  res.json({ totalEmployees, totalAttendance })
})

// --------------------
// START SERVER
// --------------------
app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
)
