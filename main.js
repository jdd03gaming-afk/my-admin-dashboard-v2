// ==========================
// ✅ FRONTEND MAIN.JS
// ==========================

// 🔗 https://my-admin-dashboard-v2.onrender.com/
const API_BASE = "https://my-admin-dashboard-v2.onrender.com";

// ==========================
// 🔐 Login Function
// ==========================
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("⚠️ Please enter both username and password!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // টোকেন LocalStorage এ রাখো
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      alert(`✅ Welcome, ${username}! Redirecting to dashboard...`);
      window.location.href = "dashboard.html";
    } else {
      alert(`❌ ${data.message || "Invalid username or password!"}`);
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("⚠️ Server not responding. Try again later.");
  }
}

// ==========================
// 📊 Dashboard Load Function
// ==========================
async function loadDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Please log in first!");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/userdata`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById("usernameDisplay").textContent = data.username;
      document.getElementById("balanceDisplay").textContent = `${data.balance}৳`;
    } else {
      alert("Session expired! Please log in again.");
      logout();
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
  }
}

// ==========================
// 🚪 Logout Function
// ==========================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

// ==========================
// 🧠 Auto Bind (Event Attach)
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
  }

  if (document.getElementById("logoutBtn")) {
    document.getElementById("logoutBtn").addEventListener("click", logout);
  }

  if (document.body.id === "dashboardPage") {
    loadDashboard();
  }
});
