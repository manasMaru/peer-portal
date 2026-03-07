const pool = require("../config/db");


// =============================
// CREATE GRIEVANCE
// =============================
exports.createGrievance = async (req, res) => {
  const { title, description, user_id } = req.body || {};

  if (!title || !description || !user_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await pool.query(
      `INSERT INTO grievances (title, description, created_by)
       VALUES ($1, $2, $3)`,
      [title, description, user_id]
    );

    res.status(201).json({ message: "Grievance created successfully" });

  } catch (err) {
    console.error("CREATE GRIEVANCE ERROR:", err);
    res.status(500).json({ message: "Failed to create grievance" });
  }
};



// =============================
// GET ALL GRIEVANCES
// =============================
exports.getGrievances = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.id,
        g.title,
        g.description,
        g.is_resolved,
        g.created_at,
        g.created_by,
        u.email
      FROM grievances g
      JOIN users u ON g.created_by = u.id
      ORDER BY g.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET GRIEVANCES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch grievances" });
  }
};



// =============================
// RESOLVE GRIEVANCE (ADMIN OR OWNER)
// =============================
exports.resolveGrievance = async (req, res) => {
  const grievanceId = req.params.id;
  const user_id = req.body?.user_id; // 🔥 Safe optional chaining

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

    // 2️⃣ Get grievance owner
    const grievanceResult = await pool.query(
      "SELECT created_by FROM grievances WHERE id = $1",
      [grievanceId]
    );

    if (grievanceResult.rows.length === 0) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    const ownerId = grievanceResult.rows[0].created_by;

    // 3️⃣ Authorization check
    if (userRole !== "admin" && ownerId !== parseInt(user_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 4️⃣ Update status
    await pool.query(
      "UPDATE grievances SET is_resolved = true WHERE id = $1",
      [grievanceId]
    );

    res.json({ message: "Grievance marked as resolved" });

  } catch (err) {
    console.error("RESOLVE GRIEVANCE ERROR:", err);
    res.status(500).json({ message: "Failed to resolve grievance" });
  }
};



// =============================
// DELETE GRIEVANCE (ADMIN OR OWNER)
// =============================
exports.deleteGrievance = async (req, res) => {
  const grievanceId = req.params.id;
  const user_id = req.body?.user_id; // 🔥 Safe

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

    // 2️⃣ Get grievance owner
    const grievanceResult = await pool.query(
      "SELECT created_by FROM grievances WHERE id = $1",
      [grievanceId]
    );

    if (grievanceResult.rows.length === 0) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    const ownerId = grievanceResult.rows[0].created_by;

    // 3️⃣ Authorization check
    if (userRole !== "admin" && ownerId !== parseInt(user_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 4️⃣ Delete grievance
    await pool.query(
      "DELETE FROM grievances WHERE id = $1",
      [grievanceId]
    );

    res.json({ message: "Grievance deleted successfully" });

  } catch (err) {
    console.error("DELETE GRIEVANCE ERROR:", err);
    res.status(500).json({ message: "Failed to delete grievance" });
  }
};