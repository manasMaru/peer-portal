import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn")
    .addEventListener("click", addGrievance);

  document.getElementById("backBtn")
    .addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

  loadGrievances();
});

async function loadGrievances() {
  const res = await fetch(`${API_URL}/grievances`);
  const grievances = await res.json();

  const list = document.getElementById("grievanceList");
  list.innerHTML = "";

  grievances.forEach(g => {
    const div = document.createElement("div");
    div.className = "grievance" + (g.is_resolved ? " resolved" : "");

    div.innerHTML = `
      <strong>${g.title}</strong>
      <p>${g.description}</p>
      <small>Status: ${g.is_resolved ? "Resolved" : "Open"}</small><br/>
      <input type="text" id="reply-${g.id}" placeholder="Reply..." />
      <button data-reply="${g.id}">Reply</button>
      ${!g.is_resolved ? `<button data-resolve="${g.id}">Mark Resolved</button>` : ""}
      <div id="replies-${g.id}"></div>
    `;

    list.appendChild(div);
    loadReplies(g.id);
  });

  document.querySelectorAll("[data-reply]").forEach(btn => {
    btn.onclick = () => addReply(btn.dataset.reply);
  });

  document.querySelectorAll("[data-resolve]").forEach(btn => {
    btn.onclick = () => resolveGrievance(btn.dataset.resolve);
  });
}

async function addGrievance() {
  const title = document.getElementById("gTitle").value;
  const desc = document.getElementById("gDesc").value;

  await fetch(`${API_URL}/grievances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description: desc, user_id: userId })
  });

  loadGrievances();
}

async function addReply(id) {
  const input = document.getElementById(`reply-${id}`);

  await fetch(`${API_URL}/replies/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message: input.value })
  });

  loadReplies(id);
}

async function loadReplies(id) {
  const res = await fetch(`${API_URL}/replies/${id}`);
  const replies = await res.json();

  const box = document.getElementById(`replies-${id}`);
  box.innerHTML = "";

  replies.forEach(r => {
    box.innerHTML += `<p>↳ ${r.email}: ${r.message}</p>`;
  });
}

function resolveGrievance(id) {
  fetch(`${API_URL}/grievances/${id}/resolve`, { method: "PUT" })
    .then(loadGrievances);
}