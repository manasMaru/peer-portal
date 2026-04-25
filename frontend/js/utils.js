export function requireAuth() {//if user_id exists in localstorage return it else redirect to login.html
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    window.location.href = "/"; // redirect to index.html
  }
  return userId;
}

export function logout() {//remove user_id from localstorage and redirect to login.html
  localStorage.removeItem("user_id");
  window.location.href = "/"; // redirect to index.html
}