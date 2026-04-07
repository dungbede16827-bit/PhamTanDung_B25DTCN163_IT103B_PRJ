let optionHeaderEl = document.getElementById("optionHeader");
let confirmBtn = document.getElementById("confirm-btn");
let cancelBtn = document.getElementById("cancel-btn");
let logoutOverlay = document.getElementById("logout-overlay");
let changeInfoBtn = document.getElementById("change-info-btn");
let changePasswordBtn = document.getElementById("change-password-btn");
let changeInfoModalEl = document.getElementById("change-info-modal");
let changeInfoFormEl = document.getElementById("change-info-form");
let closeInfoModalBtn = document.getElementById("close-info-modal");
let cancelInfoBtn = document.getElementById("cancel-info-btn");
let changePasswordModalEl = document.getElementById("change-password-modal");
let changePasswordFormEl = document.getElementById("change-password-form");
let closePasswordModalBtn = document.getElementById("close-password-modal");
let cancelPasswordBtn = document.getElementById("cancel-password-btn");
let nameInputEl = document.getElementById("profile-name");
let emailInputEl = document.getElementById("profile-email");
let phoneInputEl = document.getElementById("profile-phone");
let genderSelectEl = document.getElementById("profile-gender");
let modalNameInputEl = document.getElementById("modal-name");
let modalEmailInputEl = document.getElementById("modal-email");
let modalPhoneInputEl = document.getElementById("modal-phone");
let modalGenderSelectEl = document.getElementById("modal-gender");
let modalNameErrorEl = document.getElementById("modal-name-error");
let modalEmailErrorEl = document.getElementById("modal-email-error");
let modalPhoneErrorEl = document.getElementById("modal-phone-error");
let modalGenderErrorEl = document.getElementById("modal-gender-error");
let oldPasswordInputEl = document.getElementById("old-password");
let newPasswordInputEl = document.getElementById("new-password");
let confirmNewPasswordInputEl = document.getElementById("confirm-new-password");
let oldPasswordErrorEl = document.getElementById("old-password-error");
let newPasswordErrorEl = document.getElementById("new-password-error");
let confirmNewPasswordErrorEl = document.getElementById("confirm-new-password-error");
let data = null;

function getLoginPath() {
  const currentPath = window.location.pathname;
  return currentPath.includes("/pages/") ? "./login.html" : "./pages/login.html";
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("user")) || [];
}

function showError(input, errorEl, message) {
  if (!input || !errorEl) {
    return;
  }

  errorEl.innerText = message;
  errorEl.style.display = "block";
  input.classList.add("input-error");
}

function clearError(input, errorEl) {
  if (!input || !errorEl) {
    return;
  }

  errorEl.style.display = "none";
  input.classList.remove("input-error");
}

function bindFieldClear(input, errorEl) {
  if (!input || !errorEl) {
    return;
  }

  input.addEventListener("focus", function () {
    clearError(input, errorEl);
  });

  input.addEventListener("input", function () {
    clearError(input, errorEl);
  });

  input.addEventListener("change", function () {
    clearError(input, errorEl);
  });
}

function normalizeGender(gender) {
  if (gender === true || gender === "true") {
    return "Male";
  }

  if (gender === false || gender === "false") {
    return "Female";
  }

  if (typeof gender === "string" && gender.trim()) {
    const normalizedGender = gender.trim().toLowerCase();

    if (normalizedGender === "male" || normalizedGender === "nam") {
      return "Male";
    }

    if (normalizedGender === "female" || normalizedGender === "nu") {
      return "Female";
    }

    return "Other";
  }

  return "Male";
}

function fillProfileForm() {
  const currentUser = getCurrentUser();

  if (!currentUser || !nameInputEl || !emailInputEl || !phoneInputEl || !genderSelectEl) {
    return;
  }

  nameInputEl.value = currentUser.fullName || currentUser.name || "";
  emailInputEl.value = currentUser.email || "";
  phoneInputEl.value = currentUser.phone || "";
  genderSelectEl.value = normalizeGender(currentUser.gender);
}

function fillChangeInfoModal() {
  const currentUser = getCurrentUser();

  if (!modalNameInputEl || !modalEmailInputEl || !modalPhoneInputEl || !modalGenderSelectEl) {
    return;
  }

  const currentName =
    currentUser?.fullName ||
    currentUser?.name ||
    nameInputEl?.value ||
    "";
  const currentEmail =
    currentUser?.email ||
    emailInputEl?.value ||
    "";
  const currentPhone =
    currentUser?.phone ||
    phoneInputEl?.value ||
    "";
  const currentGender =
    currentUser?.gender != null
      ? normalizeGender(currentUser.gender)
      : (genderSelectEl?.value || "");

  modalNameInputEl.value = currentName;
  modalEmailInputEl.value = currentEmail;
  modalPhoneInputEl.value = currentPhone;
  modalGenderSelectEl.value = currentGender;
}

