import { API_URL } from "./config.js";

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

async function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const msg = document.getElementById("signupMsg");

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  msg.innerText = data.message;
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

if (data.user_id) {
  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("role", data.role);  
  window.location.href = "dashboard.html";
} else {
    msg.innerText = data.message;
  }
}

window.signup = signup;
window.login = login;