const db = require("../db/database");

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBooleanFlag(value) {
  return value ? 1 : 0;
}

function clampRating(value) {
  const num = Math.round(toNumber(value, 0));
  if (num < 1) return 1;
  if (num > 5) return 5;
  return num;
}

function formatReviewDate(input) {
  if (!input) return "Recent";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Recent";
  return date.toLocaleString("en-GB", { month: "short", year: "numeric" });
}

function safeParsePhotos(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapReview(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    userId: row.user_id,
    name: row.reviewer_name,
    rating: row.overall_rating,
    date: formatReviewDate(row.created_at),
    text: row.review_text,
    billsNote: row.monthly_bills ? `£${row.monthly_bills}/month` : "Included",
    wouldRentAgain: Boolean(row.would_rent_again),
    hiddenCosts: row.hidden_costs
      ? "Reviewer reported additional hidden costs."
      : "",
    isAnonymous: Boolean(row.is_anonymous),
    photos: safeParsePhotos(row.review_photos),
    categoryRatings: {
      landlordCommunication: row.landlord_communication,
      maintenanceSpeed: row.maintenance_speed,
      cleanliness: row.cleanliness,
      safety: row.safety,
      valueForMoney: row.value_for_money,
    },
  };
}

function getPropertyOr404(propertyId, res) {
  const property = db.prepare("SELECT id FROM properties WHERE id = ?").get(propertyId);
  if (!property) {
    res.status(404).json({ message: "Property not found." });
    return null;
  }
  return property;
}

function calculateSummaryFromRows(rows) {
  const count = rows.length;

  if (!count) {
    return {
      totalReviews: 0,
      overallRating: 0,
      distribution: [5, 4, 3, 2, 1].map((score) => ({ score, count: 0 })),
      categories: {
        landlordCommunication: 0,
        maintenanceSpeed: 0,
        cleanliness: 0,
        safety: 0,
        valueForMoney: 0,
      },
    };
  }

  const totals = {
    overall: 0,
    landlordCommunication: 0,
    maintenanceSpeed: 0,
    cleanliness: 0,
    safety: 0,
    valueForMoney: 0,
  };

  const distributionMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const row of rows) {
    totals.overall += toNumber(row.overall_rating);
    totals.landlordCommunication += toNumber(row.landlord_communication);
    totals.maintenanceSpeed += toNumber(row.maintenance_speed);
    totals.cleanliness += toNumber(row.cleanliness);
    totals.safety += toNumber(row.safety);
    totals.valueForMoney += toNumber(row.value_for_money);

    const score = clampRating(row.overall_rating);
    distributionMap[score] += 1;
  }

  return {
    totalReviews: count,
    overallRating: Number((totals.overall / count).toFixed(1)),
    distribution: [5, 4, 3, 2, 1].map((score) => ({
      score,
      count: distributionMap[score],
    })),
    categories: {
      landlordCommunication: Number((totals.landlordCommunication / count).toFixed(1)),
      maintenanceSpeed: Number((totals.maintenanceSpeed / count).toFixed(1)),
      cleanliness: Number((totals.cleanliness / count).toFixed(1)),
      safety: Number((totals.safety / count).toFixed(1)),
      valueForMoney: Number((totals.valueForMoney / count).toFixed(1)),
    },
  };
}

