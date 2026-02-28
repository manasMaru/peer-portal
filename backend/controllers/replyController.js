const pool = require("../config/db");

exports.addReply = async (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message)
    return res.status(400).json({ message: "User and message required" });

  try {
    await pool.query(
      `INSERT INTO replies (grievance_id, user_id, message)
       VALUES ($1, $2, $3)`,
      [req.params.id, user_id, message]
    );

    res.status(201).json({ message: "Reply added successfully" });
  } catch {
    res.status(500).json({ message: "Failed to add reply" });
  }
};

exports.getReplies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.message, r.created_at, u.email
       FROM replies r
       JOIN users u ON r.user_id = u.id
       WHERE r.grievance_id = $1
       ORDER BY r.created_at ASC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Failed to fetch replies" });
  }
};