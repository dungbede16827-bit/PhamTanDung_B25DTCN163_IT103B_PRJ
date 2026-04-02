let users = JSON.parse(localStorage.getItem("user")) || [];
let optionHeaderEl = document.getElementById("optionHeader");
let confirmBtn = document.getElementById("confirm-btn");
let cancelBtn = document.getElementById("cancel-btn");
let logoutOverlay = document.getElementById("logout-overlay");


function handleOption() {
  if (optionHeaderEl.value === "logout") {
    logoutOverlay.style.display = "flex";
  }
}

cancelBtn.addEventListener("click", function () {
  logoutOverlay.style.display = "none";
  optionHeaderEl.value = ""; // reset lại select
});

// Nhấn "Có" → logout
confirmBtn.addEventListener("click", function () {
  localStorage.removeItem("user");

  // chuyển về login (kiểm tra xem hiện tại đang ở đâu)
  const currentPath = window.location.pathname;
  const loginPath = currentPath.includes('/pages/') ? './login.html' : './pages/login.html';
  window.location.replace(loginPath);
});

function checkAuth() {
  if (!users || users.length === 0) {
    const currentPath = window.location.pathname;
    const loginPath = currentPath.includes('/pages/') ? './login.html' : './pages/login.html';
    window.location.replace(loginPath);
  }
}
window.addEventListener("load", checkAuth);
window.addEventListener("pageshow", checkAuth);