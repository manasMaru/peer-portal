import { API_URL } from "./config.js";
import { requireAuth } from "./utils.js";

const userId = requireAuth();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addResourceBtn")
    .addEventListener("click", addResource);

  document.getElementById("rType")
    .addEventListener("change", toggleFields);

  document.getElementById("backBtn")
    .addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadResources(btn.dataset.type);
    });
  });

  loadResources();
});

function toggleFields() {
  const type = document.getElementById("rType").value;

  document.getElementById("rLink")
    .classList.toggle("hidden", type !== "digital");

  document.getElementById("rImage")
    .classList.toggle("hidden", type !== "physical");

  document.getElementById("rContact")
    .classList.toggle("hidden", type !== "physical");
}

async function addResource() {
  const title = document.getElementById("rTitle").value;
  const description = document.getElementById("rDesc").value;
  const type = document.getElementById("rType").value;
  const link = document.getElementById("rLink").value;
  const image_url = document.getElementById("rImage").value;
  const contact_details = document.getElementById("rContact").value;

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

  loadResources();
}

async function loadResources(type = "") {
  let url = `${API_URL}/resources`;
  if (type) url += `?type=${type}`;

  const res = await fetch(url);
  const resources = await res.json();

  const list = document.getElementById("resourceList");
  list.innerHTML = "";

  resources.forEach(r => {
    list.innerHTML += `
      <div class="resource">
        <strong>${r.title}</strong>
        <p>${r.description || ""}</p>
        ${
          r.type === "digital"
            ? `<a href="${r.link}" target="_blank">Open Resource</a>`
            : `<img src="${r.image_url}" width="120" />
               <br/><small>Contact: ${r.contact_details}</small>`
        }
        <br/><small>Shared by: ${r.email}</small>
      </div>
    `;
  });
}