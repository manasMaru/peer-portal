import { requireAuth, logout } from "./utils.js";

const userId = requireAuth();
const role = localStorage.getItem("role");
const email = localStorage.getItem("email");

document.addEventListener("DOMContentLoaded", () => {

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
  grievancesBtn?.addEventListener("click", () => {
    window.location.href = "grievances.html";
  });

  resourcesBtn?.addEventListener("click", () => {
    window.location.href = "resources.html";
  });

  logoutBtn?.addEventListener("click", logout);

  // =============================
  // FIXED ADMIN BUTTON LOGIC
  // =============================
  if (adminBtn) {
    if (role === "admin") {
      // 🔥 REMOVE hidden class for admin
      adminBtn.classList.remove("hidden");

      adminBtn.addEventListener("click", () => {
        window.location.href = "admin.html";
      });
    } else {
      // Remove completely for students
      adminBtn.remove();
    }
  }

});