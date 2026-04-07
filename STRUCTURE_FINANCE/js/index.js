// =========================
// 1. KHAI BAO BIEN DOM
// =========================
// Doan nay lay san cac phan tu HTML tu trang de dung lai nhieu lan.
// Neu khong luu vao bien, moi lan can dung ta lai phai query lai DOM.
// Cach nay giup code gon hon va de doc hon.
// Cache cac the HTML se dung nhieu lan trong file.
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
// Luu tam du lieu profile sau khi user sua.
let data = null;

// =========================
// 2. CAC HAM DOC DU LIEU CO BAN
// =========================
// Xac dinh duong dan login theo vi tri file hien tai.
function getLoginPath() {
  const currentPath = window.location.pathname;
  return currentPath.includes("/pages/") ? "./login.html" : "./pages/login.html";
}

// Doc thong tin user dang dang nhap.
// localStorage chi luu du lieu duoi dang chuoi,
// nen phai dung JSON.parse(...) de doi ve object JavaScript.
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Doc danh sach user da luu; neu chua co thi tra ve mang rong.
// Toan tu || [] o day co nghia la:
// neu ve trai la null / undefined / false thi lay gia tri ben phai la [].
function getUsers() {
  return JSON.parse(localStorage.getItem("user")) || [];
}

// =========================
// 3. CAC HAM HIEN THI / XOA LOI
// =========================
// Hien thi message loi va gan class loi cho input.
function showError(input, errorEl, message) {
  if (!input || !errorEl) {
    return;
  }

  errorEl.innerText = message;
  errorEl.style.display = "block";
  input.classList.add("input-error");
}

// Xoa message loi va tra input ve trang thai binh thuong.
function clearError(input, errorEl) {
  if (!input || !errorEl) {
    return;
  }

  errorEl.style.display = "none";
  input.classList.remove("input-error");
}

// Khi user thao tac lai voi input thi an loi di.
// focus: vua click vao o input
// input: dang go chu
// change: doi gia tri xong va roi khoi input / select
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

// =========================
// 4. CHUAN HOA DU LIEU
// =========================
// Chuyen nhieu kieu du lieu gioi tinh ve 3 gia tri hien thi thong nhat.
// Muc dich: du lieu cu co the khong dong nhat, nhung giao dien select chi can 3 gia tri co dinh.
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

// =========================
// 5. DO DU LIEU LEN GIAO DIEN
// =========================
// Do du lieu tu currentUser len form profile o trang chinh.
function fillProfileForm() {
  const currentUser = getCurrentUser();

  if (!currentUser || !nameInputEl || !emailInputEl || !phoneInputEl || !genderSelectEl) {
    return;
  }

  // Lay gia tri hop le dau tien trong chuoi so sanh:
  // fullName -> name -> chuoi rong.
  nameInputEl.value = currentUser.fullName || currentUser.name || "";
  emailInputEl.value = currentUser.email || "";
  phoneInputEl.value = currentUser.phone || "";
  genderSelectEl.value = normalizeGender(currentUser.gender);
}

