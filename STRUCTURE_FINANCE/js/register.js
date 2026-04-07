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

// Cache cac phan tu giao dien cua form dang ky.
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const confirmPasswordEl = document.getElementById('confirmPassword');

const emailErr = document.getElementById("emailError");
const passwordErr = document.getElementById('passwordError');
const confirmPasswordErr = document.getElementById('confirmPasswordError');
const successEl = document.getElementById('success');
const registerForm = document.getElementById('registerForm');
// Regex kiem tra email co dung dinh dang co ban hay khong.
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

// Khi user nhap lai thi an loi cua truong do.
function bindFieldClear(input, errorEl) {
  input.addEventListener("focus", () => clearError(input, errorEl));
  input.addEventListener("input", () => clearError(input, errorEl));
}

bindFieldClear(emailEl, emailErr);
bindFieldClear(passwordEl, passwordErr);
bindFieldClear(confirmPasswordEl, confirmPasswordErr);

// Xu ly toan bo luong dang ky.
function handleSubmit(e) {
  e.preventDefault();

  const emailValue = emailEl.value.trim();
  const passwordValue = passwordEl.value.trim();
  const confirmPasswordValue = confirmPasswordEl.value.trim();

  let isValid = true;

  // Reset loi cu truoc moi lan validate.
  clearError(emailEl, emailErr);
  clearError(passwordEl, passwordErr);
  clearError(confirmPasswordEl, confirmPasswordErr);

  // Kiem tra email rong hoac sai dinh dang.
  if (!emailValue || !emailRegex.test(emailValue)) {
    showError(emailEl, emailErr, "Please enter your email ...");
    isValid = false;
  }

  // Khong cho tao 2 tai khoan cung 1 email.
  const isExist = users.some((user) => user.email === emailValue);
  if (isExist) {
    showError(emailEl, emailErr, "Email đã tồn tại");
    isValid = false;
  }

  // Mat khau bat buoc va toi thieu 6 ky tu.
  if (!passwordValue) {
    showError(passwordEl, passwordErr, "Password is required");
    isValid = false;
  } else if (passwordValue.length < 6) {
    showError(passwordEl, passwordErr, "At least 6 characters");
    isValid = false;
  }

  // Confirm password phai trung voi password da nhap.
  if (!confirmPasswordValue || passwordValue !== confirmPasswordValue) {
    showError(confirmPasswordEl, confirmPasswordErr, "Password not match");
    isValid = false;
  }

  if (!isValid) return;

  // Luu tai khoan moi vao localStorage.
  const newUser = {
    email: emailValue,
    password: passwordValue
  };

  users.push(newUser);
  localStorage.setItem("user", JSON.stringify(users));

  if (successEl) {
    successEl.style.display = "block";
  }

  // Xoa du lieu form sau khi dang ky thanh cong.
  document.getElementById("registerForm").reset();

  // Tre 1 giay de user kip thay thong bao thanh cong roi moi chuyen trang.
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

