import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = "mysecret";

// ✅ ES module path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// ✅ Dummy user data
const users = [
  { username: "sumon", password: "1234", balance: 500 },
  { username: "harun", password: "5678", balance: 1200 }
];

// ✅ Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials!" });

  const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// ✅ User data API
app.get("/api/userdata", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = users.find(u => u.username === decoded.username);
    res.json({ username: user.username, balance: user.balance });
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
});

// ✅ Default route → Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
