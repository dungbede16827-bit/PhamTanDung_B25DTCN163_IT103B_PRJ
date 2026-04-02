let users = JSON.parse(localStorage.getItem("user")) || [];

let successMessageEl = document.getElementById("success");
let emailEl = document.getElementById("email");
let passwordEl = document.getElementById("password");

let emailErrorEl = document.getElementById("email-err");
let passwordErrorEl = document.getElementById("password-err");

function showError(input, errorEl, message) {
  errorEl.innerText = message;
  errorEl.style.display = "block";
  input.classList.add("input-error");
}

function clearError(input, errorEl) {
  errorEl.style.display = "none";
  input.classList.remove("input-error");
}

function bindFieldClear(input, errorEl) {
  input.addEventListener("focus", () => clearError(input, errorEl));
  input.addEventListener("input", () => clearError(input, errorEl));
}

bindFieldClear(emailEl, emailErrorEl);
bindFieldClear(passwordEl, passwordErrorEl);

function handle(e) {
  e.preventDefault();

  let emailInput = emailEl.value.trim();
  let passwordInput = passwordEl.value.trim();

  let userByEmail = users.find((u) => u.email === emailInput);

  let isValid = true;

  // RESET
  clearError(emailEl, emailErrorEl);
  clearError(passwordEl, passwordErrorEl);

  // EMAIL
  if (!emailInput) {
    showError(emailEl, emailErrorEl, "Please enter your email...");
    isValid = false;
  } 
  else if (!userByEmail) {
    showError(emailEl, emailErrorEl, "Email does not exist");
    isValid = false;
  }

  // PASSWORD
  if (!passwordInput) {
    showError(passwordEl, passwordErrorEl, "Please enter your password...");
    isValid = false;
  } 
  else if (userByEmail && userByEmail.password !== passwordInput) {
    showError(passwordEl, passwordErrorEl, "Password is incorrect");
    isValid = false;
  }

  if (!isValid) return;

  // LOGIN SUCCESS
  localStorage.setItem("currentUser", JSON.stringify(userByEmail));

  successMessageEl.style.display = "block";

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1000);
}
