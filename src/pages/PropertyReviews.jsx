import { ArrowLeft, Star, BarChart3, MessageSquare, Image as ImageIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../styles/property-reviews.css";
import {
  getPropertyById,
  getPropertyReviews,
  getReviewSummary,
} from "../utils/propertyStore";

function renderStars(value) {
  const rounded = Math.round(Number(value) || 0);
  return Array.from({ length: 5 }, (_, i) => i < rounded);
}

function createFallbackBars(reviewList) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviewList.forEach((review) => {
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

export default function PropertyReviews() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const fallbackProperty = {
    id: Number(id),
    title: state?.property?.title || "Property Reviews",
    rating: 0,
    reviews: 0,
    tenantReviews: [],
  };

  const [property, setProperty] = useState(state?.property || fallbackProperty);
  const [reviewList, setReviewList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);
  const [onlyFourPlus, setOnlyFourPlus] = useState(false);

  useEffect(() => {
    async function loadReviewData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [propertyData, reviewsData, summaryData] = await Promise.all([
          getPropertyById(id),
          getPropertyReviews(id),
          getReviewSummary(id),
        ]);

        setProperty(propertyData);
        setReviewList(Array.isArray(reviewsData) ? reviewsData : []);
        setSummary(summaryData);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setErrorMessage(error.message || "Unable to load reviews right now.");
      } finally {
        setLoading(false);
      }
    }

    loadReviewData();
  }, [id]);

  const filteredReviews = useMemo(() => {
    return reviewList.filter((review) => {
      const hasPhotos = Array.isArray(review.photos) && review.photos.length > 0;
      const isFourPlus = Number(review.rating) >= 4;

      if (onlyWithPhotos && !hasPhotos) return false;
      if (onlyFourPlus && !isFourPlus) return false;

      return true;
    });
  }, [reviewList, onlyWithPhotos, onlyFourPlus]);

  const bars = useMemo(() => {
    if (!summary?.distribution?.length) {
      return createFallbackBars(reviewList);
    }

    const max = Math.max(...summary.distribution.map((item) => item.count), 1);

    return summary.distribution.map((item) => ({
      ...item,
      percent: (item.count / max) * 100,
    }));
  }, [summary, reviewList]);

  const categoryRows = [
    ["Landlord Communication", Number(summary?.categories?.landlordCommunication || 0)],
    ["Maintenance Speed", Number(summary?.categories?.maintenanceSpeed || 0)],
    ["Cleanliness", Number(summary?.categories?.cleanliness || 0)],
    ["Safety", Number(summary?.categories?.safety || 0)],
    ["Value for Money", Number(summary?.categories?.valueForMoney || 0)],
  ];

  const overallRating = Number(summary?.overallRating || property.rating || 0).toFixed(1);
  const totalReviews = Number(summary?.totalReviews || reviewList.length || 0);

  if (loading) {
    return (
      <div className="page-container reviews-page">
        <header className="reviews-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>

          <div className="reviews-header-text">
            <h1>Reviews & Ratings</h1>
            <p>Loading reviews...</p>
          </div>

          <div className="reviews-header-spacer" />
        </header>
      </div>
    );
  }

  if (errorMessage) {
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
          <div>
            <h3>Something went wrong</h3>
            <p>{errorMessage}</p>
          </div>
        </section>
      </div>
    );
  }

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

          <div className="overall-count">{totalReviews} reviews</div>
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

          <button
            className="write-review-btn"
            onClick={() =>
              navigate(`/property/${property.id}/review/new`, {
                state: { property },
              })
            }
          >
            Write Review
          </button>
        </div>

        <div className="review-filters">
          <button
            type="button"
            className={`filter-chip ${onlyWithPhotos ? "active" : ""}`}
            onClick={() => setOnlyWithPhotos((prev) => !prev)}
          >
            <ImageIcon size={13} />
            <span>With Photos</span>
          </button>

          <button
            type="button"
            className={`filter-chip ${onlyFourPlus ? "active" : ""}`}
            onClick={() => setOnlyFourPlus((prev) => !prev)}
          >
            <Star size={13} />
            <span>4+ Stars</span>
          </button>
        </div>

        <div className="tenant-review-list">
          {filteredReviews.length === 0 ? (
            <article className="tenant-review-card">
              <p>No reviews match the selected filters.</p>
            </article>
          ) : (
            filteredReviews.map((review) => (
              <article className="tenant-review-card" key={review.id}>
                <div className="tenant-review-top">
                  <div className="tenant-review-user">
                    <div className="tenant-review-avatar">
                      {review.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>

                    <div>
                      <strong>
                        {review.name}
                        {review.name !== "Anonymous Tenant" && (
                          <span className="verified-badge">Verified</span>
                        )}
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

                {Array.isArray(review.photos) && review.photos.length > 0 && (
                  <div className="review-photo-grid">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`Review upload ${index + 1}`}
                        className="review-photo"
                      />
                    ))}
                  </div>
                )}

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
            ))
          )}
        </div>
      </section>
    </div>
  );
}