import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { API_BASE_URL } from "../config/api";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");

      navigate("/profile");
    } catch (error) {
      console.error("Login request failed:", error);
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container auth-page">
      <div className="auth-topbar">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>

        <Logo />
      </div>

      <div className="auth-content">
        <h1>Welcome Back</h1>
        <p>Log in to continue your rental search</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you.email@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <div className="password-row">
              <label>Password</label>
              <span className="forgot-link">Forgot?</span>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </label>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}