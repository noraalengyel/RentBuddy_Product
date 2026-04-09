import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { API_BASE_URL } from "../config/api";
import "../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    agreedToTerms: false,
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

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!formData.agreedToTerms) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Signup failed.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");

      navigate("/profile");
    } catch (error) {
      console.error("Signup request failed:", error);
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
        <h1>Create Account</h1>
        <p>Join RentBuddy to find transparent rental information</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>I am a...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">Select an option</option>
              <option value="student">Student</option>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
              <option value="other">Other</option>
            </select>
          </div>

          <label className="terms-row">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
            />
            <span>
              I agree to the <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </span>
          </label>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}