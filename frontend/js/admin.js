import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();
const userRole = localStorage.getItem("role");

// ==============================
// ADMIN PROTECTION
// ==============================
if (userRole !== "admin") {
  alert("Access Denied");
  window.location.href = "dashboard.html";
}

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }

  setupCollapsibleSections();

  loadGrievances();
  loadResources();
  loadRequests();
});


// =======================================================
// COLLAPSE / EXPAND (MATCHES YOUR HTML)
// =======================================================

function setupCollapsibleSections() {

  const headers = document.querySelectorAll(".admin-section-header");

  headers.forEach(header => {

    header.addEventListener("click", () => {

      const targetId = header.dataset.target;
      const content = document.getElementById(targetId);
      const icon = header.querySelector(".toggle-icon");

      if (!content) return;

      content.classList.toggle("collapsed");

      if (content.classList.contains("collapsed")) {
        icon.textContent = "▶";
      } else {
        icon.textContent = "▼";
      }

    });

  });
}


// =======================================================
// =================== GRIEVANCES ========================
// =======================================================

async function loadGrievances() {

  const res = await fetch(`${API_URL}/grievances`);
  const grievances = await res.json();

  const list = document.getElementById("adminGrievanceList");
  if (!list) return;

  list.innerHTML = "";

  grievances.forEach(g => {

    const div = document.createElement("div");
    div.className = "admin-card";

    div.innerHTML = `
      <div class="card-header">
        <strong>${g.title}</strong>
        <span class="status-badge ${g.is_resolved ? "completed" : ""}">
          ${g.is_resolved ? "Resolved" : "Open"}
        </span>
      </div>

      <p>${g.description}</p>

      <small class="meta"><strong>By:</strong> ${g.email}</small>

      <div class="card-actions">
        <input 
          type="text" 
          id="admin-reply-${g.id}" 
          placeholder="Write reply..."
          class="admin-input"
        />

        <button class="primary-small-btn" data-admin-reply="${g.id}">
          Reply
        </button>

        ${
          !g.is_resolved
            ? `<button class="success-small-btn" data-admin-resolve="${g.id}">
                 Mark Resolved
               </button>`
            : ""
        }

        <button class="danger-btn" data-delete-grievance="${g.id}">
          Delete
        </button>
      </div>

      <div id="admin-replies-${g.id}" class="admin-replies"></div>
    `;

    list.appendChild(div);
    loadReplies(g.id);
  });

  attachGrievanceEvents();
}

function attachGrievanceEvents() {

  document.querySelectorAll("[data-delete-grievance]").forEach(btn => {
    btn.onclick = () => deleteGrievance(btn.dataset.deleteGrievance);
  });

  document.querySelectorAll("[data-admin-reply]").forEach(btn => {
    btn.onclick = () => addAdminReply(btn.dataset.adminReply);
  });

  document.querySelectorAll("[data-admin-resolve]").forEach(btn => {
    btn.onclick = () => resolveGrievance(btn.dataset.adminResolve);
  });
}

async function loadReplies(grievanceId) {

  const res = await fetch(`${API_URL}/replies/${grievanceId}`);
  const replies = await res.json();

  const box = document.getElementById(`admin-replies-${grievanceId}`);
  if (!box) return;

  box.innerHTML = "";

  replies.forEach(r => {
    box.innerHTML += `
      <div class="reply-item">
        ↳ <strong>${r.email}</strong>: ${r.message}
      </div>
    `;
  });
}

async function addAdminReply(grievanceId) {

  const input = document.getElementById(`admin-reply-${grievanceId}`);
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  await fetch(`${API_URL}/replies/${grievanceId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message })
  });

  input.value = "";
  loadReplies(grievanceId);
}

async function resolveGrievance(grievanceId) {

  await fetch(`${API_URL}/grievances/${grievanceId}/resolve`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  loadGrievances();
}

async function deleteGrievance(id) {

  if (!confirm("Delete this grievance?")) return;

  await fetch(`${API_URL}/grievances/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  loadGrievances();
}


// =======================================================
// ===================== RESOURCES =======================
// =======================================================

async function loadResources() {

  const res = await fetch(`${API_URL}/resources`);
  const resources = await res.json();

  const list = document.getElementById("adminResourceList");
  if (!list) return;

  list.innerHTML = "";

  resources.forEach(r => {

    const div = document.createElement("div");
    div.className = "admin-card";

    div.innerHTML = `
      <div class="card-header">
        <strong>${r.title}</strong>
        <span class="type-badge">${r.type}</span>
      </div>

      <p>${r.description || ""}</p>

      ${
        r.type === "digital"
          ? (r.link
              ? `<a href="${r.link}" target="_blank" class="link-btn">Open Resource</a>`
              : `<small>No link provided</small>`)
          : (r.image_url
              ? `<img src="${r.image_url}" class="card-img" />`
              : `<small>No image available</small>`)
      }

      <small class="meta"><strong>Shared by:</strong> ${r.email}</small>

      <div class="card-actions">
        <button class="danger-btn" data-delete-resource="${r.id}">
          Delete
        </button>
      </div>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll("[data-delete-resource]").forEach(btn => {
    btn.onclick = () => deleteResource(btn.dataset.deleteResource);
  });
}

async function deleteResource(id) {

  if (!confirm("Delete this resource?")) return;

  await fetch(`${API_URL}/resources/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  loadResources();
}


// =======================================================
// ====================== REQUESTS =======================
// =======================================================

async function loadRequests() {

  const res = await fetch(`${API_URL}/requests`);
  const requests = await res.json();

  const list = document.getElementById("adminRequestList");
  if (!list) return;

  list.innerHTML = "";

  requests.forEach(req => {

    const div = document.createElement("div");
    div.className = "admin-card";

    div.innerHTML = `
      <div class="card-header">
        <strong>${req.title}</strong>
        <span class="type-badge">${req.status}</span>
      </div>

      <p>${req.description}</p>

      <small class="meta">
        <strong>Requested by:</strong> ${req.requester_email}
      </small>

      <div class="card-actions">
        <button class="danger-btn" data-delete-request="${req.id}">
          Delete
        </button>
      </div>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll("[data-delete-request]").forEach(btn => {
    btn.onclick = () => deleteRequest(btn.dataset.deleteRequest);
  });
}

async function deleteRequest(id) {

  if (!confirm("Delete this request?")) return;

  await fetch(`${API_URL}/requests/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  loadRequests();
}