function syncPropertyAggregate(propertyId) {
  const rows = db
    .prepare(
      `SELECT overall_rating, landlord_communication, maintenance_speed, cleanliness, safety, value_for_money
       FROM reviews
       WHERE property_id = ?
       ORDER BY datetime(created_at) DESC, id DESC`
    )
    .all(propertyId);

  const summary = calculateSummaryFromRows(rows);

  db.prepare(
    `UPDATE properties
     SET rating = ?, reviews_count = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(summary.overallRating, summary.totalReviews, propertyId);

  return summary;
}

function getReviewsByProperty(req, res) {
  try {
    const propertyId = Number(req.params.id);
    if (!getPropertyOr404(propertyId, res)) return;

    const rows = db
      .prepare(
        `SELECT *
         FROM reviews
         WHERE property_id = ?
         ORDER BY datetime(created_at) DESC, id DESC`
      )
      .all(propertyId);

    return res.json(rows.map(mapReview));
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews." });
  }
}

function getReviewSummary(req, res) {
  try {
    const propertyId = Number(req.params.id);
    if (!getPropertyOr404(propertyId, res)) return;

    const rows = db
      .prepare(
        `SELECT overall_rating, landlord_communication, maintenance_speed, cleanliness, safety, value_for_money
         FROM reviews
         WHERE property_id = ?`
      )
      .all(propertyId);

    return res.json(calculateSummaryFromRows(rows));
  } catch (error) {
    console.error("Get review summary error:", error);
    return res.status(500).json({ message: "Failed to fetch review summary." });
  }
}

function createReview(req, res) {
  try {
    const propertyId = Number(req.params.id);
    if (!getPropertyOr404(propertyId, res)) return;

    const {
      userId = null,
      name,
      rating,
      reviewText,
      monthlyBills = "",
      hiddenCosts = false,
      wouldRentAgain = true,
      categoryRatings = {},
      photos = [],
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Reviewer name is required." });
    }

    if (!reviewText || !String(reviewText).trim()) {
      return res.status(400).json({ message: "Review text is required." });
    }

    if (!rating) {
      return res.status(400).json({ message: "Overall rating is required." });
    }

    const safePhotos = Array.isArray(photos) ? photos : [];

    const result = db
      .prepare(
        `INSERT INTO reviews (
          property_id,
          user_id,
          reviewer_name,
          overall_rating,
          landlord_communication,
          maintenance_speed,
          cleanliness,
          safety,
          value_for_money,
          monthly_bills,
          hidden_costs,
          review_text,
          would_rent_again,
          is_anonymous,
          review_photos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        propertyId,
        userId || null,
        String(name).trim(),
        clampRating(rating),
        clampRating(categoryRatings.landlordCommunication || 3),
        clampRating(categoryRatings.maintenanceSpeed || 3),
        clampRating(categoryRatings.cleanliness || 3),
        clampRating(categoryRatings.safety || 3),
        clampRating(categoryRatings.valueForMoney || 3),
        String(monthlyBills || "").trim(),
        toBooleanFlag(hiddenCosts),
        String(reviewText).trim(),
        toBooleanFlag(wouldRentAgain),
        toBooleanFlag(String(name).trim() === "Anonymous Tenant"),
        JSON.stringify(safePhotos)
      );

    const inserted = db.prepare("SELECT * FROM reviews WHERE id = ?").get(result.lastInsertRowid);
    const summary = syncPropertyAggregate(propertyId);

    return res.status(201).json({
      message: "Review submitted successfully.",
      review: mapReview(inserted),
      summary,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Failed to submit review." });
  }
}

function getReviewsByUser(req, res) {
  try {
    const userId = Number(req.params.userId);

    const rows = db
      .prepare(
        `
        SELECT
          r.*,
          p.title AS property_title,
          p.address AS property_address
        FROM reviews r
        JOIN properties p ON r.property_id = p.id
        WHERE r.user_id = ?
        ORDER BY datetime(r.created_at) DESC, r.id DESC
        `
      )
      .all(userId);

    const reviews = rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      propertyTitle: row.property_title,
      propertyAddress: row.property_address,
      rating: row.overall_rating,
      text: row.review_text,
      date: formatReviewDate(row.created_at),
      createdAt: row.created_at,
      billsNote: row.monthly_bills ? `£${row.monthly_bills}/month` : "Included",
      wouldRentAgain: Boolean(row.would_rent_again),
      isAnonymous: Boolean(row.is_anonymous),
      photos: safeParsePhotos(row.review_photos),
    }));

    return res.json({ reviews });
  } catch (error) {
    console.error("Get user reviews error:", error);
    return res.status(500).json({
      message: "Failed to fetch user reviews.",
    });
  }
}

function deleteReview(req, res) {
  try {
    const reviewId = Number(req.params.reviewId);

    const review = db.prepare("SELECT * FROM reviews WHERE id = ?").get(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    db.prepare("DELETE FROM reviews WHERE id = ?").run(reviewId);
    syncPropertyAggregate(review.property_id);

    return res.json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      message: "Failed to delete review.",
    });
  }
}

module.exports = {
  getReviewsByProperty,
  getReviewSummary,
  createReview,
  getReviewsByUser,
  deleteReview,
};