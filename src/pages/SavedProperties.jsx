import {
  Heart,
  X,
  ArrowLeft,
  Star,
  ExternalLink,
  GitCompareArrows,
  BadgePoundSterling,
  Trophy,
  BarChart3,
  Lightbulb,
  Award,
  Medal,
  BadgeCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSavedProperties,
  removeSavedProperty,
} from "../utils/propertyStore";
import "../styles/saved-properties.css";

function formatSavedTime(savedAt) {
  if (!savedAt) return "Saved recently";

  const savedDate = new Date(savedAt);
  const now = new Date();
  const diffMs = now - savedDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Saved today";
  if (diffDays === 1) return "Saved 1 day ago";
  return `Saved ${diffDays} days ago`;
}

function getMonthlyTotal(property) {
  return (
    (property.price || 0) +
    (property.bills ? 0 : property.billsCost || 0) +
    (property.councilTax || 0)
  );
}

export default function SavedProperties() {
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);

  const savedUserRaw = localStorage.getItem("user");
  const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

 useEffect(() => {
  async function loadSavedProperties() {
    try {
      if (!savedUser?.id) {
        setSavedProperties([]);
        setSelectedCompareIds([]);
        return;
      }

      const saved = await getSavedProperties(savedUser.id);
      const safeSaved = Array.isArray(saved) ? saved : [];

      setSavedProperties(safeSaved);

      if (safeSaved.length > 0) {
        setSelectedCompareIds(safeSaved.slice(0, 3).map((property) => property.id));
      } else {
        setSelectedCompareIds([]);
      }
    } catch (error) {
      console.error("Failed to load saved properties:", error);
      setSavedProperties([]);
      setSelectedCompareIds([]);
    }
  }

  loadSavedProperties();
}, [savedUser?.id]);

  const savedCountText = useMemo(() => {
    if (savedProperties.length === 1) return "1 property saved";
    return `${savedProperties.length} properties saved`;
  }, [savedProperties.length]);

