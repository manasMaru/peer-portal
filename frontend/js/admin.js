import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();
const userRole = localStorage.getItem("role");

// Only admin allowed
if (userRole !== "admin") {
  alert("Access Denied");
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  loadGrievances();
  loadResources();
  loadRequests();
});


// =======================================================
// GRIEVANCES
// =======================================================

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
      <small><strong>By:</strong> ${g.email}</small><br/>
      <button data-delete-grievance="${g.id}">Delete</button>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll("[data-delete-grievance]").forEach(btn => {
    btn.onclick = () => deleteGrievance(btn.dataset.deleteGrievance);
  });
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
// RESOURCES
// =======================================================

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

      ${
        r.type === "digital"
          ? (r.link
              ? `<a href="${r.link}" target="_blank">Open Resource</a><br/>`
              : `<small>No link provided</small><br/>`)
          : (r.image_url
              ? `<img src="${r.image_url}" width="150"/><br/>`
              : `<small>No image available</small><br/>`)
      }

      ${
        r.type === "physical" && r.contact_details
          ? `<small><strong>Contact:</strong> ${r.contact_details}</small><br/>`
          : ""
      }

      <small><strong>Shared by:</strong> ${r.email}</small><br/>

      <button data-delete-resource="${r.id}">Delete</button>
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
// REQUESTS (FINAL CORRECT VERSION)
// =======================================================

async function loadRequests() {
  const res = await fetch(`${API_URL}/requests`);
  const requests = await res.json();

  const list = document.getElementById("adminRequestList");
  list.innerHTML = "";

  requests.forEach(req => {

    let fulfillmentSection = "";

    if (req.status === "fulfilled" || req.status === "received") {
      fulfillmentSection = `
        <small><strong>Provided by:</strong> ${req.provider_email || "N/A"}</small><br/>

        ${
          req.type === "digital"
            ? (req.fulfillment_link
                ? `<a href="${req.fulfillment_link}" target="_blank">Open Resource</a><br/>`
                : "")
            : (req.fulfillment_link
                ? `<img src="${req.fulfillment_link}" width="150"/><br/>`
                : "")
        }

        ${
          req.contact_details
            ? `<small><strong>Provider Contact:</strong> ${req.contact_details}</small><br/>`
            : ""
        }

        ${
          req.status === "received"
            ? `<p><strong>Status:</strong> Completed ✅</p>`
            : ""
        }
      `;
    }

    const div = document.createElement("div");
    div.className = "resource";

    div.innerHTML = `
      <strong>${req.title}</strong>
      <p>${req.description}</p>

      ${
        req.image_url
          ? `<img src="${req.image_url}" width="150"/><br/>`
          : ""
      }

      <small><strong>Requested by:</strong> ${req.requester_email}</small><br/>

      ${
        req.requester_contact
          ? `<small><strong>Requester Contact:</strong> ${req.requester_contact}</small><br/>`
          : ""
      }

      <small><strong>Status:</strong> ${req.status}</small><br/>

      ${fulfillmentSection}

      <button data-delete-request="${req.id}">Delete</button>
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