// Sao chep du lieu hien tai vao modal de user chinh sua.
function fillChangeInfoModal() {
  const currentUser = getCurrentUser();

  if (!modalNameInputEl || !modalEmailInputEl || !modalPhoneInputEl || !modalGenderSelectEl) {
    return;
  }

  // Optional chaining ?. tranh loi neu currentUser khong ton tai.
  // Toan tu || giup lay gia tri hop le dau tien.
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

// =========================
// 6. VALIDATE FORM
// =========================
// Kiem tra cac truong bat buoc trong form sua thong tin.
// Bien isValid ban dau la true, gap loi o dau thi chuyen thanh false.
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

// Moi lan mo modal doi mat khau thi reset du lieu cu va loi cu.
// Muc dich la tranh truong hop user mo lai modal nhung van thay du lieu lan truoc.
function resetChangePasswordForm() {
  if (!changePasswordFormEl) {
    return;
  }

  changePasswordFormEl.reset();
  clearError(oldPasswordInputEl, oldPasswordErrorEl);
  clearError(newPasswordInputEl, newPasswordErrorEl);
  clearError(confirmNewPasswordInputEl, confirmNewPasswordErrorEl);
}

// Kiem tra mat khau cu dung khong va xac nhan mat khau moi co khop khong.
// Neu co bat ky dieu kien nao sai thi showError va tra ve false.
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

// =========================
// 7. TAO OBJECT USER MOI TU DU LIEU FORM
// =========================
// Gom du lieu tu modal thanh object user moi.
function getProfileFormData() {
  return {
    // ...object cu nghia la copy toan bo thuoc tinh cu cua user hien tai.
    // Sau do cac dong ben duoi se ghi de len nhung truong can cap nhat.
    ...getCurrentUser(),
    name: modalNameInputEl.value.trim(),
    fullName: modalNameInputEl.value.trim(),
    email: modalEmailInputEl.value.trim(),
    phone: modalPhoneInputEl.value.trim(),
    gender: modalGenderSelectEl.value
  };
}

// =========================
// 8. LUU PROFILE / PASSWORD VAO localStorage
// =========================
// Cap nhat thong tin user trong localStorage va dong bo lai giao dien.
function saveProfileData() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.replace(getLoginPath());
    return;
  }

  data = getProfileFormData();
  // Gan len window de co the debug tren console neu can.
  window.data = data;

  const users = getUsers();
  // findIndex(...) se tim vi tri cua user can sua trong mang users.
  // Neu tim thay => tra ve index >= 0
  // Neu khong tim thay => tra ve -1
  // Uu tien tim theo id; neu du lieu cu khong co id thi tim theo email.
  const userIndex = users.findIndex(function (user) {
    if (currentUser.id != null && user.id != null) {
      return user.id === currentUser.id;
    }

    return user.email === currentUser.email;
  });

  if (userIndex >= 0) {
    // Tim thay user cu thi ghi de du lieu moi len dung vi tri cu trong mang.
    users[userIndex] = {
      // Giu lai du lieu cu cua user.
      ...users[userIndex],
      // Ghi de cac truong user vua sua.
      ...data
    };
  } else {
    // Neu khong tim thay thi them moi de tranh mat du lieu.
    users.push(data);
  }

  // Sau khi cap nhat mang users xong, ghi nguoc lai vao localStorage.
  // user: danh sach tat ca tai khoan
  // currentUser: tai khoan dang dang nhap
  localStorage.setItem("user", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(data));

  fillProfileForm();
  closeChangeInfoModal();
}

// Chi cap nhat truong password cho user hien tai.
// Logic tuong tu saveProfileData nhung pham vi update nho hon.
function savePasswordData() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.replace(getLoginPath());
    return;
  }

  const updatedUser = {
    ...currentUser,
    // Password moi duoc lay truc tiep tu input sau khi da validate.
    password: newPasswordInputEl.value.trim()
  };

  const users = getUsers();
  // Dung cung cach tim user nhu luc sua profile de tranh lech du lieu.
  const userIndex = users.findIndex(function (user) {
    if (currentUser.id != null && user.id != null) {
      return user.id === currentUser.id;
    }

    return user.email === currentUser.email;
  });

  if (userIndex >= 0) {
    // Chi thay doi password, giu nguyen cac truong khac cua user cu.
    users[userIndex] = {
      ...users[userIndex],
      password: updatedUser.password
    };
  } else {
    // Truong hop hiem: user chua ton tai trong mang thi day ca object moi vao.
    users.push(updatedUser);
  }

  localStorage.setItem("user", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  closeChangePasswordModal();
}

// =========================
// 9. DIEU KHIEN MODAL
// =========================
// Nhom ham dieu khien viec mo / dong 2 modal.
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

// =========================
// 10. CAC HAM XU LY SU KIEN
// =========================
// Tach handler rieng ra de phan gan su kien de doc hon.
function handleChangeInformation() {
  openChangeInfoModal();
}

function handleChangePassword() {
  openChangePasswordModal();
}

function handleChangeInfoSubmit(event) {
  // Chan hanh vi submit mac dinh cua form de trang khong bi reload.
  // Neu khong co dong nay, trinh duyet se reload trang khi bam Save.
  event.preventDefault();

  if (!validateChangeInfoForm()) {
    return;
  }

  saveProfileData();
}

function handleChangePasswordSubmit(event) {
  // Chan hanh vi submit mac dinh cua form de tu xu ly bang JavaScript.
  event.preventDefault();

  if (!validateChangePasswordForm()) {
    return;
  }

  savePasswordData();
}

