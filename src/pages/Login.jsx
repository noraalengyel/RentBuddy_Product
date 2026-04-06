import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
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
            <input type="email" placeholder="you.email@example.com" />
          </div>

          <div className="input-group">
            <div className="password-row">
              <label>Password</label>
              <span className="forgot-link">Forgot?</span>
            </div>
            <input type="password" placeholder="Enter your password" />
          </div>

          <label className="remember-row">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

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