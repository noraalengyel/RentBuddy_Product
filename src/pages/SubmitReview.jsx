import { useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addReviewToProperty, getPropertyById } from "../utils/propertyStore";
import "../styles/submit-review.css";

function StarRatingInput({ value, onChange }) {
  return (
    <div className="star-input-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-button"
          onClick={() => onChange(star)}
        >
          <Star
            size={22}
            fill={star <= value ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        </button>
      ))}
    </div>
  );
}

function SliderField({ label, value, onChange }) {
  return (
    <div className="slider-field">
      <div className="slider-label-row">
        <span>{label}</span>
        <span>{value}/5</span>
      </div>

      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function SubmitReview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const property =
    getPropertyById(id) ||
    state?.property || {
      id,
      title: "Unknown Property",
    };

  const savedUser = JSON.parse(localStorage.getITem("user"));
  const userName = savedUser?.fullName || "Verified Tenant";

  const [postAnonymously, setPostAnonymously] = useState(true);
  const [overallRating, setOverallRating] = useState(0);
  const [landlordCommunication, setLandlordCommunication] = useState(3);
  const [maintenanceSpeed, setMaintenanceSpeed] = useState(3);
  const [cleanliness, setCleanliness] = useState(3);
  const [safety, setSafety] = useState(3);
  const [valueForMoney, setValueForMoney] = useState(3);
  const [monthlyBills, setMonthlyBills] = useState("");
  const [hiddenCosts, setHiddenCosts] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [wouldRentAgain, setWouldRentAgain] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();

    if (!overallRating || !reviewText.trim()) return;

    const newReview = {
      name: postAnonymously ? "Anonymous Tenant" : userName,
      rating: overallRating,
      date: new Date().toLocaleString("en-GB", {
        month: "short",
        year: "numeric",
      }),
      text: reviewText.trim(),
      billsNote: monthlyBills.trim() ? `£${monthlyBills}/month` : "Included",
      wouldRentAgain,
      hiddenCosts: hiddenCosts ? "Reviewer reported additional hidden costs." : "",
      categoryRatings: {
        landlordCommunication,
        maintenanceSpeed,
        cleanliness,
        safety,
        valueForMoney,
      },
    };

    const updatedProperty = addReviewToProperty(property.id, newReview);

    navigate("/review-submitted", {
    state: {
        property: updatedProperty,
    },
    });
  }

  return (
    <div className="page-container submit-review-page">
      <header className="submit-review-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <h1>Submit Review</h1>
        <div className="submit-review-spacer" />
      </header>

      <form className="submit-review-form" onSubmit={handleSubmit}>
        <section className="submit-card">
          <label className="submit-label">Select Property</label>
          <div className="property-display-box">{property.title}</div>
        </section>

        <section className="submit-card toggle-card">
          <div>
            <h3>Post Anonymously</h3>
            <p>Your real identity is hidden</p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={postAnonymously}
              onChange={() => setPostAnonymously(!postAnonymously)}
            />
            <span className="slider"></span>
          </label>
        </section>

        <section className="submit-card">
          <label className="submit-label">Overall Rating *</label>
          <StarRatingInput value={overallRating} onChange={setOverallRating} />
        </section>

        <section className="submit-card">
          <h3>Category Ratings</h3>

          <SliderField
            label="Landlord Communication"
            value={landlordCommunication}
            onChange={setLandlordCommunication}
          />
          <SliderField
            label="Maintenance Speed"
            value={maintenanceSpeed}
            onChange={setMaintenanceSpeed}
          />
          <SliderField
            label="Cleanliness"
            value={cleanliness}
            onChange={setCleanliness}
          />
          <SliderField
            label="Safety"
            value={safety}
            onChange={setSafety}
          />
          <SliderField
            label="Value for Money"
            value={valueForMoney}
            onChange={setValueForMoney}
          />
        </section>

        <section className="submit-card">
          <label className="submit-label">Monthly Bills (£)</label>
          <input
            className="text-input"
            type="number"
            placeholder="e.g. 120"
            value={monthlyBills}
            onChange={(e) => setMonthlyBills(e.target.value)}
          />
        </section>

        <section className="submit-card">
          <label className="submit-label">Were there any hidden costs? *</label>
          <div className="choice-row">
            <button
              type="button"
              className={`choice-btn ${hiddenCosts ? "active" : ""}`}
              onClick={() => setHiddenCosts(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`choice-btn ${!hiddenCosts ? "active" : ""}`}
              onClick={() => setHiddenCosts(false)}
            >
              No
            </button>
          </div>
        </section>

        <section className="submit-card">
          <label className="submit-label">Your Review *</label>
          <textarea
            rows={6}
            placeholder="Tell us about your experience living here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <small>{reviewText.length}/500 characters</small>
        </section>

        <section className="submit-card">
          <label className="submit-label">Would you rent here again? *</label>
          <div className="choice-row">
            <button
              type="button"
              className={`choice-btn ${wouldRentAgain ? "active" : ""}`}
              onClick={() => setWouldRentAgain(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`choice-btn ${!wouldRentAgain ? "active" : ""}`}
              onClick={() => setWouldRentAgain(false)}
            >
              No
            </button>
          </div>
        </section>

        <div className="submit-note">
          All reviews are moderated to ensure authenticity and helpfulness. Your review will be visible within 24 hours.
        </div>

        <button type="submit" className="submit-review-btn">
          Submit Review
        </button>
      </form>
    </div>
  );
}