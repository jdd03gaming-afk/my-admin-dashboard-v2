import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ MyBot API is running successfully!");
});

// ✅ Simple login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Demo users
  const users = {
    sumon: { password: "sumon123", data: "Hello Sumon! Your dashboard data is ready." },
    harun: { password: "harun123", data: "Welcome Harun! Here is your data." },
  };

  const user = users[username];
  if (user && user.password === password) {
    res.json({ success: true, message: "Login successful", data: user.data });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password" });
  }
});

// ✅ Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
