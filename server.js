const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "https://vertexshares.netlify.app" }));

const db = mysql.createConnection({
  host: "127.0.0.1", // Change this if you're using a cloud database
  user: "root",      // Your MySQL username
  password: "0905533@Mi", // Your MySQL password
  database: "vertexshares_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

// Signup Route
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("All fields are required");
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send("Error hashing password");
    const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(query, [name, email, hash], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).send("Email already exists");
        }
        return res.status(500).send("Database error");
      }
      res.status(201).send("User registered successfully");
    });
  });
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("All fields are required");
  }
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send("Database error");
    if (results.length === 0) return res.status(404).send("User not found");
    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) return res.status(500).send("Error comparing passwords");
      if (!isMatch) return res.status(401).send("Invalid credentials");
      const token = jwt.sign({ id: results[0].id }, "secretkey", { expiresIn: "1h" });
      res.json({ token });
    });
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
