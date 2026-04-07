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

// Cache cac phan tu giao dien cua form dang nhap.
let successMessageEl = document.getElementById("success");
let emailEl = document.getElementById("email");
let passwordEl = document.getElementById("password");

let emailErrorEl = document.getElementById("email-err");
let passwordErrorEl = document.getElementById("password-err");

// Xac dinh duong dan ve trang chinh sau khi login thanh cong.
function getHomePath() {
  return "../index.html";
}

// Lay user dang dang nhap; neu da co thi khong cho quay lai trang login.
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Hien loi cho tung truong input.
function showError(input, errorEl, message) {
  errorEl.innerText = message;
  errorEl.style.display = "block";
  input.classList.add("input-error");
}

// Xoa loi khi user nhap lai.
function clearError(input, errorEl) {
  errorEl.style.display = "none";
  input.classList.remove("input-error");
}

// Gan su kien de clear loi ngay khi user thao tac lai voi field.
function bindFieldClear(input, errorEl) {
  input.addEventListener("focus", function () {
    clearError(input, errorEl);
  });
  input.addEventListener("input", function () {
    clearError(input, errorEl);
  });
}

bindFieldClear(emailEl, emailErrorEl);
bindFieldClear(passwordEl, passwordErrorEl);

// Neu da login roi thi chuyen thang ve trang chu.
function redirectIfAuthenticated() {
  if (!getCurrentUser()) {
    return;
  }

  window.location.replace(getHomePath());
}

window.addEventListener("load", redirectIfAuthenticated);
window.addEventListener("pageshow", function () {
  redirectIfAuthenticated();
});

// Validate email / password va tao currentUser khi dang nhap thanh cong.
function handle(e) {
  e.preventDefault();

  let emailInput = emailEl.value.trim();
  let passwordInput = passwordEl.value.trim();

  let userByEmail = users.find(function (u) {
    return u.email === emailInput;
  });

  let isValid = true;

  // Reset loi cu truoc khi validate.
  clearError(emailEl,emailErrorEl);
  clearError(passwordEl, passwordErrorEl);

  // Kiem tra email co duoc nhap va co ton tai trong danh sach user khong.
  if (!emailInput) {
    showError(emailEl, emailErrorEl, "Please enter your email...");
    isValid = false;
  } else if (!userByEmail) {
    showError(emailEl, emailErrorEl, "Email does not exist");
    isValid = false;
  }

  // Kiem tra password rong hoac sai voi email da nhap.
  if (!passwordInput) {
    showError(passwordEl, passwordErrorEl, "Please enter your password...");
    isValid = false;
  } else if (userByEmail && userByEmail.password !== passwordInput) {
    showError(passwordEl, passwordErrorEl, "Password is incorrect");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  // Dang nhap thanh cong thi luu currentUser de cac trang khac su dung.
  localStorage.setItem("currentUser", JSON.stringify(userByEmail));

  successMessageEl.style.display = "block";

  setTimeout(function () {
    window.location.replace(getHomePath());
  }, 1000);
}

// khi quay lại bằng nút back
