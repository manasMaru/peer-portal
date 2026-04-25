import { API_URL } from "./config.js";

// =============================
// TAB SWITCHING
// =============================
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


// =============================
// SIGNUP
// =============================
async function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const msg = document.getElementById("signupMsg");

  if (!email || !password) {
    msg.innerText = "Please fill all fields";
    return;
  }

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  msg.innerText = data.message;
}


// =============================
// LOGIN (FIXED EMAIL STORAGE)
// =============================
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");

  if (!email || !password) {
    msg.innerText = "Please fill all fields";
    return;
  }

  const res = await fetch(`${API_URL}/auth/login`, {//sends login data to backend
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })//converts javaScript object to JSON
  });

  const data = await res.json();//convert backend response to Js object
  //On the backend, res.json() sends a JS object as JSON; on the frontend, res.json() parses JSON into a JS object
  
  
  if (data.user_id) {
    // Store everything needed for dashboard to local storage
    //this is our session management
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", email);

    window.location.href = "dashboard.html";//redirect to dashboard after login
  } else {
    msg.innerText = data.message;//if login fails , show backend error message
  }
}


// Make functions globally available
window.signup = signup;
window.login = login;