const API_BASE_URL = "http://localhost:5000/api";

async function handleJsonResponse(response, fallbackMessage) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export async function getProperties() {
  const response = await fetch(`${API_BASE_URL}/properties`);
  return handleJsonResponse(response, "Failed to fetch properties");
}

export async function getPropertyById(id) {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  return handleJsonResponse(response, "Failed to fetch property");
}

export async function getPropertyReviews(id) {
  const response = await fetch(`${API_BASE_URL}/properties/${id}/reviews`);
  return handleJsonResponse(response, "Failed to fetch reviews");
}

export async function getReviewSummary(id) {
  const response = await fetch(`${API_BASE_URL}/properties/${id}/reviews/summary`);
  return handleJsonResponse(response, "Failed to fetch review summary");
}

export async function addReviewToProperty(id, reviewPayload) {
  const formData = new FormData();

  Object.entries(reviewPayload).forEach(([key, value]) => {
    if (key === "photos") return;
    if (key === "categoryRatings") {
      formData.append("categoryRatings", JSON.stringify(value));
      return;
    }

    formData.append(key, value ?? "");
  });

  if (Array.isArray(reviewPayload.photos)) {
    reviewPayload.photos.forEach((file) => {
      formData.append("photos", file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/properties/${id}/reviews`, {
    method: "POST",
    body: formData,
  });

  return handleJsonResponse(response, "Failed to submit review");
}

export async function saveProperty(userId, propertyId) {
  const response = await fetch(`${API_BASE_URL}/saved-properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, propertyId }),
  });

  return handleJsonResponse(response, "Failed to save property");
}

export async function removeSavedProperty(userId, propertyId) {
  const response = await fetch(`${API_BASE_URL}/saved-properties/${userId}/${propertyId}`, {
    method: "DELETE",
  });

  return handleJsonResponse(response, "Failed to remove saved property");
}

export async function getSavedProperties(userId) {
  const response = await fetch(`${API_BASE_URL}/saved-properties/${userId}`);
  return handleJsonResponse(response, "Failed to fetch saved properties");
}

export async function checkSavedProperty(userId, propertyId) {
  const response = await fetch(`${API_BASE_URL}/saved-properties/${userId}/${propertyId}`);
  return handleJsonResponse(response, "Failed to check saved property");
}

export async function sendPropertyInquiry(payload) {
  const response = await fetch(`${API_BASE_URL}/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to send inquiry");
}

export async function getUserInquiries(userId) {
  const response = await fetch(`${API_BASE_URL}/inquiries/user/${userId}`);
  return handleJsonResponse(response, "Failed to fetch user inquiries");
}

export async function getPropertyInquiries(propertyId) {
  const response = await fetch(`${API_BASE_URL}/inquiries/property/${propertyId}`);
  return handleJsonResponse(response, "Failed to fetch property inquiries");
}

export async function getReviewsByUser(userEmail, userName) {
  const properties = await getProperties();

  const reviews = [];

  properties.forEach((property) => {
    const propertyReviews = Array.isArray(property.tenantReviews)
      ? property.tenantReviews
      : [];

    propertyReviews.forEach((review) => {
      const matchesUser =
        (userEmail && review.authorEmail === userEmail) ||
        (userName && review.authorName === userName);

      if (matchesUser) {
        reviews.push({
          ...review,
          propertyId: property.id,
          propertyTitle: property.title,
          propertyImage: property.image,
          propertyAddress: property.address,
        });
      }
    });
  });

  return reviews.sort((a, b) => (b.id || 0) - (a.id || 0));
}