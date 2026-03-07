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

    const isOwner = g.created_by == userId;
    const isAdmin = userRole === "admin";

    const showDelete = isOwner || isAdmin;
    const showResolve = (isOwner || isAdmin) && !g.is_resolved;

    div.innerHTML = `
      <strong>${g.title}</strong>
      <p>${g.description}</p>

      <span class="status-badge ${g.is_resolved ? "status-resolved" : "status-open"}">
        ${g.is_resolved ? "Resolved" : "Open"}
      </span>

      <div class="action-row">
        <input type="text" id="reply-${g.id}" placeholder="Write a reply..." />
        <button class="small-btn reply-btn" data-reply="${g.id}">Reply</button>

        ${
          showResolve
            ? `<button class="small-btn resolve-btn" data-resolve="${g.id}">Resolve</button>`
            : ""
        }

        ${
          showDelete
            ? `<button class="small-btn delete-btn" data-delete="${g.id}">Delete</button>`
            : ""
        }
      </div>

      <div id="replies-${g.id}" class="reply-container"></div>
    `;

    list.appendChild(div);
    loadReplies(g.id);
  });

  // Attach events
  document.querySelectorAll("[data-reply]").forEach(btn => {
    btn.onclick = () => addReply(btn.dataset.reply);
  });

  document.querySelectorAll("[data-resolve]").forEach(btn => {
    btn.onclick = () => resolveGrievance(btn.dataset.resolve);
  });

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => deleteGrievance(btn.dataset.delete);
  });
}


// ==============================
// ADD GRIEVANCE
// ==============================
async function addGrievance() {
  const title = document.getElementById("gTitle").value.trim();
  const desc = document.getElementById("gDesc").value.trim();

  if (!title || !desc) {
    alert("Please fill all fields");
    return;
  }

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
  const message = input.value.trim();

  if (!message) return;

  await fetch(`${API_URL}/replies/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      message
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
    box.innerHTML += `
      <div class="reply">
        <strong>${r.email}</strong><br/>
        ${r.message}
      </div>
    `;
  });
}


// ==============================
// RESOLVE
// ==============================
async function resolveGrievance(id) {
  await fetch(`${API_URL}/grievances/${id}/resolve`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId
    })
  });

  loadGrievances();
}


// ==============================
// DELETE
// ==============================
async function deleteGrievance(id) {
  if (!confirm("Are you sure you want to delete this grievance?")) return;

  await fetch(`${API_URL}/grievances/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId
    })
  });

  loadGrievances();
}