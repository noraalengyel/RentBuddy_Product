import { useMemo, useState } from "react";
import { ArrowLeft, Home, MapPin, User, Mail, Phone, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/contact-landlord.css";

export default function ContactLandlord() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const defaultProperty = {
    id: null,
    title: "Modern Studio Apartment",
    address: "25 King Street, Aberdeen AB24 5RU",
    landlord: "Property Management",
    landlordEmail: "landlord@example.com",
  };

  const property = {
    ...defaultProperty,
    ...(state?.property || {}),
  };

  const savedUserRaw = localStorage.getItem("user");
  const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

  const [fullName, setFullName] = useState(
    savedUser?.full_name || savedUser?.fullName || ""
  );
  const [email, setEmail] = useState(savedUser?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in viewing ${property.title}. Could you provide more information about availability, bills, deposit requirements, and viewing arrangements?`
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const characterCount = message.length;

  const managedByText = useMemo(() => {
    if (!property.landlord) return "Property Management";
    return property.landlord;
  }, [property.landlord]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!property.id) {
      setErrorMessage("Property information is missing.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if(!property.landlordEmail){
      setErrorMessage("No landlord email is available for this property.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

          const subject = encodeURIComponent(`Enquiry about ${property.title}`);

          const body = encodeURIComponent(
      `Hi ${managedByText},

      I'm interested in ${property.title}.

      Property address:
      ${property.address}

      My details:
      Name: ${fullName.trim()}
      Email: ${email.trim()}
      Phone: ${phone.trim() || "Not provided"}

      Message:
      ${message.trim()}

      Thanks,
      ${fullName.trim()}`
          );

    window.location.href = `mailto:${property.landlordEmail}?subject=${subject}&body=${body}`;
  } catch (error) {
    console.error("Failed to open email client:", error);
    setErrorMessage("Unable to open your email app.");
  } finally {
    setSubmitting(false);
  }
}



return (
    <div className="page-container contact-page">
      <header className="contact-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>

        <h1>Make an Enquiry</h1>

        <button className="home-icon-btn" onClick={() => navigate("/")}>
          <Home size={16} />
        </button>
      </header>

      <section className="contact-property-card">
        <div className="contact-property-icon">
          <Home size={18} />
        </div>

        <div className="contact-property-info">
          <h2>{property.title}</h2>

          <div className="contact-property-meta">
            <MapPin size={13} />
            <span>{property.address}</span>
          </div>

          <p>Managed by {managedByText}</p>
        </div>
      </section>

      <section className="contact-intro-card">
        <h3>Ask About This Property</h3>
        <p>
          Fill in a few details and we’ll open your email app with a pre-written
          enquiry. You can review it before sending.
        </p>
      </section>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          <span>Your Name *</span>
          <div className="input-wrap">
            <User size={16} />
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </label>

        <label>
          <span>Email Address *</span>
          <div className="input-wrap">
            <Mail size={16} />
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </label>

        <label>
          <span>Phone Number (Optional)</span>
          <div className="input-wrap">
            <Phone size={16} />
            <input
              type="tel"
              placeholder="+44 7XXX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Your Message *</span>
          <textarea
            placeholder="Ask more information about this property"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={7}
          />
        </label>

        <small className="character-count">{characterCount} characters</small>

        {errorMessage && <div className="submit-note">{errorMessage}</div>}

        <button type="submit" className="primary-btn" disabled={submitting}>
          <Send size={16} />
          <span>{submitting ? "Opening..." : "Continue to Email"}</span>
        </button>
      </form>

      <div className="privacy-card">
        <p>
          <strong>Privacy:</strong> Your enquiry will open in your own email app
          first, so you can review it before sending.
        </p>
      </div>
    </div>
  );
}