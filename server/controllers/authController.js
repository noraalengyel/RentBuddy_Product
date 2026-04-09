const bcrypt = require("bcryptjs");
const db = require("../db/database");

function signup(req, res) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.trim().toLowerCase());

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db
      .prepare(
        `
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `
      )
      .run(
        fullName.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        role.trim()
      );

    const newUser = db
      .prepare(
        `
        SELECT id, full_name, email, role, location, member_since
        FROM users
        WHERE id = ?
      `
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({
      message: "Signup successful.",
      user: newUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error during signup.",
    });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        location: user.location,
        member_since: user.member_since,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error during login.",
    });
  }
}

module.exports = {
  signup,
  login,
};