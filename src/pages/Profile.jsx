import { User, LogOut, MapPin, Search, Star, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Logo from "../components/Logo";
import "../styles/profile.css";
import {
  getSavedProperties,
  getUserReviews,
} from "../utils/propertyStore";

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Profile() {
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const savedUserRaw = localStorage.getItem("user");
  const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

  const user = savedUser || {
    fullName: "Sarah Johnson",
    email: "sarah.j@university.ac.uk",
    location: "Birmingham",
    memberSince: "Jan 2026",
  };

  const userId = savedUser?.id || null;
  const displayName = user.full_name || user.fullName || "Unknown User";
  const memberSince = user.member_since || user.memberSince || "Jan 2026";
  const location = user.location || "";
  const firstLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoadingActivity(true);

        if (!userId) {
          setSavedProperties([]);
          setMyReviews([]);
          return;
        }

        const [savedData, reviewsData] = await Promise.all([
          getSavedProperties(userId),
          getUserReviews(userId),
        ]);

        setSavedProperties(Array.isArray(savedData) ? savedData : []);
        setMyReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        console.error("Failed to load profile data:", error);
        setSavedProperties([]);
        setMyReviews([]);
      } finally {
        setLoadingActivity(false);
      }
    }

    loadProfileData();
  }, [userId]);

  const savedCount = savedProperties.length;
  const reviewCount = myReviews.length;

  const recentActivity = useMemo(() => {
    const savedActivities = savedProperties.map((property) => ({
      id: `saved-${property.id}`,
      prefix: "You saved ",
      highlight: property.title,
      dateValue: property.savedAt || null,
      timeLabel: formatRelativeTime(property.savedAt),
      light: false,
    }));

    const reviewActivities = myReviews.map((review) => ({
      id: `review-${review.id}`,
      prefix: "You reviewed ",
      highlight: review.propertyTitle,
      dateValue: review.createdAt || review.date || null,
      timeLabel: formatRelativeTime(review.createdAt),
      light: false,
    }));

    const joinedActivity = {
      id: "joined-rentbuddy",
      prefix: "You joined ",
      highlight: "RentBuddy",
      dateValue: null,
      timeLabel: memberSince,
      light: true,
    };

    const merged = [...savedActivities, ...reviewActivities].sort((a, b) => {
      const aTime = a.dateValue ? new Date(a.dateValue).getTime() : 0;
      const bTime = b.dateValue ? new Date(b.dateValue).getTime() : 0;
      return bTime - aTime;
    });

    return merged.length > 0 ? merged.slice(0, 4) : [joinedActivity];
  }, [savedProperties, myReviews, memberSince]);

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
          <button
            className="icon-button"
            onClick={() => navigate("/profile-settings")}
          >
            <User size={18} />
          </button>
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

            <span className="member-badge">Member since {memberSince}</span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <strong>{reviewCount}</strong>
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

        <div className="action-card" onClick={() => navigate("/my-reviews")}>
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
          {loadingActivity ? (
            <div className="activity-item">
              <span className="dot"></span>
              <div>
                <p>Loading your recent activity...</p>
              </div>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <span className={`dot ${activity.light ? "light" : ""}`}></span>
                <div>
                  <p>
                    {activity.prefix}
                    <strong>{activity.highlight}</strong>
                  </p>
                  <small>{activity.timeLabel}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <button className="profile-bottom-btn" onClick={goToBrowse}>
        <Search size={18} />
        <span>View Properties</span>
      </button>
    </div>
  );
}