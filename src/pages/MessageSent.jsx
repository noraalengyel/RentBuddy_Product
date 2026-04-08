import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import "../styles/message-sent.css";

export default function MessageSent() {
  const navigate = useNavigate();

  return (
    <div className="page-container message-sent-page">
      <div className="message-sent-top">
        <Logo />
      </div>

      <div className="message-sent-content">
        <div className="message-icon-wrap">
          <CheckCircle2 size={54} />
        </div>

        <h1>Thank You for Sending a Message!</h1>

        <p>
          Your contacted landlord will get back to you as soon as possible!
        </p>

        <div className="message-actions">
          <button
            className="primary-btn"
            onClick={() => navigate("/browse")}
          >
            Browse Properties
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/profile")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <footer className="message-footer">
        © 2026 RentBuddy. Building rental transparency together.
      </footer>
    </div>
  );
}