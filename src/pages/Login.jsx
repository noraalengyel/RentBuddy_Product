import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      setErrorMessage("No account found. Please create an account first.");
      return;
    }

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (formData.email.trim().toLowerCase() !== savedUser.email.trim().toLowerCase()) {
      setErrorMessage("Email not found. Please check your details or sign up.");
      return;
    }

    if (formData.password !== savedUser.password) {
      setErrorMessage("Incorrect password. Please try again.");
      return;
    }

    setErrorMessage("");
    localStorage.setItem("isLoggedIn", "true");
    navigate("/profile");
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

          <button type="submit" className="btn-primary">
            Log In
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}