async function handleRemove(propertyId) {
  if (!savedUser?.id) return;

  try {
    await removeSavedProperty(savedUser.id, propertyId);
    setSavedProperties((prev) =>
      prev.filter((property) => property.id !== propertyId)
    );
    setSelectedCompareIds((prev) => prev.filter((id) => id !== propertyId));
  } catch (error) {
    console.error("Failed to remove saved property:", error);
  }
}

  function toggleCompareSelection(propertyId) {
    setSelectedCompareIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, propertyId];
    });
  }

  const selectedCompareProperties = savedProperties.filter((property) =>
    selectedCompareIds.includes(property.id)
  );

  const compareSortedByCost = [...selectedCompareProperties].sort(
    (a, b) => getMonthlyTotal(a) - getMonthlyTotal(b)
  );

  const compareSortedByRating = [...selectedCompareProperties].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0)
  );

  const compareSortedByLandlord = [...selectedCompareProperties].sort(
    (a, b) => (b.landlordRating || 0) - (a.landlordRating || 0)
  );

  const maxMonthlyCost = Math.max(
    ...compareSortedByCost.map((property) => getMonthlyTotal(property)),
    1
  );

  return (
    <div className="page-container saved-page">
      <header className="saved-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>

        <div className="saved-header-text">
          <h1>My Saved Properties</h1>
          <p>{savedCountText}</p>
        </div>

        <div className="saved-header-spacer" />
      </header>

      <div className="saved-toggle-row">
        <button
          className={`saved-toggle-btn ${viewMode === "list" ? "active" : ""}`}
          onClick={() => setViewMode("list")}
        >
          List View
        </button>

        <button
          className={`saved-toggle-btn ${
            viewMode === "compare" ? "active" : ""
          }`}
          onClick={() => setViewMode("compare")}
        >
          Compare
        </button>
      </div>

      {viewMode === "compare" ? (
        <div className="compare-view">
          <div className="compare-header-block">
            <h2>Side-by-Side Comparison</h2>
            <p>Compare costs, ratings, and landlord scores</p>
          </div>

          {savedProperties.length === 0 ? (
            <div className="empty-saved-card">
              <h3>No saved properties yet</h3>
              <p>Tap the heart icon on a property to save it here.</p>
            </div>
          ) : (
            <>
              <div className="compare-selector-card">
                <h3 className="compare-section-title">
                  <GitCompareArrows size={16} />
                  <span>Select up to 3 properties</span>
                </h3>

                <div className="compare-selector-list">
                  {savedProperties.map((property) => {
                    const selected = selectedCompareIds.includes(property.id);
                    const disabled =
                      !selected && selectedCompareIds.length >= 3;

                    return (
                      <button
                        key={property.id}
                        type="button"
                        className={`compare-select-item ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => toggleCompareSelection(property.id)}
                        disabled={disabled}
                      >
                        <div className="compare-select-left">
                          <span
                            className={`compare-checkbox ${
                              selected ? "checked" : ""
                            }`}
                          />
                          <div>
                            <strong>{property.title}</strong>
                            <small>£{property.price}/mo</small>
                          </div>
                        </div>

                        <span className="compare-select-rating">
                          <Star size={11} fill="currentColor" />
                          {property.rating}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedCompareProperties.length < 2 ? (
                <div className="empty-saved-card">
                  <h3>Select at least 2 properties</h3>
                  <p>Choose two or three saved properties above to compare.</p>
                </div>
              ) : (
                <>
                  <section className="compare-card">
                    <h3 className="compare-section-title">
                      <BadgePoundSterling size={16} />
                      <span>Monthly Cost Comparison</span>
                    </h3>

                    <div className="compare-cost-list">
                      {compareSortedByCost.map((property, index, arr) => {
                        const total = getMonthlyTotal(property);
                        const cheapestTotal = getMonthlyTotal(arr[0]);
                        const difference = total - cheapestTotal;
                        const barWidth = `${(total / maxMonthlyCost) * 100}%`;

                        return (
                          <div
                            className="compare-property-block"
                            key={property.id}
                          >
                            <div className="compare-property-top">
                              <div>
                                <strong>{property.title}</strong>
                                <p>Total: £{total}/mo</p>
                              </div>

                              <span className="compare-badge">
                                {index === 0 ? "Cheapest" : `+£${difference}`}
                              </span>
                            </div>

                            <div className="compare-total-track">
                              <div
                                className="compare-total-bar"
                                style={{ width: barWidth }}
                              >
                                <strong>£{total}</strong>
                              </div>
                            </div>

                            <div className="compare-breakdown-row">
                              <div>
                                <span>Rent</span>
                                <strong>£{property.price || 0}</strong>
                              </div>
                              <div>
                                <span>Bills</span>
                                <strong>
                                  {property.bills
                                    ? "Incl."
                                    : `£${property.billsCost || 0}`}
                                </strong>
                              </div>
                              <div>
                                <span>Deposit</span>
                                <strong>
                                  £{property.deposit || property.price || 0}
                                </strong>
                              </div>
                              <div>
                                <span>Tax</span>
                                <strong>£{property.councilTax || 0}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="compare-card">
                    <h3 className="compare-section-title">
                      <Trophy size={16} />
                      <span>Rating Comparison</span>
                    </h3>

                    <div className="compare-ranking-list">
                      {compareSortedByRating.map((property, index) => (
                        <div
                          className="compare-ranking-item"
                          key={property.id}
                        >
                          <span className={`ranking-icon rank-${index + 1}`}>
                            {index === 0 ? (
                              <Award size={16} />
                            ) : index === 1 ? (
                              <Medal size={16} />
                            ) : (
                              <BadgeCheck size={16} />
                            )}
                          </span>

                          <div className="ranking-info">
                            <strong>{property.title}</strong>
                            <p>
                              {"★".repeat(Math.round(property.rating || 0))}{" "}
                              <span>
                                {property.rating || 0} ({property.reviews || 0}{" "}
                                reviews)
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="compare-card">
                    <h3 className="compare-section-title">
                      <BarChart3 size={16} />
                      <span>Landlord Score Comparison</span>
                    </h3>

                    <div className="landlord-score-list">
                      {compareSortedByLandlord.map((property) => (
                        <div className="landlord-score-item" key={property.id}>
                          <div className="landlord-score-top">
                            <strong>{property.title}</strong>
                            <span>{property.landlordRating || 0} / 5</span>
                          </div>

                          <div className="landlord-score-bar">
                            <div
                              className="landlord-score-fill"
                              style={{
                                width: `${
                                  ((property.landlordRating || 0) / 5) * 100
                                }%`,
                              }}
                            />
                          </div>

                          <small>Excellent landlord</small>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="compare-decision-card">
                    <h3 className="compare-section-title">
                      <Lightbulb size={16} />
                      <span>Quick Decision</span>
                    </h3>

                    <p>
                      <strong>Best Value:</strong> {compareSortedByCost[0]?.title}
                    </p>

                    <p>
                      <strong>Highest Rated:</strong>{" "}
                      {compareSortedByRating[0]?.title}
                    </p>

                    <p>
                      <strong>Best Landlord:</strong>{" "}
                      {compareSortedByLandlord[0]?.title}
                    </p>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="saved-list">
          {savedProperties.length === 0 ? (
            <div className="empty-saved-card">
              <h3>No saved properties yet</h3>
              <p>Tap the heart icon on a property to save it here.</p>
            </div>
          ) : (
            savedProperties.map((property) => (
              <article className="saved-property-card" key={property.id}>
                <div className="saved-image-wrap">
                  <img src={property.image} alt={property.title} />

                  <button className="saved-heart-badge" type="button">
                    <Heart size={13} fill="currentColor" />
                  </button>

                  <button
                    className="saved-remove-top"
                    type="button"
                    onClick={() => handleRemove(property.id)}
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="saved-card-body">
                  <div className="saved-title-row">
                    <h3>{property.title}</h3>

                    <div className="saved-rating-chip">
                      <Star size={12} fill="currentColor" />
                      <span>{property.rating}</span>
                    </div>
                  </div>

                  <p className="saved-address">{property.address}</p>

                  <div className="saved-cost-box">
                    <div className="saved-cost-grid">
                      <div>
                        <span>Rent:</span>
                        <strong>£{property.price}</strong>
                      </div>
                      <div>
                        <span>Bills:</span>
                        <strong>
                          {property.bills
                            ? "Incl."
                            : `£${property.billsCost || 0}`}
                        </strong>
                      </div>
                      <div>
                        <span>Deposit:</span>
                        <strong>£{property.deposit || property.price}</strong>
                      </div>
                      <div>
                        <span>Council Tax:</span>
                        <strong>£{property.councilTax || 0}</strong>
                      </div>
                    </div>

                    <div className="saved-total-row">
                      <span>Total Monthly:</span>
                      <strong>£{getMonthlyTotal(property)}</strong>
                    </div>
                  </div>

                  <div className="saved-meta-row">
                    <span className="saved-landlord-rating">
                      ↗ Landlord: {property.landlordRating}/5
                    </span>
                    <span className="saved-review-count">
                      {property.reviews} reviews
                    </span>
                  </div>

                  <div className="saved-actions">
                    <button
                      className="saved-view-btn"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      <ExternalLink size={13} />
                      <span>View Details</span>
                    </button>

                    <button
                      className="saved-remove-btn"
                      onClick={() => handleRemove(property.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <small className="saved-time">
                    {formatSavedTime(property.savedAt)}
                  </small>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}