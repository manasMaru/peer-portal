const pool = require("../config/db");

exports.createGrievance = async (req, res) => {
  const { title, description, user_id } = req.body;

  if (!title || !description || !user_id)
    return res.status(400).json({ message: "All fields are required" });

  try {
    await pool.query(
      `INSERT INTO grievances (title, description, created_by)
       VALUES ($1, $2, $3)`,
      [title, description, user_id]
    );

    res.status(201).json({ message: "Grievance created successfully" });
  } catch {
    res.status(500).json({ message: "Failed to create grievance" });
  }
};

exports.getGrievances = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.id, g.title, g.description, g.is_resolved,
             g.created_at, u.email
      FROM grievances g
      JOIN users u ON g.created_by = u.id
      ORDER BY g.created_at DESC
    `);

    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Failed to fetch grievances" });
  }
};

exports.resolveGrievance = async (req, res) => {
  try {
    await pool.query(
      "UPDATE grievances SET is_resolved = true WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Grievance marked as resolved" });
  } catch {
    res.status(500).json({ message: "Failed to resolve grievance" });
  }
};