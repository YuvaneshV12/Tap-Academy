import { useEffect, useState } from "react"
import api from "./api"

export default function EmployeePage() {
  const [today, setToday] = useState(null)
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const t = await api.get("/attendance/today")
    const h = await api.get("/attendance/my-history")
    const s = await api.get("/attendance/my-summary")

    setToday(t.data)
    setHistory(h.data)
    setSummary(s.data)
  }

  const checkIn = async () => {
    await api.post("/attendance/checkin")
    fetchData()
  }

  const checkOut = async () => {
    await api.post("/attendance/checkout")
    fetchData()
  }

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Employee Dashboard</h2>
      <button onClick={logout}>Logout</button>

      <h3>Today</h3>
      <button onClick={checkIn}>Check In</button>
      <button onClick={checkOut}>Check Out</button>

      {today && <p>Status: {today.status}</p>}

      <h3>Summary (This Month)</h3>
      {summary && (
        <>
          <p>Present: {summary.present}</p>
          <p>Late: {summary.late}</p>
          <p>Half Day: {summary.halfDay}</p>
          <p>Total Hours: {summary.totalHours}</p>
        </>
      )}

      <h3>History</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {history.map((r) => (
            <tr key={r._id}>
              <td>{r.date}</td>
              <td>{r.status}</td>
              <td>{r.totalHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
