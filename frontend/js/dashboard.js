import { requireAuth, logout } from "./utils.js";

const userId = requireAuth();
const role = localStorage.getItem("role");

document.addEventListener("DOMContentLoaded", () => {
  const grievancesBtn = document.getElementById("grievancesBtn");
  const resourcesBtn = document.getElementById("resourcesBtn");
  const adminBtn = document.getElementById("adminBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  grievancesBtn.addEventListener("click", () => {
    window.location.href = "grievances.html";
  });

  resourcesBtn.addEventListener("click", () => {
    window.location.href = "resources.html";
  });

  logoutBtn.addEventListener("click", logout);

  // Show admin button only if role is admin
  if (role === "admin" && adminBtn) {
    adminBtn.style.display = "block";

    adminBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
  }
});