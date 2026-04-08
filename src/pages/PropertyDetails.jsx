import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  PoundSterling,
  ShieldCheck,
  Home,
  Sofa,
  Check,
  X,
  LocateFixed,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/property-details.css";
import { useParams } from "react-router-dom";
import { getPropertyById } from "../utils/propertyStore";

export default function PropertyDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    const defaultProperty = {
    id: 1,
    title: "Modern Studio Apartment",
    price: 750,
    rating: 4.5,
    reviews: 12,
    address: "25 King Street, Aberdeen AB24 5RU",
    nearbyTo: ["0.5 miles from City Centre"],
    type: "Studio",
    furnished: "Furnished",
    bills: true,
    image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    deposit: 750,
    councilTax: 0,
    moveIn: "Available now",
    pros: [],
    cons: [],
    landlord: "Trusted Landlord",
    landlordRating: 4.8,
    tenantReviews: [],
    };

    const property = 
        getPropertyById(id) ||
        {
            ...defaultProperty,
            ...(state?.property || {}),
        };
        
  const totalMonthly =
    property.price + (property.councilTax || 0);

  const reviewList = property.tenantReviews || [];

  return (
    <div className="page-container details-page">
      <header className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Property Details</span>
        </button>

        <div className="details-header-icons">
          <button className="icon-button">
            <Heart size={16} />
          </button>
          <button className="icon-button">
            <Share2 size={16} />
          </button>
        </div>
      </header>

      <div className="details-image-wrap">
        <img
          src={property.image}
          alt={property.title}
          className="details-image"
        />
        <span className="image-count">1/3</span>
      </div>

      <section className="details-top">
        <h1>{property.title}</h1>

        <div className="details-price-row">
          <div className="details-meta-line">
            <MapPin size={13} />
            <span>{property.address}</span>
          </div>

          <div className="details-price">
            <span>£{property.price}</span>
            <small>/month</small>
          </div>
        </div>

        <div className="details-meta-line second">
          <LocateFixed size={13} />
          <span>{property.nearbyTo.join(" • ")}</span>
        </div>

        <div className="details-rating-row">
          <div className="details-rating">
            <Star size={13} fill="currentColor" />
            <span>{property.rating}</span>
          </div>

          <div className="details-chip">{property.type}</div>
          <div className="details-chip">
            {property.furnished === "Yes"
              ? "Furnished"
              : property.furnished === "No"
              ? "Unfurnished"
              : property.furnished}
          </div>
        </div>
      </section>

      <section className="details-card">
        <h3>Cost Breakdown</h3>

        <div className="cost-row">
          <span>Monthly Rent</span>
          <strong>£{property.price}</strong>
        </div>
        <div className="cost-row">
          <span>Council Tax</span>
          <strong>£{property.councilTax || 0}</strong>
        </div>
        <div className="cost-row">
          <span>Estimated monthly total cost</span>
          <strong>£{totalMonthly}</strong>
        </div>

        <div className="deposit-box">
          <span>Deposit Required</span>
          <strong>£{property.deposit || property.price}</strong>
        </div>
      </section>

      <section className="details-feature-grid">
        <div className="feature-box">
          <PoundSterling size={14} />
          <span>{property.landlord}</span>
        </div>

        <div className="feature-box">
          <Home size={14} />
          <span>{property.moveIn}</span>
        </div>

        <div className="feature-box">
          <Star size={14} fill="currentColor" />
          <span>{property.landlordRating}</span>
        </div>
      </section>

      <section className="details-card">
        <h3>Pros & Cons</h3>

        <div className="pros-cons-list">
          {property.pros?.map((item) => (
            <div className="pros-item" key={item}>
              <Check size={14} />
              <span>{item}</span>
            </div>
          ))}

          {property.cons?.map((item) => (
            <div className="cons-item" key={item}>
              <X size={14} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="details-card">
        <h3>Location</h3>

        <div className="location-box">
          <MapPin size={24} />
          <p>{property.address}</p>
          <small>{property.nearbyTo.join(" • ")}</small>
        </div>
      </section>

      <section className="reviews-section">
        <div className="reviews-header">
          <h3>Tenant Reviews ({reviewList.length})</h3>
          <button className="see-all-btn">See all</button>
        </div>

        {reviewList.map((review) => (
          <div className="review-card" key={review.id}>
            <div className="review-top">
              <div className="review-user">
                <div className="review-avatar">👤</div>
                <div>
                  <strong>{review.name}</strong>
                  <small>{review.date || review.time}</small>
                </div>
              </div>

              <div className="review-rating">
                <Star size={12} fill="currentColor" />
                <span>{review.rating}</span>
              </div>
            </div>

            <p>{review.text}</p>
            <small className="review-bills">
                Bills: {review.billsNote || (property.bills ? "Included" : `£${property.billsCost || 0}/month`)}
            </small>
          </div>
        ))}
      </section>

      <div className="details-actions">
        <button className="secondary-btn"
            onClick={() => {console.log("View Reviews clicked", property); navigate(`/property/${property.id}/reviews`, { state: { property } });
            }}
        >
             View Reviews
        </button>
        <button className="primary-btn"onClick={() => navigate("/contact-landlord", { state: { property } })}
            >Contact Landlord</button>
      </div>
    </div>
  );
}