// ✅ তোমার Render API এর বেস URL
const API_BASE = "https://my-admin-dashboard-v2.onrender.com";

// ✅ ইউজার লগইন হ্যান্ডেল করা
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert(`Welcome ${username}!`);
      window.location.href = "dashboard.html"; // redirect to dashboard page
    } else {
      alert(data.message || "Invalid credentials!");
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("Server not responding. Please try again later.");
  }
}

// ✅ Dashboard এ ইউজার ডাটা লোড করা
async function loadDashboard() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first!");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/userdata`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById("usernameDisplay").textContent = data.username;
      document.getElementById("balanceDisplay").textContent = data.balance + "৳";
    } else {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
  }
}

// ✅ Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
const API_BASE = "https://my-admin-dashboard-v2.onrender.com";
