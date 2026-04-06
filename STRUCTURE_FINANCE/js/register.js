// let users =  [
// {

// "id": 1,
// "fullName": "Nguyễn Văn A",
// "email": "nguyenvana@gmail.com",
// "password": "123456",
// "phone": "0987654321",
// "gender": true,
// "status": true

// },
// {

// "id": 2,
// "fullName": "Phạm Thị B",
// "email": "phamthibagmail.com",
// "password": "123456",
// "phone": "0987654321",
// "gender": false,
// "status": true

// }
// ];
// localStorage.setItem("user", JSON.stringify(users));


let users = JSON.parse(localStorage.getItem("user")) || [];

// DOM
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const confirmPasswordEl = document.getElementById('confirmPassword');

const emailErr = document.getElementById("emailError");
const passwordErr = document.getElementById('passwordError');
const confirmPasswordErr = document.getElementById('confirmPasswordError');
const successEl = document.getElementById('success');
const registerForm = document.getElementById('registerForm');
// Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hàm hiển thị lỗi
function showError(input, errorEl, message) {
  errorEl.innerText = message;
  errorEl.style.display = "block";
  input.classList.add("input-error");
}

// Hàm xoá lỗi
function clearError(input, errorEl) {
  errorEl.style.display = "none";
  input.classList.remove("input-error");
}

function bindFieldClear(input, errorEl) {
  input.addEventListener("focus", () => clearError(input, errorEl));
  input.addEventListener("input", () => clearError(input, errorEl));
}

bindFieldClear(emailEl, emailErr);
bindFieldClear(passwordEl, passwordErr);
bindFieldClear(confirmPasswordEl, confirmPasswordErr);

function handleSubmit(e) {
  e.preventDefault();

  const emailValue = emailEl.value.trim();
  const passwordValue = passwordEl.value.trim();
  const confirmPasswordValue = confirmPasswordEl.value.trim();

  let isValid = true;

  // RESET ERROR
  clearError(emailEl, emailErr);
  clearError(passwordEl, passwordErr);
  clearError(confirmPasswordEl, confirmPasswordErr);

  // EMAIL
  if (!emailValue || !emailRegex.test(emailValue)) {
    showError(emailEl, emailErr, "Please enter your email ...");
    isValid = false;
  }

  // CHECK EMAIL EXIST
  const isExist = users.some((user) => user.email === emailValue);
  if (isExist) {
    showError(emailEl, emailErr, "Email đã tồn tại");
    isValid = false;
  }

  // PASSWORD
  if (!passwordValue) {
    showError(passwordEl, passwordErr, "Password is required");
    isValid = false;
  } else if (passwordValue.length < 6) {
    showError(passwordEl, passwordErr, "At least 6 characters");
    isValid = false;
  }

  // CONFIRM PASSWORD
  if (!confirmPasswordValue || passwordValue !== confirmPasswordValue) {
    showError(confirmPasswordEl, confirmPasswordErr, "Password not match");
    isValid = false;
  }

  if (!isValid) return;

  // SAVE USER
  const newUser = {
    email: emailValue,
    password: passwordValue
  };

  users.push(newUser);
  localStorage.setItem("user", JSON.stringify(users));

  if (successEl) {
    successEl.style.display = "block";
  }

  // RESET FORM
  document.getElementById("registerForm").reset();

  // Redirect after 1s so user can see success message
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

