import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();
const userRole = localStorage.getItem("role");

document.addEventListener("DOMContentLoaded", () => {
  loadResources();

  // Toggle type fields
  document
    .getElementById("rType")
    .addEventListener("change", toggleFields);

  // Add resource button
  document
    .getElementById("addResourceBtn")
    .addEventListener("click", addResource);

  // Back button
  document
    .getElementById("backBtn")
    .addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setActiveFilter(btn, btn.dataset.type);
    });
  });
});

// ==============================
// TOGGLE INPUT FIELDS
// ==============================
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

// ==============================
// ADD RESOURCE
// ==============================
async function addResource() {
  const title = document.getElementById("rTitle").value;
  const description = document.getElementById("rDesc").value;
  const type = document.getElementById("rType").value;
  const link = document.getElementById("rLink").value;
  const image_url = document.getElementById("rImage").value;
  const contact_details = document.getElementById("rContact").value;

  if (!title || !type) {
    return alert("Title and type required");
  }

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

  // Clear fields
  document.getElementById("rTitle").value = "";
  document.getElementById("rDesc").value = "";
  document.getElementById("rType").value = "";
  document.getElementById("rLink").value = "";
  document.getElementById("rImage").value = "";
  document.getElementById("rContact").value = "";
  toggleFields();

  loadResources();
}

// ==============================
// LOAD RESOURCES
// ==============================
async function loadResources(type = "") {
  let url = `${API_URL}/resources`;
  if (type) url += `?type=${type}`;

  const res = await fetch(url);
  const resources = await res.json();

  const list = document.getElementById("resourceList");
  list.innerHTML = "";

  resources.forEach(r => {
    const div = document.createElement("div");
    div.className = "resource";

    const showDelete =
      r.created_by == userId || userRole === "admin";

    div.innerHTML = `
      <strong>${r.title}</strong>
      <p>${r.description || ""}</p>
      ${
        r.type === "digital"
          ? `<a href="${r.link}" target="_blank">Open Resource</a><br/>`
          : `<img src="${r.image_url}" width="120"/><br/>
             <small>Contact: ${r.contact_details}</small><br/>`
      }
      <small>Shared by: ${r.email}</small><br/>
      ${
        showDelete
          ? `<button data-delete="${r.id}">Delete</button>`
          : ""
      }
    `;

    list.appendChild(div);
  });

  // Attach delete listeners
  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => deleteResource(btn.dataset.delete);
  });
}

// ==============================
// DELETE RESOURCE
// ==============================
async function deleteResource(id) {
  if (!confirm("Are you sure you want to delete this resource?")) return;

  await fetch(`${API_URL}/resources/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId
    })
  });

  loadResources();
}

// ==============================
// FILTER ACTIVE STATE
// ==============================
function setActiveFilter(btn, type) {
  document.querySelectorAll(".filter-btn").forEach(b =>
    b.classList.remove("active")
  );
  btn.classList.add("active");
  loadResources(type);
}