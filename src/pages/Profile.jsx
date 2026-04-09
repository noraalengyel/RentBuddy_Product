import { User, LogOut, MapPin, Search, Star, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import "../styles/profile.css";
import { getSavedProperties } from "../utils/savedPropertiesStore";

export default function Profile() {
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setSavedCount(getSavedProperties().length);
  }, []);

  const savedUser = JSON.parse(localStorage.getItem("user"));

  const user = savedUser || {
    fullName: "Sarah Johnson",
    email: "sarah.j@university.ac.uk",
    location: "Birmingham",
    memberSince: "Jan 2026",
    reviewsWritten: 3,
    
  };

  const displayName = user.full_name || user.fullName || "Unknown User";
  const memberSince = user.member_since || user.memberSince || "Jan 2026";
  const location = user.location || "Birmingham";
  const reviewsWritten = user.reviewsWritten || 3;
  const firstLetter = displayName.charAt(0).toUpperCase();

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  }

  function goToBrowse() {
    navigate("/browse");
  }

  return (
    <div className="page-container profile-page">
      <header className="profile-header">
        <Logo />
        <div className="profile-header-icons">
          <User size={18} />
          <button className="icon-button" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{firstLetter}</div>

          <div className="profile-info">
            <h2>{displayName}</h2>
            <p>{user.email}</p>

            <div className="profile-location">
              <MapPin size={14} />
              <span>{location}</span>
            </div>

            <span className="member-badge">
              Member since {memberSince}
            </span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <strong>{reviewsWritten}</strong>
            <span>Reviews Written</span>
          </div>

          <div className="stat-item">
            <strong>{savedCount}</strong>
            <span>Saved Properties</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <h3>Quick Actions</h3>

        <div className="action-card" onClick={goToBrowse}>
          <div className="action-icon">
            <Search size={18} />
          </div>
          <div>
            <h4>Browse Properties</h4>
            <p>Find your perfect rental with real cost transparency</p>
          </div>
        </div>

        <div className="action-card">
          <div className="action-icon">
            <Star size={18} />
          </div>
          <div>
            <h4>Write a Review</h4>
            <p>Share your rental experience anonymously</p>
          </div>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/saved-properties")}
        >
          <div className="action-icon light">
            <Bookmark size={18} />
          </div>
          <div>
            <h4>My Saved Properties</h4>
            <p>View your saved listings and comparisons</p>
          </div>
        </div>
      </section>

      <section className="section-block">
        <h3>Recent Activity</h3>

        <div className="activity-card">
          <div className="activity-item">
            <span className="dot"></span>
            <div>
              <p>
                You saved <strong>Modern 2-Bed Apartment</strong>
              </p>
              <small>2 days ago</small>
            </div>
          </div>

          <div className="activity-item">
            <span className="dot"></span>
            <div>
              <p>
                You reviewed <strong>Student Studio on High Street</strong>
              </p>
              <small>1 week ago</small>
            </div>
          </div>

          <div className="activity-item">
            <span className="dot light"></span>
            <div>
              <p>
                You joined <strong>RentBuddy</strong>
              </p>
              <small>{memberSince}</small>
            </div>
          </div>
        </div>
      </section>

      <button className="profile-bottom-btn" onClick={goToBrowse}>
        <Search size={18} />
        <span>View Properties</span>
      </button>
    </div>
  );
}