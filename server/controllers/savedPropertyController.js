const db = require("../db/database");

function mapProperty(row) {
  return {
    ...row,
    bills: Boolean(row.bills),
    nearbyTo: JSON.parse(row.nearby_to || "[]"),
    pros: JSON.parse(row.pros || "[]"),
    cons: JSON.parse(row.cons || "[]"),
    tenantReviews: JSON.parse(row.tenant_reviews || "[]"),
    reviews: row.reviews_count,
    councilTax: row.council_tax,
    moveIn: row.move_in,
    landlordRating: row.landlord_rating,
    savedAt: row.stated_at || row.created_at || null,
  };
}

function saveProperty(req, res) {
  try {
    const { userId, propertyId } = req.body;

    if (!userId || !propertyId) {
      return res.status(400).json({
        message: "userId and propertyId are required.",
      });
    }

    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const property = db.prepare("SELECT id FROM properties WHERE id = ?").get(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    const existing = db
      .prepare(
        `SELECT id
         FROM saved_properties
         WHERE user_id = ? AND property_id = ?`
      )
      .get(userId, propertyId);

    if (existing) {
      return res.status(200).json({ message: "Property already saved." });
    }

    db.prepare(
      `INSERT INTO saved_properties (user_id, property_id)
       VALUES (?, ?)`
    ).run(userId, propertyId);

    return res.status(201).json({ message: "Property saved successfully." });
  } catch (error) {
    console.error("Save property error:", error);
    return res.status(500).json({ message: "Failed to save property." });
  }
}

function removeSavedProperty(req, res) {
  try {
    const userId = Number(req.params.userId);
    const propertyId = Number(req.params.propertyId);

    const result = db
      .prepare(
        `DELETE FROM saved_properties
         WHERE user_id = ? AND property_id = ?`
      )
      .run(userId, propertyId);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Saved property not found." });
    }

    return res.json({ message: "Property removed successfully." });
  } catch (error) {
    console.error("Remove saved property error:", error);
    return res.status(500).json({ message: "Failed to remove saved property." });
  }
}

function getSavedProperties(req, res) {
  try {
    const userId = Number(req.params.userId);

    const rows = db
      .prepare(
        `SELECT 
            p.*, 
            sp.created_at AS saved_at
         FROM saved_properties sp
         JOIN properties p ON p.id = sp.property_id
         WHERE sp.user_id = ?
         ORDER BY datetime(sp.created_at) DESC, sp.id DESC`
      )
      .all(userId);

    const properties = rows.map(mapProperty);
    return res.json(properties);
  } catch (error) {
    console.error("Get saved properties error:", error);
    return res.status(500).json({ message: "Failed to fetch saved properties." });
  }
}

function checkSavedProperty(req, res) {
  try {
    const userId = Number(req.params.userId);
    const propertyId = Number(req.params.propertyId);

    const saved = db
      .prepare(
        `SELECT id
         FROM saved_properties
         WHERE user_id = ? AND property_id = ?`
      )
      .get(userId, propertyId);

    return res.json({ saved: Boolean(saved) });
  } catch (error) {
    console.error("Check saved property error:", error);
    return res.status(500).json({ message: "Failed to check saved property." });
  }
}

module.exports = {
  saveProperty,
  removeSavedProperty,
  getSavedProperties,
  checkSavedProperty,
};