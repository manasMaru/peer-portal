const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// SIGNUP
// =====================
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// =====================
// LOGIN
// =====================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user_id: user.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// =====================
// GRIEVANCES
// =====================
app.post("/grievances", async (req, res) => {
  const { title, description, user_id } = req.body;

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
    console.error(err);
    res.status(500).json({ message: "Failed to create grievance" });
  }
});

app.get("/grievances", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.id, g.title, g.description, g.is_resolved,
             g.created_at, u.email
      FROM grievances g
      JOIN users u ON g.created_by = u.id
      ORDER BY g.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch grievances" });
  }
});

app.put("/grievances/:id/resolve", async (req, res) => {
  try {
    await pool.query(
      "UPDATE grievances SET is_resolved = true WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Grievance marked as resolved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resolve grievance" });
  }
});

// =====================
// REPLIES
// =====================
app.post("/grievances/:id/replies", async (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ message: "User and message required" });
  }

  try {
    await pool.query(
      `INSERT INTO replies (grievance_id, user_id, message)
       VALUES ($1, $2, $3)`,
      [req.params.id, user_id, message]
    );

    res.status(201).json({ message: "Reply added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add reply" });
  }
});

app.get("/grievances/:id/replies", async (req, res) => {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch replies" });
  }
});

// =====================
// RESOURCES (UPDATED)
// =====================
app.post("/resources", async (req, res) => {
  const {
    title,
    description,
    type,
    link,
    image_url,
    contact_details,
    user_id
  } = req.body;

  if (!title || !type || !user_id) {
    return res.status(400).json({ message: "Required fields missing" });
  }

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add resource" });
  }
});

app.get("/resources", async (req, res) => {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// =====================
// TEST
// =====================
app.get("/", (req, res) => {
  res.send("Peer Portal Backend Running");
});

// =====================
// SERVER
// =====================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});