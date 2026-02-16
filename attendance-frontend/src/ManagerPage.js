import { useEffect, useState } from "react"
import api from "./api"

export default function ManagerPage() {
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const r = await api.get("/attendance/all")
    const s = await api.get("/attendance/summary")
    setRecords(r.data)
    setSummary(s.data)
  }

  const exportCSV = async () => {
  try {
    const response = await api.get("/attendance/export", {
      responseType: "blob"
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "attendance.csv")
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error(error)
    alert("Export failed")
  }
}


  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Manager Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {summary && (
        <>
          <p>Total Employees: {summary.totalEmployees}</p>
          <p>Present Today: {summary.presentToday}</p>
          <p>Late Today: {summary.lateToday}</p>
        </>
      )}

      <button onClick={exportCSV}>Export CSV</button>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.userId.name}</td>
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
