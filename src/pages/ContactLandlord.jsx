import { useMemo, useState } from "react";
import { ArrowLeft, Home, MapPin, User, Mail, Phone, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/contact-landlord.css";

export default function ContactLandlord() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const defaultProperty = {
    title: "Modern Studio Apartment",
    address: "25 King Street, Aberdeen AB24 5RU",
    landlord: "Property Management",
  };

  const property = {
    ...defaultProperty,
    ...(state?.property || {}),
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Hi, I'm interested in viewing ${property.title}.`);

  const characterCount = message.length;

  const managedByText = useMemo(() => {
    if (!property.landlord) return "Property Management";
    return property.landlord;
  }, [property.landlord]);

  function handleSubmit(e) {
  e.preventDefault();

  navigate("/message-sent", {
    state: {
      property,
      fullName,
      email,
      phone,
      message,
    },
  });
}

  return (
    <div className="page-container contact-page">
      <header className="contact-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>

        <h1>Contact Landlord</h1>

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
        <h3>Get In Touch</h3>
        <p>
          Send a message to the landlord about this property. They'll receive
          your inquiry and respond via email or phone.
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
            placeholder="Hi, I'm interested in viewing this property"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={7}
          />
        </label>

        <small className="character-count">{characterCount} characters</small>

        <button type="submit" className="primary-btn">
          <Send size={16} />
          <span>Send Message</span>
        </button>
      </form>

      <div className="privacy-card">
        <p>
          <strong>Privacy:</strong> Your contact details will only be shared
          with the property landlord/manager. RentBuddy keeps all tenant
          information confidential and secure.
        </p>
      </div>
    </div>
  );
}