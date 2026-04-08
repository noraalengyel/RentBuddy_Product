import { initialProperties } from "../data/propertiesData";

const STORAGE_KEY = "rentbuddy_properties";

function calculatePropertyStats(property) {
  const reviews = Array.isArray(property.tenantReviews) ? property.tenantReviews : [];

  if (!reviews.length) {
    return {
      ...property,
      rating: property.rating || 0,
      reviews: 0,
    };
  }

  const average =
    reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
    reviews.length;

  return {
    ...property,
    rating: Number(average.toFixed(1)),
    reviews: reviews.length,
  };
}

export function getProperties() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const enriched = initialProperties.map(calculatePropertyStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    return enriched;
  }

  try {
    const parsed = JSON.parse(saved);
    return parsed.map(calculatePropertyStats);
  } catch {
    const enriched = initialProperties.map(calculatePropertyStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    return enriched;
  }
}

export function saveProperties(properties) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
}

export function getPropertyById(id) {
  const properties = getProperties();
  return properties.find((property) => String(property.id) === String(id));
}

export function addReviewToProperty(propertyId, review) {
  const properties = getProperties();

  const updated = properties.map((property) => {
    if (String(property.id) !== String(propertyId)) return property;

    const currentReviews = Array.isArray(property.tenantReviews)
      ? property.tenantReviews
      : [];

    const newReview = {
      id: Date.now(),
      ...review,
    };

    const updatedProperty = {
      ...property,
      tenantReviews: [newReview, ...currentReviews],
    };

    return calculatePropertyStats(updatedProperty);
  });

  saveProperties(updated);
  return updated.find((property) => String(property.id) === String(propertyId));
}