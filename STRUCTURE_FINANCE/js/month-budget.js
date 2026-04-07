const monthInputEl = document.getElementById("month-input");
const budgetInputEl = document.getElementById("budget-input");
// Cache cac phan tu giao dien cua form ngan sach thang.
const saveBudgetBtn = document.getElementById("save-budget-btn");
const budgetMessageEl = document.getElementById("budget-message");
const remainingMoneyEl = document.querySelector(".money");

let isBudgetFormInitialized = false;

// Lay user dang dang nhap de tach du lieu ngan sach theo tung tai khoan.
function getCurrentUserForBudget() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Tao khoa rieng cho tung user khi luu du lieu.
function getBudgetUserKey() {
  const currentUser = getCurrentUserForBudget();
  return currentUser?.email || currentUser?.id || currentUser?.username || "guest";
}

// Cac key duoc tao dong theo user.
function getSelectedMonthKey() {
  return `selectedMonth_${getBudgetUserKey()}`;
}

function getMonthlyBudgetKey() {
  return `monthlyBudgets_${getBudgetUserKey()}`;
}

function getRemainingMoneyKey() {
  return `remainingMoney_${getBudgetUserKey()}`;
}

function getTransactionStorageKey() {
  return `transactions_${getBudgetUserKey()}`;
}

// Tra ve thang hien tai theo dinh dang YYYY-MM.
function getDefaultMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Doc / ghi du lieu ngan sach va so tien con lai.
function getSavedBudgets() {
  return JSON.parse(localStorage.getItem(getMonthlyBudgetKey())) || {};
}

function saveBudgets(budgets) {
  localStorage.setItem(getMonthlyBudgetKey(), JSON.stringify(budgets));
}

function getSavedRemainingMoney() {
  return JSON.parse(localStorage.getItem(getRemainingMoneyKey())) || {};
}

function saveRemainingMoney(remainingMoneyByMonth) {
  localStorage.setItem(getRemainingMoneyKey(), JSON.stringify(remainingMoneyByMonth));
}

// Dinh dang so tien theo giao dien tien VND.
function formatCurrencyVND(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} VND`;
}

// Hien thong bao loi khi luu ngan sach that bai.
function showBudgetWarning(message) {
  if (!budgetMessageEl) {
    return;
  }

  budgetMessageEl.textContent = message;
  budgetMessageEl.classList.remove("success");
}

// Hien thong bao thanh cong va xoa class loi.
function showBudgetSuccess(message) {
  if (!budgetMessageEl) {
    return;
  }

  budgetMessageEl.textContent = message;
  budgetMessageEl.classList.add("success");
  budgetInputEl.classList.remove("input-error");
}

// Xoa thong bao cu moi khi user nhap lai.
function clearBudgetMessage() {
  if (!budgetMessageEl) {
    return;
  }

  budgetMessageEl.textContent = "";
  budgetMessageEl.classList.remove("success");
  budgetInputEl.classList.remove("input-error");
}

// Cap nhat o "so tien con lai" theo thang dang chon.
function updateRemainingMoney(month) {
  if (!remainingMoneyEl) {
    return;
  }

  const remainingMoneyByMonth = getSavedRemainingMoney();
  const remainingMoney =
    remainingMoneyByMonth[month] !== undefined
      ? Number(remainingMoneyByMonth[month] || 0)
      : Number(getSavedBudgets()[month] || 0);
  remainingMoneyEl.textContent = formatCurrencyVND(remainingMoney);
}

// Nap ngan sach cua thang dang chon len input.
function loadBudgetByMonth(month) {
  const budgets = getSavedBudgets();
  budgetInputEl.value = budgets[month] || "";
  clearBudgetMessage();
  updateRemainingMoney(month);
}

// Luu thang dang chon de cac trang khac dung chung.
function saveSelectedMonth(month) {
  localStorage.setItem(getSelectedMonthKey(), month);
}

// Khi doi thang thi nap lai ngan sach va so tien con lai cua thang do.
function handleMonthChange() {
  const selectedMonth = monthInputEl.value || getDefaultMonth();
  monthInputEl.value = selectedMonth;
  saveSelectedMonth(selectedMonth);
  loadBudgetByMonth(selectedMonth);
}

// Validate va luu ngan sach thang vao localStorage.
function handleBudgetSave() {
  const selectedMonth = monthInputEl.value;
  const budgetValue = budgetInputEl.value.trim();

  if (!selectedMonth) {
    showBudgetWarning("Vui lòng chọn tháng chi tiêu");
    monthInputEl.focus();
    return;
  }

  if (!budgetValue) {
    showBudgetWarning("Vui lòng nhập số tiền chi tiêu");
    budgetInputEl.classList.add("input-error");
    budgetInputEl.focus();
    return;
  }

  const budgetNumber = Number(budgetValue);
  if (Number.isNaN(budgetNumber) || budgetNumber <= 0) {
    showBudgetWarning("Ngân sách phải là số lớn hơn 0");
    budgetInputEl.focus();
    return;
  }

  // Moi lan dat ngan sach moi thi reset so tien con lai = ngan sach moi.
  const budgets = getSavedBudgets();
  budgets[selectedMonth] = budgetNumber;
  const remainingMoneyByMonth = getSavedRemainingMoney();
  remainingMoneyByMonth[selectedMonth] = budgetNumber;

  saveBudgets(budgets);
  saveRemainingMoney(remainingMoneyByMonth);
  saveSelectedMonth(selectedMonth);
  budgetInputEl.value = budgetNumber;
  updateRemainingMoney(selectedMonth);
  showBudgetSuccess("Đã lưu ngân sách thành công");
}

// Khoi tao form ngan sach 1 lan va gan event.
function initializeMonthBudget() {
  if (
    isBudgetFormInitialized ||
    !monthInputEl ||
    !budgetInputEl ||
    !saveBudgetBtn ||
    !budgetMessageEl
  ) {
    return;
  }

  isBudgetFormInitialized = true;

  const savedMonth = localStorage.getItem(getSelectedMonthKey()) || getDefaultMonth();
  monthInputEl.value = savedMonth;
  loadBudgetByMonth(savedMonth);

  monthInputEl.addEventListener("change", handleMonthChange);
  budgetInputEl.addEventListener("input", clearBudgetMessage);
  saveBudgetBtn.addEventListener("click", handleBudgetSave);
}

window.addEventListener("load", initializeMonthBudget);
