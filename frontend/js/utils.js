export function requireAuth() {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    window.location.href = "login.html";
  }
  return userId;
}

export function logout() {
  localStorage.removeItem("user_id");
  window.location.href = "login.html";
}