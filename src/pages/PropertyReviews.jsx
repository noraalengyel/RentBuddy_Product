import { ArrowLeft, Star, BarChart3, MessageSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/property-reviews.css";
import { useParams } from "react-router-dom";
import { getPropertyById } from "../utils/propertyStore";

function renderStars(value) {
  const rounded = Math.round(Number(value) || 0);
  return Array.from({ length: 5 }, (_, i) => i < rounded);
}

function scoreBars(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((review) => {
    const rating = Number(review.rating) || 0;
    if (counts[rating] !== undefined) {
      counts[rating] += 1;
    }
  });

  const max = Math.max(...Object.values(counts), 1);

  return [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: counts[score],
    percent: (counts[score] / max) * 100,
  }));
}

function averageCategory(reviews, key) {
  if (!reviews.length) return 0;

  const values = reviews
    .map((review) => review.categoryRatings?.[key])
    .filter((value) => typeof value === "number");

  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function PropertyReviews() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const defaultProperty = {
    id: 1,
    title: "Modern Studio Apartment",
    rating: 4.5,
    reviews: 12,
    tenantReviews: [
      {
        id: 1,
        name: "Anonymous Tenant",
        rating: 5,
        date: "Mar 2026",
        text: "Perfect studio for a student. Everything is included and the location is ideal. Landlord responds quickly to any issues.",
        billsNote: "£90/month",
        wouldRentAgain: true,
        categoryRatings: {
          landlordCommunication: 5,
          maintenanceSpeed: 4,
          cleanliness: 5,
          safety: 4,
          valueForMoney: 4,
        },
      },
      {
        id: 2,
        name: "Anonymous Tenant",
        rating: 4,
        date: "Feb 2026",
        text: "Great value for money. The apartment is exactly as described. Only downside is the street noise on Friday nights.",
        billsNote: "£100/month",
        wouldRentAgain: true,
        categoryRatings: {
          landlordCommunication: 4,
          maintenanceSpeed: 4,
          cleanliness: 4,
          safety: 4,
          valueForMoney: 5,
        },
      },
    ],
  };

    const property = 
        getPropertyById(id) ||
        {
            ...defaultProperty,
            ...(state?.property || {}),
        };

  const reviewList = Array.isArray(property.tenantReviews)
    ? property.tenantReviews
    : [];

  const categoryRows = [
    ["Landlord Communication", averageCategory(reviewList, "landlordCommunication")],
    ["Maintenance Speed", averageCategory(reviewList, "maintenanceSpeed")],
    ["Cleanliness", averageCategory(reviewList, "cleanliness")],
    ["Safety", averageCategory(reviewList, "safety")],
    ["Value for Money", averageCategory(reviewList, "valueForMoney")],
  ];

  const overallRating = reviewList.length
    ? (
        reviewList.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
        reviewList.length
      ).toFixed(1)
    : Number(property.rating || 0).toFixed(1);

  const bars = scoreBars(reviewList);

  return (
    <div className="page-container reviews-page">
      <header className="reviews-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>

        <div className="reviews-header-text">
          <h1>Reviews & Ratings</h1>
          <p>{property.title}</p>
        </div>

        <div className="reviews-header-spacer" />
      </header>

      <section className="reviews-summary-card">
        <div className="reviews-summary-left">
          <div className="overall-score">{overallRating}</div>

          <div className="overall-stars">
            {renderStars(overallRating).map((filled, i) => (
              <Star
                key={i}
                size={12}
                fill={filled ? "currentColor" : "none"}
                strokeWidth={2}
              />
            ))}
          </div>

          <div className="overall-count">{reviewList.length} reviews</div>
        </div>

        <div className="reviews-summary-right">
          {bars.map((bar) => (
            <div className="rating-bar-row" key={bar.score}>
              <span>{bar.score}</span>
              <Star size={10} fill="currentColor" />
              <div className="rating-bar-track">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
              <span className="rating-bar-count">{bar.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="category-card">
         <h3 className="section-title">
            <BarChart3 size={16} />
            <span>Category Breakdown</span>
         </h3>

        <div className="category-list">
          {categoryRows.map(([label, value]) => (
            <div className="category-row" key={label}>
              <div className="category-top">
                <span>{label}</span>
                <strong>{Number(value).toFixed(1)}</strong>
              </div>

              <div className="category-track">
                <div
                  className="category-fill"
                  style={{ width: `${(Number(value) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tenant-reviews-section">
        <div className="tenant-reviews-header">
            <h3 className="section-title">
                <MessageSquare size={16} />
                <span>Tenant Reviews</span>
            </h3>
          <button className="write-review-btn"
                onClick={() =>navigate(`/property/${property.id}/review/new`, { state: { property } })}
                >Write Review
            </button>
        </div>

        <div className="tenant-review-list">
          {reviewList.map((review) => (
            <article className="tenant-review-card" key={review.id}>
              <div className="tenant-review-top">
                <div className="tenant-review-user">
                  <div className="tenant-review-avatar">
                    {review.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <strong>{review.name}
                              {review.name !== "Anonymous Tenant" && (
                                <span className="verified-badge">Verified</span>)}
                    </strong>
                    <small>{review.date || review.time || "Recent"}</small>
                  </div>
                </div>

                <div className="tenant-review-rating">
                  <Star size={11} fill="currentColor" />
                  <span>{review.rating}</span>
                </div>
              </div>

              <div className="mini-category-grid">
                <div>
                  <span>Landlord Com</span>
                  <em>{"★".repeat(review.categoryRatings?.landlordCommunication || 0)}</em>
                </div>
                <div>
                  <span>Maintenance</span>
                  <em>{"★".repeat(review.categoryRatings?.maintenanceSpeed || 0)}</em>
                </div>
                <div>
                  <span>Cleanliness</span>
                  <em>{"★".repeat(review.categoryRatings?.cleanliness || 0)}</em>
                </div>
                <div>
                  <span>Safety</span>
                  <em>{"★".repeat(review.categoryRatings?.safety || 0)}</em>
                </div>
                <div>
                  <span>Value for Money</span>
                  <em>{"★".repeat(review.categoryRatings?.valueForMoney || 0)}</em>
                </div>
              </div>

              <p className="tenant-review-text">{review.text}</p>

              <div className="tenant-review-footer">
                <small>Bills: {review.billsNote || "Included"}</small>
                <span className={review.wouldRentAgain ? "would-again yes" : "would-again no"}>
                  {review.wouldRentAgain ? "Would Rent Again" : "Would Not Rent Again"}
                </span>
              </div>

              {review.hiddenCosts && (
                <div className="hidden-cost-box">
                  <strong>Hidden Costs Reported</strong>
                  <span>{review.hiddenCosts}</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}