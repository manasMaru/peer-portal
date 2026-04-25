import { requireAuth, logout } from "./utils.js";

const userId = requireAuth();//if user_id not exist in localstorage redirect to login.html 
const role = localStorage.getItem("role");
const email = localStorage.getItem("email");

document.addEventListener("DOMContentLoaded", () => {//DOMContentLoaded is a browser event that fires when the HTML is fully loaded and parsed.

  const grievancesBtn = document.getElementById("grievancesBtn");
  const resourcesBtn = document.getElementById("resourcesBtn");
  const adminBtn = document.getElementById("adminBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const emailSpan = document.getElementById("userEmail");
  const roleBadge = document.getElementById("userRole");

  // =============================
  // Show user email
  // =============================
  if (emailSpan) {
    emailSpan.textContent = email || "Unknown User";
  }

  // =============================
  // Show role badge
  // =============================
  if (roleBadge && role) {
    roleBadge.textContent = role.toUpperCase();

    if (role === "admin") {
      roleBadge.classList.add("role-admin");
    } else {
      roleBadge.classList.add("role-user");
    }
  }

  // =============================
  // Navigation
  // =============================
  grievancesBtn?.addEventListener("click", () => {//if grievancebtn exists only 
    window.location.href = "grievances.html";
  });

  resourcesBtn?.addEventListener("click", () => {
    window.location.href = "resources.html";
  });

  logoutBtn?.addEventListener("click", logout);

  // =============================
  // ADMIN BUTTON LOGIC
  // =============================
// Check if admin button exists
if (adminBtn) {
  // If user is admin
  if (role === "admin") {
    // Show the button (remove hidden class)
    adminBtn.classList.remove("hidden");
    // Go to admin page on click
    adminBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
  } else {
    // If NOT admin → remove button completely from the page
    adminBtn.remove();
  }
}
});