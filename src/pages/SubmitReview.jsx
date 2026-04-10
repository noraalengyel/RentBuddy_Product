import { useEffect, useState } from 'react';
import { ArrowLeft, Star, ImagePlus, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { addReviewToProperty, getPropertyById } from '../utils/propertyStore';
import '../styles/submit-review.css';

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
            fill={star <= value ? 'currentColor' : 'none'}
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SubmitReview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const [property, setProperty] = useState(
    state?.property || {
      id: Number(id),
      title: 'Loading property...',
    }
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const savedUserRaw = localStorage.getItem('user');
  const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
  const userName = savedUser?.full_name || savedUser?.fullName || 'Verified Tenant';

  const [postAnonymously, setPostAnonymously] = useState(true);
  const [overallRating, setOverallRating] = useState(0);
  const [landlordCommunication, setLandlordCommunication] = useState(3);
  const [maintenanceSpeed, setMaintenanceSpeed] = useState(3);
  const [cleanliness, setCleanliness] = useState(3);
  const [safety, setSafety] = useState(3);
  const [valueForMoney, setValueForMoney] = useState(3);
  const [monthlyBills, setMonthlyBills] = useState('');
  const [hiddenCosts, setHiddenCosts] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [wouldRentAgain, setWouldRentAgain] = useState(true);

  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        setErrorMessage('');
        const propertyData = await getPropertyById(id);
        setProperty(propertyData);
      } catch (error) {
        console.error('Failed to load property for review:', error);
        if (state?.property) {
          setProperty(state.property);
        } else {
          setErrorMessage(error.message || 'Unable to load property.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id, state]);

  const MAX_PHOTOS = 10;

function handlePhotoChange(e) {
  const selectedFiles = Array.from(e.target.files || []);
  if (!selectedFiles.length) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const validFiles = selectedFiles.filter((file) => allowedTypes.includes(file.type));

  if (validFiles.length !== selectedFiles.length) {
    setErrorMessage('Only JPG, PNG, and WEBP images are allowed.');
  }

  const nextFiles = [...photoFiles, ...validFiles].slice(0, MAX_PHOTOS);

  if (photoFiles.length + validFiles.length > MAX_PHOTOS) {
    setErrorMessage(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
  }

  setPhotoFiles(nextFiles);

  const nextPreviews = nextFiles.map((file) => URL.createObjectURL(file));
  photoPreviews.forEach((url) => URL.revokeObjectURL(url));
  setPhotoPreviews(nextPreviews);

  e.target.value = '';
}

  function removePhoto(indexToRemove) {
    const updatedFiles = photoFiles.filter((_, index) => index !== indexToRemove);
    setPhotoFiles(updatedFiles);

    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(updatedPreviews);
  }

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!overallRating || !reviewText.trim()) {
      setErrorMessage('Please add an overall rating and write your review.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const uploadedPhotos =
        photoFiles.length > 0
          ? await Promise.all(
              photoFiles.map(async (file) => ({
                name: file.name,
                type: file.type,
                url: await fileToDataUrl(file),
              }))
            )
          : [];

      const payload = {
        name: postAnonymously ? 'Anonymous Tenant' : userName,
        authorName: userName,
        authorEmail: savedUser?.email || '',
        isAnonymous: postAnonymously,
        propertyId: property.id,
        propertyTitle: property.title,
        rating: overallRating,
        date: new Date().toLocaleString('en-GB', {
          month: 'short',
          year: 'numeric',
        }),
        text: reviewText.trim(),
        billsNote: monthlyBills.trim() ? `£${monthlyBills}/month` : 'Included',
        wouldRentAgain,
        hiddenCosts: hiddenCosts ? 'Reviewer reported additional hidden costs.' : '',
        
        categoryRatings: {
          landlordCommunication,
          maintenanceSpeed,
          cleanliness,
          safety,
          valueForMoney,
        },
      };

      if (uploadedPhotos.length > 0) {
        payload.photos = uploadedPhotos;
      }

      const result = await addReviewToProperty(property.id, payload);

      navigate('/review-submitted', {
        state: {
          property,
          review: result.review,
          summary: result.summary,
        },
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      setErrorMessage(error.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container submit-review-page">
        <header className="submit-review-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <h1>Submit Review</h1>
          <div className="submit-review-spacer" />
        </header>
        <div className="submit-review-form">
          <section className="submit-card">
            <p>Loading property...</p>
          </section>
        </div>
      </div>
    );
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
          <SliderField label="Safety" value={safety} onChange={setSafety} />
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
              className={`choice-btn ${hiddenCosts ? 'active' : ''}`}
              onClick={() => setHiddenCosts(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`choice-btn ${!hiddenCosts ? 'active' : ''}`}
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
            maxLength={500}
            placeholder="Tell us about your experience living here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <small>{reviewText.length}/500 characters</small>
        </section>

        <section className="submit-card">
          <label className="submit-label">Upload Photos (Optional)</label>

          <label className="upload-box">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handlePhotoChange}
              hidden
            />
            <div className="upload-box-content">
              <ImagePlus size={18} />
              <span>Add up to 10 photos</span>
            </div>
          </label>

          {photoPreviews.length > 0 && (
            <div className="photo-preview-grid">
              {photoPreviews.map((src, index) => (
                <div className="photo-preview-item" key={index}>
                  <img src={src} alt={`Upload preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => removePhoto(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <small>Optional. JPG, PNG, or WEBP only.</small>
        </section>

        <section className="submit-card">
          <label className="submit-label">Would you rent here again? *</label>
          <div className="choice-row">
            <button
              type="button"
              className={`choice-btn ${wouldRentAgain ? 'active' : ''}`}
              onClick={() => setWouldRentAgain(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`choice-btn ${!wouldRentAgain ? 'active' : ''}`}
              onClick={() => setWouldRentAgain(false)}
            >
              No
            </button>
          </div>
        </section>

        {errorMessage && <div className="submit-note">{errorMessage}</div>}

        <div className="submit-note">
          All reviews are moderated to ensure authenticity and helpfulness. Your review
          will be visible within 24 hours.
        </div>

        <button type="submit" className="submit-review-btn" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}