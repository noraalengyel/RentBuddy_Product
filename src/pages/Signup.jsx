import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
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

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
      alert("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!formData.agreedToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      location: "Birmingham",
      memberSince: "Jan 2026",
      reviewsWritten: 3,
      savedProperties: 5,
    };

    localStorage.setItem("user", JSON.stringify(userData));
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

          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}