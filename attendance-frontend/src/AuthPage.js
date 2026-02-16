import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "./api"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    employeeId: "",
    department: ""
  })

  const [error, setError] = useState("")

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  // 🔐 Password Validation
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/
    return regex.test(password)
  }

  // 📧 Gmail Validation
  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    return gmailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      if (isLogin) {
        // Gmail validation for login too
        if (!validateEmail(form.email)) {
          return setError("Only Gmail accounts are allowed.")
        }

        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password
        })

        localStorage.setItem("token", res.data.token)
        navigate(res.data.user.role === "manager" ? "/manager" : "/employee")
      } else {
        // Gmail validation
        if (!validateEmail(form.email)) {
          return setError("Only Gmail accounts are allowed.")
        }

        // Password validation
        if (!validatePassword(form.password)) {
          return setError(
            "Password must be 8+ chars, include uppercase, lowercase, number and special symbol."
          )
        }

        await api.post("/auth/register", form)
        alert("Registered successfully")
        setIsLogin(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              required
            />
            <input
              name="employeeId"
              placeholder="Employee ID"
              onChange={handleChange}
              required
            />
            <input
              name="department"
              placeholder="Department"
              onChange={handleChange}
              required
            />
            <select name="role" onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Enter Gmail only"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      {!isLogin && (
        <p style={{ fontSize: 12, marginTop: 10 }}>
          Requirements:
          <br />• Gmail account only
          <br />• Password 8+ characters
          <br />• 1 Uppercase
          <br />• 1 Lowercase
          <br />• 1 Number
          <br />• 1 Special symbol
        </p>
      )}

      <p
        onClick={() => {
          setIsLogin(!isLogin)
          setError("")
        }}
        style={{ cursor: "pointer", color: "blue", marginTop: 15 }}
      >
        {isLogin ? "Create account" : "Already have account?"}
      </p>
    </div>
  )
}
