import { requireAuth, logout } from "./utils.js";

requireAuth();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("grievancesBtn")
    .addEventListener("click", () => {
      window.location.href = "grievances.html";
    });

  document.getElementById("resourcesBtn")
    .addEventListener("click", () => {
      window.location.href = "resources.html";
    });

  document.getElementById("logoutBtn")
    .addEventListener("click", logout);
});