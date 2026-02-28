const userId = localStorage.getItem("user_id");

if (!userId) {
  window.location.href = "login.html";
}

// =====================
// TOGGLE INPUTS
// =====================
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

// =====================
// ADD RESOURCE
// =====================
async function addResource() {
  const title = document.getElementById("rTitle").value;
  const description = document.getElementById("rDesc").value;
  const type = document.getElementById("rType").value;
  const link = document.getElementById("rLink").value;
  const image_url = document.getElementById("rImage").value;
  const contact_details = document.getElementById("rContact").value;

  if (!title || !type) {
    alert("Title and type required");
    return;
  }

  if (type === "digital" && !link) {
    alert("Link required for digital resource");
    return;
  }

  if (type === "physical" && (!image_url || !contact_details)) {
    alert("Image and contact required for physical resource");
    return;
  }

  await fetch("http://localhost:3000/resources", {
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

  document.getElementById("rTitle").value = "";
  document.getElementById("rDesc").value = "";
  document.getElementById("rType").value = "";
  document.getElementById("rLink").value = "";
  document.getElementById("rImage").value = "";
  document.getElementById("rContact").value = "";

  toggleFields();
  setActiveFilter(document.querySelector(".filter-btn.active"), "");
}

// =====================
// LOAD RESOURCES
// =====================
async function loadResources(type = "") {
  let url = "http://localhost:3000/resources";
  if (type) url += `?type=${type}`;

  const res = await fetch(url);
  const resources = await res.json();

  const list = document.getElementById("resourceList");
  list.innerHTML = "";

  resources.forEach(r => {
    const div = document.createElement("div");
    div.className = "resource";

    if (r.type === "digital") {
      div.innerHTML = `
        <strong>${r.title}</strong>
        <p>${r.description || ""}</p>
        <a href="${r.link}" target="_blank">Open Resource</a><br/>
        <small>Shared by: ${r.email}</small>
      `;
    } else {
      div.innerHTML = `
        <strong>${r.title}</strong>
        <p>${r.description || ""}</p>
        <img src="${r.image_url}" width="120" /><br/>
        <small>Contact owner: ${r.contact_details}</small><br/>
        <small>Shared by: ${r.email}</small>
      `;
    }

    list.appendChild(div);
  });
}

// =====================
// FILTER + ACTIVE BUTTON LOGIC
// =====================
function setActiveFilter(btn, type) {
  document.querySelectorAll(".filter-btn").forEach(b => {
    b.classList.remove("active");
  });

  btn.classList.add("active");
  loadResources(type);
}

// =====================
// BACK
// =====================
function goBack() {
  window.location.href = "dashboard.html";
}

// =====================
// INIT (default = All)
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const defaultBtn = document.querySelector(".filter-btn.active");
  if (defaultBtn) {
    loadResources();
  }
});