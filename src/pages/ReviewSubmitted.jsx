import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import "../styles/review-submitted.css";

export default function ReviewSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="page-container review-submitted-page">
      <div className="review-submitted-top">
        <Logo />
      </div>

      <div className="review-submitted-content">
        <div className="review-submitted-icon-wrap">
          <CheckCircle2 size={54} />
        </div>

        <h1>Thank You for Your Review!</h1>

        <p>
          Your feedback helps other renters make informed decisions about their
          next home.
        </p>

        <div className="review-note-card">
          <strong>What's next?</strong>
          <span>
            Your review will be moderated and published within 24 hours. We'll
            notify you once it's live.
          </span>
        </div>

        <div className="review-submitted-actions">
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

      <footer className="review-submitted-footer">
        © 2026 RentBuddy. Building rental transparency together.
      </footer>
    </div>
  );
}