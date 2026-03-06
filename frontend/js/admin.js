import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();
const userRole = localStorage.getItem("role");

// Only admin allowed
if (userRole !== "admin") {
  alert("Access Denied");
  window.location.href = "dashboard.html";
}

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

document.addEventListener("DOMContentLoaded", () => {
  loadGrievances();
  loadResources();
});

// ======================
// LOAD ALL GRIEVANCES
// ======================
async function loadGrievances() {
  const res = await fetch(`${API_URL}/grievances`);
  const grievances = await res.json();

  const list = document.getElementById("adminGrievanceList");
  list.innerHTML = "";

  grievances.forEach(g => {
    const div = document.createElement("div");
    div.className = "grievance";

    div.innerHTML = `
      <strong>${g.title}</strong>
      <p>${g.description}</p>
      <small>By: ${g.email}</small><br/>
      <button onclick="deleteGrievance(${g.id})">Delete</button>
    `;

    list.appendChild(div);
  });
}

// ======================
// DELETE GRIEVANCE (ADMIN)
// ======================
window.deleteGrievance = async function(id) {
  if (!confirm("Are you sure you want to delete this grievance?")) return;

  await fetch(`${API_URL}/grievances/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: userId
    })
  });

  loadGrievances();
};

// ======================
// LOAD ALL RESOURCES
// ======================
async function loadResources() {
  const res = await fetch(`${API_URL}/resources`);
  const resources = await res.json();

  const list = document.getElementById("adminResourceList");
  list.innerHTML = "";

  resources.forEach(r => {
    const div = document.createElement("div");
    div.className = "resource";

    div.innerHTML = `
      <strong>${r.title}</strong>
      <p>${r.description || ""}</p>
      <small>By: ${r.email}</small><br/>
      <button onclick="deleteResource(${r.id})">Delete</button>
    `;

    list.appendChild(div);
  });
}

// ======================
// DELETE RESOURCE (ADMIN)
// ======================
window.deleteResource = async function(id) {
  if (!confirm("Are you sure you want to delete this resource?")) return;

  await fetch(`${API_URL}/resources/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: userId
    })
  });

  loadResources();
};