import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "./AuthPage"
import EmployeePage from "./EmployeePage"
import ManagerPage from "./ManagerPage"

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="/employee"
          element={
            <PrivateRoute>
              <EmployeePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <PrivateRoute>
              <ManagerPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
