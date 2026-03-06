const pool = require("../config/db");

// =============================
// CREATE REQUEST
// =============================
exports.createRequest = async (req, res) => {
  const { title, description, type, image_url, requester_contact, user_id } = req.body;

  if (!title || !description || !type || !user_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await pool.query(
      `INSERT INTO resource_requests 
       (title, description, type, image_url, requester_contact, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        title,
        description,
        type,
        image_url || null,
        requester_contact || null,
        user_id
      ]
    );

    res.status(201).json({ message: "Request created successfully" });

  } catch (err) {
    console.error("CREATE REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to create request" });
  }
};


// =============================
// GET ALL REQUESTS
// =============================
exports.getRequests = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.title,
        r.description,
        r.type,
        r.image_url,
        r.requester_contact,
        r.status,
        r.created_at,
        r.created_by,
        r.fulfilled_by,
        r.fulfillment_link,
        r.contact_details,
        u.email AS requester_email,
        p.email AS provider_email
      FROM resource_requests r
      JOIN users u ON r.created_by = u.id
      LEFT JOIN users p ON r.fulfilled_by = p.id
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};


// =============================
// OFFER RESOURCE (Single Provider)
// =============================
exports.offerResource = async (req, res) => {
  const { user_id, fulfillment_link, contact_details } = req.body;
  const requestId = req.params.id;

  if (!user_id) {
    return res.status(400).json({ message: "User ID required" });
  }

  try {
    const requestResult = await pool.query(
      "SELECT status FROM resource_requests WHERE id = $1",
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (requestResult.rows[0].status !== "open") {
      return res.status(400).json({ message: "Request already fulfilled" });
    }

    await pool.query(
      `UPDATE resource_requests
       SET fulfilled_by = $1,
           fulfillment_link = $2,
           contact_details = $3,
           status = 'fulfilled'
       WHERE id = $4`,
      [
        user_id,
        fulfillment_link || null,
        contact_details || null,
        requestId
      ]
    );

    res.json({ message: "Resource offered successfully" });

  } catch (err) {
    console.error("OFFER RESOURCE ERROR:", err);
    res.status(500).json({ message: "Failed to offer resource" });
  }
};


// =============================
// MARK AS RECEIVED (Only Requester)
// =============================
exports.markReceived = async (req, res) => {
  const { user_id } = req.body;
  const requestId = req.params.id;

  if (!user_id) {
    return res.status(400).json({ message: "User ID required" });
  }

  try {
    const requestResult = await pool.query(
      "SELECT created_by FROM resource_requests WHERE id = $1",
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (requestResult.rows[0].created_by !== parseInt(user_id)) {
      return res.status(403).json({ message: "Only requester can mark received" });
    }

    await pool.query(
      "UPDATE resource_requests SET status = 'received' WHERE id = $1",
      [requestId]
    );

    res.json({ message: "Request marked as received" });

  } catch (err) {
    console.error("MARK RECEIVED ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};


// =============================
// DELETE REQUEST (ADMIN OR OWNER)
// =============================
exports.deleteRequest = async (req, res) => {
  const { user_id } = req.body;
  const requestId = req.params.id;

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

    // 2️⃣ Get request owner
    const requestResult = await pool.query(
      "SELECT created_by FROM resource_requests WHERE id = $1",
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const ownerId = requestResult.rows[0].created_by;

    // 3️⃣ Authorization check
    if (userRole !== "admin" && ownerId !== parseInt(user_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 4️⃣ Delete request
    await pool.query(
      "DELETE FROM resource_requests WHERE id = $1",
      [requestId]
    );

    res.json({ message: "Request deleted successfully" });

  } catch (err) {
    console.error("DELETE REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to delete request" });
  }
};