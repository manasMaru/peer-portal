const API_URL = "http://localhost:3000";

// =====================
// LOGIN / SIGNUP ELEMENTS (ONLY IF PRESENT)
// =====================
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");

if (loginTab && signupTab) {
  loginTab.onclick = () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginBox.classList.remove("hidden");
    signupBox.classList.add("hidden");
  };

  signupTab.onclick = () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupBox.classList.remove("hidden");
    loginBox.classList.add("hidden");
  };
}

// =====================
// SIGNUP
// =====================
async function signup() {
  const email = document.getElementById("signupEmail")?.value;
  const password = document.getElementById("signupPassword")?.value;
  const msg = document.getElementById("signupMsg");

  if (!email || !password) return;

  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (msg) msg.innerText = data.message;
}

// =====================
// LOGIN
// =====================
async function login() {
  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;
  const msg = document.getElementById("loginMsg");

  if (!email || !password) return;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.user_id) {
    localStorage.setItem("user_id", data.user_id);
    window.location.href = "dashboard.html";
  } else if (msg) {
    msg.innerText = data.message;
  }
}

// =====================
// DASHBOARD FUNCTIONS
// =====================
function goToGrievances() {
  window.location.href = "grievances.html";
}

function goToResources() {
  window.location.href = "resources.html";
}

function logout() {
  localStorage.removeItem("user_id");
  window.location.href = "login.html";
}