function validateChangeInfoForm() {
  let isValid = true;

  clearError(modalNameInputEl, modalNameErrorEl);
  clearError(modalEmailInputEl, modalEmailErrorEl);
  clearError(modalPhoneInputEl, modalPhoneErrorEl);
  clearError(modalGenderSelectEl, modalGenderErrorEl);

  if (!modalNameInputEl.value.trim()) {
    showError(modalNameInputEl, modalNameErrorEl, "Please enter your name...");
    isValid = false;
  }

  if (!modalEmailInputEl.value.trim()) {
    showError(modalEmailInputEl, modalEmailErrorEl, "Please enter your email...");
    isValid = false;
  }

  if (!modalPhoneInputEl.value.trim()) {
    showError(modalPhoneInputEl, modalPhoneErrorEl, "Please enter your phone...");
    isValid = false;
  }

  if (!modalGenderSelectEl.value.trim()) {
    showError(modalGenderSelectEl, modalGenderErrorEl, "Please select your gender...");
    isValid = false;
  }

  return isValid;
}

function resetChangePasswordForm() {
  if (!changePasswordFormEl) {
    return;
  }

  changePasswordFormEl.reset();
  clearError(oldPasswordInputEl, oldPasswordErrorEl);
  clearError(newPasswordInputEl, newPasswordErrorEl);
  clearError(confirmNewPasswordInputEl, confirmNewPasswordErrorEl);
}

function validateChangePasswordForm() {
  const currentUser = getCurrentUser();
  let isValid = true;

  clearError(oldPasswordInputEl, oldPasswordErrorEl);
  clearError(newPasswordInputEl, newPasswordErrorEl);
  clearError(confirmNewPasswordInputEl, confirmNewPasswordErrorEl);

  if (!oldPasswordInputEl.value.trim()) {
    showError(oldPasswordInputEl, oldPasswordErrorEl, "Please enter your old password...");
    isValid = false;
  } else if ((currentUser?.password || "") !== oldPasswordInputEl.value.trim()) {
    showError(oldPasswordInputEl, oldPasswordErrorEl, "Old password is incorrect");
    isValid = false;
  }

  if (!newPasswordInputEl.value.trim()) {
    showError(newPasswordInputEl, newPasswordErrorEl, "Please enter your new password...");
    isValid = false;
  }

  if (!confirmNewPasswordInputEl.value.trim()) {
    showError(
      confirmNewPasswordInputEl,
      confirmNewPasswordErrorEl,
      "Please confirm your new password..."
    );
    isValid = false;
  } else if (newPasswordInputEl.value.trim() !== confirmNewPasswordInputEl.value.trim()) {
    showError(
      confirmNewPasswordInputEl,
      confirmNewPasswordErrorEl,
      "Confirm password does not match"
    );
    isValid = false;
  }

  return isValid;
}

function getProfileFormData() {
  return {
    ...getCurrentUser(),
    name: modalNameInputEl.value.trim(),
    fullName: modalNameInputEl.value.trim(),
    email: modalEmailInputEl.value.trim(),
    phone: modalPhoneInputEl.value.trim(),
    gender: modalGenderSelectEl.value
  };
}

function saveProfileData() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.replace(getLoginPath());
    return;
  }

  data = getProfileFormData();
  window.data = data;

  const users = getUsers();
  const userIndex = users.findIndex(function (user) {
    if (currentUser.id != null && user.id != null) {
      return user.id === currentUser.id;
    }

    return user.email === currentUser.email;
  });

  if (userIndex >= 0) {
    users[userIndex] = {
      ...users[userIndex],
      ...data
    };
  } else {
    users.push(data);
  }

  localStorage.setItem("user", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(data));

  fillProfileForm();
  closeChangeInfoModal();
}

function savePasswordData() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.replace(getLoginPath());
    return;
  }

  const updatedUser = {
    ...currentUser,
    password: newPasswordInputEl.value.trim()
  };

  const users = getUsers();
  const userIndex = users.findIndex(function (user) {
    if (currentUser.id != null && user.id != null) {
      return user.id === currentUser.id;
    }

    return user.email === currentUser.email;
  });

  if (userIndex >= 0) {
    users[userIndex] = {
      ...users[userIndex],
      password: updatedUser.password
    };
  } else {
    users.push(updatedUser);
  }

  localStorage.setItem("user", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  closeChangePasswordModal();
}

