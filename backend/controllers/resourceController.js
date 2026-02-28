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
             r.created_at, u.email
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
  } catch {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};