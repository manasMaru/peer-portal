import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();
const userRole = localStorage.getItem("role");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn")
    .addEventListener("click", addGrievance);

  document.getElementById("backBtn")
    .addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

  loadGrievances();
});

// ==============================
// LOAD GRIEVANCES
// ==============================
async function loadGrievances() {
  const res = await fetch(`${API_URL}/grievances`);
  const grievances = await res.json();

  const list = document.getElementById("grievanceList");
  list.innerHTML = "";

  grievances.forEach(g => {
    const div = document.createElement("div");
    div.className = "grievance" + (g.is_resolved ? " resolved" : "");

    // show delete only if owner OR admin
    const showDelete =
      g.created_by == userId || userRole === "admin";

    div.innerHTML = `
      <strong>${g.title}</strong>
      <p>${g.description}</p>
      <small>Status: ${g.is_resolved ? "Resolved" : "Open"}</small><br/>

      <input type="text" id="reply-${g.id}" placeholder="Reply..." />
      <button data-reply="${g.id}">Reply</button>

      ${
        !g.is_resolved
          ? `<button data-resolve="${g.id}">Mark Resolved</button>`
          : ""
      }

      ${
        showDelete
          ? `<button data-delete="${g.id}">Delete</button>`
          : ""
      }

      <div id="replies-${g.id}"></div>
    `;

    list.appendChild(div);
    loadReplies(g.id);
  });

  // Reply
  document.querySelectorAll("[data-reply]").forEach(btn => {
    btn.onclick = () => addReply(btn.dataset.reply);
  });

  // Resolve
  document.querySelectorAll("[data-resolve]").forEach(btn => {
    btn.onclick = () => resolveGrievance(btn.dataset.resolve);
  });

  // Delete
  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => deleteGrievance(btn.dataset.delete);
  });
}

// ==============================
// ADD GRIEVANCE
// ==============================
async function addGrievance() {
  const title = document.getElementById("gTitle").value;
  const desc = document.getElementById("gDesc").value;

  if (!title || !desc) return alert("Fill all fields");

  await fetch(`${API_URL}/grievances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description: desc,
      user_id: userId
    })
  });

  document.getElementById("gTitle").value = "";
  document.getElementById("gDesc").value = "";

  loadGrievances();
}

// ==============================
// ADD REPLY
// ==============================
async function addReply(id) {
  const input = document.getElementById(`reply-${id}`);
  if (!input.value) return;

  await fetch(`${API_URL}/replies/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      message: input.value
    })
  });

  input.value = "";
  loadReplies(id);
}

// ==============================
// LOAD REPLIES
// ==============================
async function loadReplies(id) {
  const res = await fetch(`${API_URL}/replies/${id}`);
  const replies = await res.json();

  const box = document.getElementById(`replies-${id}`);
  box.innerHTML = "";

  replies.forEach(r => {
    box.innerHTML += `<p>↳ ${r.email}: ${r.message}</p>`;
  });
}

// ==============================
// RESOLVE
// ==============================
function resolveGrievance(id) {
  fetch(`${API_URL}/grievances/${id}/resolve`, {
    method: "PUT"
  }).then(loadGrievances);
}

// ==============================
// DELETE (OWNER OR ADMIN)
// ==============================
async function deleteGrievance(id) {
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
}