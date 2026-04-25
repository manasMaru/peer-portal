const bcrypt = require("bcrypt");
const pool = require("../config/db");

exports.signup = async (req, res) => {
  const { email, password } = req.body;//destructuring, same as, const email = req.body.email; const password = req.body.password;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
  console.error("SIGNUP ERROR:", err);
  res.status(500).json({ message: "Signup failed" });
}
};

exports.login = async (req, res) => {
  const { email, password } = req.body;//destructuring, same as, const email = req.body.email; const password = req.body.password;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({message: "Login successful",user_id: user.id,role: user.role});
  } catch (err) {
  console.error("LOGIN ERROR:", err);
  res.status(500).json({ message: "Login failed" });
}
};