function openChangeInfoModal() {
  if (!changeInfoModalEl) {
    return;
  }

  fillChangeInfoModal();
  changeInfoModalEl.style.display = "flex";
}

function closeChangeInfoModal() {
  if (!changeInfoModalEl) {
    return;
  }

  changeInfoModalEl.style.display = "none";
}

function openChangePasswordModal() {
  if (!changePasswordModalEl) {
    return;
  }

  resetChangePasswordForm();
  changePasswordModalEl.style.display = "flex";
}

function closeChangePasswordModal() {
  if (!changePasswordModalEl) {
    return;
  }

  changePasswordModalEl.style.display = "none";
}

function handleChangeInformation() {
  openChangeInfoModal();
}

function handleChangePassword() {
  openChangePasswordModal();
}

function handleChangeInfoSubmit(event) {
  event.preventDefault();

  if (!validateChangeInfoForm()) {
    return;
  }

  saveProfileData();
}

function handleChangePasswordSubmit(event) {
  event.preventDefault();

  if (!validateChangePasswordForm()) {
    return;
  }

  savePasswordData();
}

function setActiveTaskbarItem() {
  const taskbarItems = document.querySelectorAll(".taskbar-items");
  if (!taskbarItems.length) {
    return;
  }

  const currentPath = window.location.pathname;

  taskbarItems.forEach(function (item) {
    const link = item.querySelector("a");
    if (!link) {
      return;
    }

    const linkPath = new URL(link.getAttribute("href"), window.location.href).pathname;
    const isActive = linkPath === currentPath;
    item.classList.toggle("is-active", isActive);
  });
}

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
  localStorage.removeItem("currentUser");

  // chuyển về login (kiểm tra xem hiện tại đang ở đâu)
  window.location.replace(getLoginPath());
});
function lockProtectedHistory() {
  history.pushState({ protectedPage: true }, "", window.location.href);
}

function preventBackToAuth() {
  if (!getCurrentUser()) {
    return;
  }

  history.go(1);
}

function checkAuth() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.replace(getLoginPath());
    return;
  }

  lockProtectedHistory();
}

window.addEventListener("popstate", function () {
  if (!getCurrentUser()) {
    return;
  }

  preventBackToAuth();
});

window.addEventListener("load", fillProfileForm);
window.addEventListener("load", setActiveTaskbarItem);
window.addEventListener("load", checkAuth);
window.addEventListener("pageshow", checkAuth);

bindFieldClear(modalNameInputEl, modalNameErrorEl);
bindFieldClear(modalEmailInputEl, modalEmailErrorEl);
bindFieldClear(modalPhoneInputEl, modalPhoneErrorEl);
bindFieldClear(modalGenderSelectEl, modalGenderErrorEl);
bindFieldClear(oldPasswordInputEl, oldPasswordErrorEl);
bindFieldClear(newPasswordInputEl, newPasswordErrorEl);
bindFieldClear(confirmNewPasswordInputEl, confirmNewPasswordErrorEl);

if (changeInfoBtn) {
  changeInfoBtn.addEventListener("click", handleChangeInformation);
}

if (changePasswordBtn) {
  changePasswordBtn.addEventListener("click", handleChangePassword);
}

if (changeInfoFormEl) {
  changeInfoFormEl.addEventListener("submit", handleChangeInfoSubmit);
}

if (changePasswordFormEl) {
  changePasswordFormEl.addEventListener("submit", handleChangePasswordSubmit);
}

if (closeInfoModalBtn) {
  closeInfoModalBtn.addEventListener("click", closeChangeInfoModal);
}

if (cancelInfoBtn) {
  cancelInfoBtn.addEventListener("click", closeChangeInfoModal);
}

if (closePasswordModalBtn) {
  closePasswordModalBtn.addEventListener("click", closeChangePasswordModal);
}

if (cancelPasswordBtn) {
  cancelPasswordBtn.addEventListener("click", closeChangePasswordModal);
}

if (changeInfoModalEl) {
  changeInfoModalEl.addEventListener("click", function (event) {
    if (event.target === changeInfoModalEl) {
      closeChangeInfoModal();
    }
  });
}

if (changePasswordModalEl) {
  changePasswordModalEl.addEventListener("click", function (event) {
    if (event.target === changePasswordModalEl) {
      closeChangePasswordModal();
    }
  });
}
