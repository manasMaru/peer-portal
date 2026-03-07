import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();
const userRole = localStorage.getItem("role");

let allResources = [];
let currentFilter = "";

// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {

  showResourcesSection();

  document.getElementById("showResourcesBtn")
    .addEventListener("click", showResourcesSection);

  document.getElementById("showRequestsBtn")
    .addEventListener("click", showRequestsSection);

  document.getElementById("rType")
    .addEventListener("change", toggleFields);

  document.getElementById("addResourceBtn")
    .addEventListener("click", addResource);

  document.getElementById("addRequestBtn")
    .addEventListener("click", addRequest);

  document.getElementById("backBtn")
    .addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

  // FILTER BUTTONS
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {

      document.querySelectorAll(".filter-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      currentFilter = btn.dataset.type;
      renderResources();
    });
  });

});


// =======================================================
// SECTION TOGGLE
// =======================================================

function showResourcesSection() {
  document.getElementById("resourceSection").classList.remove("hidden");
  document.getElementById("requestSection").classList.add("hidden");

  document.getElementById("showResourcesBtn").classList.add("active");
  document.getElementById("showRequestsBtn").classList.remove("active");

  loadResources();
}

function showRequestsSection() {
  document.getElementById("resourceSection").classList.add("hidden");
  document.getElementById("requestSection").classList.remove("hidden");

  document.getElementById("showRequestsBtn").classList.add("active");
  document.getElementById("showResourcesBtn").classList.remove("active");

  loadRequests();
}


// =======================================================
// RESOURCE SECTION
// =======================================================

function toggleFields() {
  const type = document.getElementById("rType").value;

  document.getElementById("rLink").classList.add("hidden");
  document.getElementById("rImage").classList.add("hidden");
  document.getElementById("rContact").classList.add("hidden");

  if (type === "digital") {
    document.getElementById("rLink").classList.remove("hidden");
  }

  if (type === "physical") {
    document.getElementById("rImage").classList.remove("hidden");
    document.getElementById("rContact").classList.remove("hidden");
  }
}

async function addResource() {
  const title = document.getElementById("rTitle").value;
  const description = document.getElementById("rDesc").value;
  const type = document.getElementById("rType").value;
  const link = document.getElementById("rLink").value;
  const image_url = document.getElementById("rImage").value;
  const contact_details = document.getElementById("rContact").value;

  if (!title || !type) return alert("Title and type required");

  await fetch(`${API_URL}/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      type,
      link,
      image_url,
      contact_details,
      user_id: userId
    })
  });

  clearResourceForm();
  loadResources();
}

function clearResourceForm() {
  document.getElementById("rTitle").value = "";
  document.getElementById("rDesc").value = "";
  document.getElementById("rType").value = "";
  document.getElementById("rLink").value = "";
  document.getElementById("rImage").value = "";
  document.getElementById("rContact").value = "";
  toggleFields();
}

async function loadResources() {
  const res = await fetch(`${API_URL}/resources`);
  allResources = await res.json();
  renderResources();
}

function renderResources() {
  const list = document.getElementById("resourceList");
  list.innerHTML = "";

  const filtered =
    currentFilter === ""
      ? allResources
      : allResources.filter(r => r.type === currentFilter);

  filtered.forEach(r => {

    const showDelete =
      r.created_by == userId || userRole === "admin";

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
          ? `<small>Contact: ${r.contact_details}</small><br/>`
          : ""
      }

      <small>Shared by: ${r.email}</small><br/>

      ${showDelete ? `<button data-delete="${r.id}">Delete</button>` : ""}
      <hr/>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => deleteResource(btn.dataset.delete);
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
// REQUEST SECTION (UNCHANGED LOGIC)
// =======================================================

async function addRequest() {
  const title = document.getElementById("reqTitle").value;
  const description = document.getElementById("reqDesc").value;
  const type = document.getElementById("reqType").value;
  const image_url = document.getElementById("reqImage").value;
  const requester_contact = document.getElementById("reqContact").value;

  if (!title || !description || !type)
    return alert("All fields required");

  await fetch(`${API_URL}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      type,
      image_url,
      requester_contact,
      user_id: userId
    })
  });

  clearRequestForm();
  loadRequests();
}

function clearRequestForm() {
  document.getElementById("reqTitle").value = "";
  document.getElementById("reqDesc").value = "";
  document.getElementById("reqType").value = "";
  document.getElementById("reqImage").value = "";
  document.getElementById("reqContact").value = "";
}

async function loadRequests() {
  const res = await fetch(`${API_URL}/requests`);
  const requests = await res.json();

  const list = document.getElementById("requestList");
  list.innerHTML = "";

  requests.forEach(req => {

    const showDelete =
      req.created_by == userId || userRole === "admin";

    let actionSection = "";

    if (req.status === "open" && req.created_by != userId) {
      actionSection = `<button data-offer="${req.id}">Offer Resource</button>`;
    }

    if (req.status === "fulfilled") {
      actionSection = `
        <p><strong>Provided by:</strong> ${req.provider_email}</p>

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
          req.type === "physical" && req.contact_details
            ? `<small>Provider Contact: ${req.contact_details}</small><br/>`
            : ""
        }

        ${
          req.created_by == userId
            ? `<button data-received="${req.id}">Mark as Received</button>`
            : ""
        }
      `;
    }

    if (req.status === "received") {
      actionSection = `<p><strong>Status:</strong> Completed ✅</p>`;
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

      <small>Requested by: ${req.requester_email}</small><br/>
      ${
        req.requester_contact
          ? `<small>Requester Contact: ${req.requester_contact}</small><br/>`
          : ""
      }
      <small>Status: ${req.status}</small><br/>

      ${actionSection}

      ${showDelete ? `<button data-delete-request="${req.id}">Delete</button>` : ""}
      <hr/>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll("[data-offer]").forEach(btn => {
    btn.onclick = () => offerResource(btn.dataset.offer);
  });

  document.querySelectorAll("[data-received]").forEach(btn => {
    btn.onclick = () => markReceived(btn.dataset.received);
  });

  document.querySelectorAll("[data-delete-request]").forEach(btn => {
    btn.onclick = () => deleteRequest(btn.dataset.deleteRequest);
  });
}

async function offerResource(requestId) {
  const fulfillment_link = prompt("Enter resource link (image for physical / link for digital):");
  const contact_details = prompt("Enter contact details (if physical):");

  await fetch(`${API_URL}/requests/${requestId}/offer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      fulfillment_link,
      contact_details
    })
  });

  loadRequests();
}

async function markReceived(requestId) {
  await fetch(`${API_URL}/requests/${requestId}/received`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  loadRequests();
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