// =========================
// 11. DANH DAU TASKBAR DANG ACTIVE
// =========================
// Danh dau muc taskbar trung voi trang dang mo de user biet vi tri hien tai.
function setActiveTaskbarItem() {
  const taskbarItems = document.querySelectorAll(".taskbar-items");
  if (!taskbarItems.length) {
    return;
  }

  const currentPath = window.location.pathname;

  taskbarItems.forEach(function (item) {
    // Moi item chua 1 the a, can lay link ben trong de so sanh voi URL hien tai.
    const link = item.querySelector("a");
    if (!link) {
      return;
    }

    // Chuyen href tuong doi thanh pathname tuyet doi de so sanh cho chinh xac.
    const linkPath = new URL(link.getAttribute("href"), window.location.href).pathname;
    const isActive = linkPath === currentPath;
    // classList.toggle("is-active", isActive) co nghia la:
    // - isActive = true  => them class is-active
    // - isActive = false => xoa class is-active
    item.classList.toggle("is-active", isActive);
  });
}

// =========================
// 12. XU LY LOGOUT
// =========================
// Neu user chon logout trong select thi hien hop thoai xac nhan.
function handleOption() {
  if (optionHeaderEl.value === "logout") {
    logoutOverlay.style.display = "flex";
  }
}

// Nut Cancel trong overlay chi dong hop thoai va khong logout.
cancelBtn.addEventListener("click", function () {
  logoutOverlay.style.display = "none";
  optionHeaderEl.value = ""; // reset lại select
});

// Nhấn "Có" → logout
// Khi dong y logout, xoa session dang nhap va quay lai login.
confirmBtn.addEventListener("click", function () {
  localStorage.removeItem("currentUser");

  // chuyển về login (kiểm tra xem hiện tại đang ở đâu)
  window.location.replace(getLoginPath());
});
// =========================
// 13. AUTH + CHAN NUT BACK
// =========================
// Day them 1 state vao history de han che viec back ve trang auth sau login.
function lockProtectedHistory() {
  history.pushState({ protectedPage: true }, "", window.location.href);
}

// Neu van con dang nhap thi day trinh duyet tien toi de chan nut Back.
// history.go(1) nghia la di toi 1 muc phia truoc trong lich su trinh duyet.
function preventBackToAuth() {
  if (!getCurrentUser()) {
    return;
  }

  history.go(1);
}

// Bao ve trang hien tai: chua login thi quay ve login, da login thi khoa history.
function checkAuth() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.replace(getLoginPath());
    return;
  }

  lockProtectedHistory();
}

// Lang nghe su kien Back / Forward cua trinh duyet.
window.addEventListener("popstate", function () {
  if (!getCurrentUser()) {
    return;
  }

  // Neu user van dang login ma bam Back thi day lai 1 buoc tien toi.
  preventBackToAuth();
});

// =========================
// 14. DIEM BAT DAU CHAY CHUONG TRINH
// =========================
// Khoi tao du lieu va auth moi lan trang hien thi.
window.addEventListener("load", fillProfileForm);
window.addEventListener("load", setActiveTaskbarItem);
window.addEventListener("load", checkAuth);
window.addEventListener("pageshow", checkAuth);

// Gan hanh vi clear loi cho tat ca field trong modal.
bindFieldClear(modalNameInputEl, modalNameErrorEl);
bindFieldClear(modalEmailInputEl, modalEmailErrorEl);
bindFieldClear(modalPhoneInputEl, modalPhoneErrorEl);
bindFieldClear(modalGenderSelectEl, modalGenderErrorEl);
bindFieldClear(oldPasswordInputEl, oldPasswordErrorEl);
bindFieldClear(newPasswordInputEl, newPasswordErrorEl);
bindFieldClear(confirmNewPasswordInputEl, confirmNewPasswordErrorEl);

// =========================
// 15. GAN CAC SU KIEN
// =========================
// Chi gan event neu phan tu ton tai, tranh loi khi bo cuc thay doi.
if (changeInfoBtn) {
  // Mo modal sua thong tin khi user bam nut Change Information.
  changeInfoBtn.addEventListener("click", handleChangeInformation);
}

if (changePasswordBtn) {
  // Mo modal doi mat khau khi user bam nut Change Password.
  changePasswordBtn.addEventListener("click", handleChangePassword);
}

if (changeInfoFormEl) {
  // Xu ly luu thong tin khi submit form trong modal.
  changeInfoFormEl.addEventListener("submit", handleChangeInfoSubmit);
}

if (changePasswordFormEl) {
  // Xu ly doi mat khau khi submit form trong modal.
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
    // Chi dong khi click vao lop nen, khong dong khi click vao noi dung modal.
    if (event.target === changeInfoModalEl) {
      closeChangeInfoModal();
    }
  });
}

if (changePasswordModalEl) {
  changePasswordModalEl.addEventListener("click", function (event) {
    // Chi dong khi click vao lop nen, khong dong khi click vao noi dung modal.
    if (event.target === changePasswordModalEl) {
      closeChangePasswordModal();
    }
  });
}
