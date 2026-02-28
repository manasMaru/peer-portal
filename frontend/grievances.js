// =====================
// CONFIG
// =====================
const API_URL = "http://localhost:3000";
const userId = localStorage.getItem("user_id");

// =====================
// AUTH CHECK
// =====================
if (!userId) {
  window.location.href = "login.html";
}

// =====================
// DOM READY
// =====================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", addGrievance);
  document.getElementById("backBtn").addEventListener("click", goBack);
  loadGrievances();
});

// =====================
// LOAD GRIEVANCES
// =====================
async function loadGrievances() {
  const res = await fetch(`${API_URL}/grievances`);
  const grievances = await res.json();

  const list = document.getElementById("grievanceList");
  list.innerHTML = "";

  grievances.forEach(g => {
    const div = document.createElement("div");

    // ✅ THIS IS THE IMPORTANT FIX
    div.className = "grievance" + (g.is_resolved ? " resolved" : "");

    div.innerHTML = `
      <strong>${g.title}</strong>
      <p>${g.description}</p>
      <small>Status: ${g.is_resolved ? "Resolved" : "Open"}</small><br/>

      <input type="text" id="reply-${g.id}" placeholder="Reply..." />
      <button onclick="addReply(${g.id})">Reply</button>
      ${
        !g.is_resolved
          ? `<button onclick="resolveGrievance(${g.id})">Mark Resolved</button>`
          : ""
      }

      <div id="replies-${g.id}"></div>
    `;

    list.appendChild(div);
    loadReplies(g.id);
  });
}

// =====================
// ADD GRIEVANCE
// =====================
async function addGrievance() {
  const title = document.getElementById("gTitle").value;
  const desc = document.getElementById("gDesc").value;

  if (!title || !desc) {
    alert("Fill all fields");
    return;
  }

  await fetch(`${API_URL}/grievances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description: desc, user_id: userId })
  });

  document.getElementById("gTitle").value = "";
  document.getElementById("gDesc").value = "";
  loadGrievances();
}

// =====================
// REPLIES
// =====================
async function addReply(id) {
  const input = document.getElementById(`reply-${id}`);
  if (!input.value) return;

  await fetch(`${API_URL}/grievances/${id}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message: input.value })
  });

  input.value = "";
  loadReplies(id);
}

async function loadReplies(id) {
  const res = await fetch(`${API_URL}/grievances/${id}/replies`);
  const replies = await res.json();

  const box = document.getElementById(`replies-${id}`);
  box.innerHTML = "";

  replies.forEach(r => {
    const p = document.createElement("p");
    p.className = "reply";
    p.innerText = `↳ ${r.email}: ${r.message}`;
    box.appendChild(p);
  });
}

// =====================
// RESOLVE
// =====================
async function resolveGrievance(id) {
  await fetch(`${API_URL}/grievances/${id}/resolve`, { method: "PUT" });
  loadGrievances();
}

// =====================
// BACK
// =====================
function goBack() {
  window.location.href = "dashboard.html";
}