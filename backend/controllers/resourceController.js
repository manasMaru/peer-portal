const pool = require("../config/db");

exports.addResource = async (req, res) => {
  const {
    title,
    description,
    type,
    link,
    image_url,
    contact_details,
    user_id
  } = req.body;

  if (!title || !type || !user_id)
    return res.status(400).json({ message: "Required fields missing" });

  try {
    await pool.query(
      `INSERT INTO resources
       (title, description, type, link, image_url, contact_details, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        title,
        description,
        type,
        link || null,
        image_url || null,
        contact_details || null,
        user_id
      ]
    );

    res.status(201).json({ message: "Resource added successfully" });
  } catch {
    res.status(500).json({ message: "Failed to add resource" });
  }
};

exports.getResources = async (req, res) => {
  const { type } = req.query;

  try {
    let query = `
      SELECT r.id, r.title, r.description, r.type,
             r.link, r.image_url, r.contact_details,
             r.created_at, r.created_by, u.email
      FROM resources r
      JOIN users u ON r.created_by = u.id
    `;
    const params = [];

    if (type) {
      query += " WHERE r.type = $1";
      params.push(type);
    }

    query += " ORDER BY r.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error("GET RESOURCES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

// =============================
// DELETE RESOURCE (ADMIN OR OWNER)
// =============================
exports.deleteResource = async (req, res) => {
  const { user_id } = req.body;
  const resourceId = req.params.id;

  if (!user_id) {
    return res.status(400).json({ message: "User ID required" });
  }

  try {
    // 1️⃣ Get user role
    const userResult = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ message: "User not found" });
    }

    const userRole = userResult.rows[0].role;

    // 2️⃣ Get resource owner
    const resourceResult = await pool.query(
      "SELECT created_by FROM resources WHERE id = $1",
      [resourceId]
    );

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const ownerId = resourceResult.rows[0].created_by;

    // 3️⃣ Authorization check
    if (userRole !== "admin" && ownerId !== parseInt(user_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 4️⃣ Delete resource
    await pool.query(
      "DELETE FROM resources WHERE id = $1",
      [resourceId]
    );

    res.json({ message: "Resource deleted successfully" });

  } catch (err) {
    console.error("DELETE RESOURCE ERROR:", err);
    res.status(500).json({ message: "Failed to delete resource" });
  }
};