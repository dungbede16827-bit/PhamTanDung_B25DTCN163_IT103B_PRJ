const monthInputEl = document.getElementById("month-input");
const budgetInputEl = document.getElementById("budget-input");
const saveBudgetBtn = document.getElementById("save-budget-btn");
const budgetMessageEl = document.getElementById("budget-message");
const remainingMoneyEl = document.querySelector(".money");

let isBudgetFormInitialized = false;

function getCurrentUserForBudget() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function getBudgetUserKey() {
  const currentUser = getCurrentUserForBudget();
  return currentUser?.email || currentUser?.id || currentUser?.username || "guest";
}

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

function getDefaultMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

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

function getSavedTransactions() {
  return JSON.parse(localStorage.getItem(getTransactionStorageKey())) || {};
}

function getTransactionsByMonth(month) {
  const transactionsByMonth = getSavedTransactions();

  if (Array.isArray(transactionsByMonth[month])) {
    return transactionsByMonth[month];
  }

  return [];
}

function formatCurrencyVND(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} VND`;
}

function showBudgetWarning(message) {
  if (!budgetMessageEl) {
    return;
  }

  budgetMessageEl.textContent = message;
  budgetMessageEl.classList.remove("success");
}

function showBudgetSuccess(message) {
  if (!budgetMessageEl) {
    return;
  }

  budgetMessageEl.textContent = message;
  budgetMessageEl.classList.add("success");
}

function clearBudgetMessage() {
  if (!budgetMessageEl) {
    return;
  }

  budgetMessageEl.textContent = "";
  budgetMessageEl.classList.remove("success");
}

function updateRemainingMoney(month) {
  if (!remainingMoneyEl) {
    return;
  }

  const remainingMoneyByMonth = getSavedRemainingMoney();
  const remainingMoney = Number(remainingMoneyByMonth[month] || 0);
  remainingMoneyEl.textContent = formatCurrencyVND(remainingMoney);
}

function loadBudgetByMonth(month) {
  const budgets = getSavedBudgets();
  budgetInputEl.value = budgets[month] || "";
  clearBudgetMessage();
  updateRemainingMoney(month);
}

function saveSelectedMonth(month) {
  localStorage.setItem(getSelectedMonthKey(), month);
}

function handleMonthChange() {
  const selectedMonth = monthInputEl.value || getDefaultMonth();
  monthInputEl.value = selectedMonth;
  saveSelectedMonth(selectedMonth);
  loadBudgetByMonth(selectedMonth);
}

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
    budgetInputEl.focus();
    return;
  }

  const budgetNumber = Number(budgetValue);
  if (Number.isNaN(budgetNumber) || budgetNumber <= 0) {
    showBudgetWarning("Ngân sách phải là số lớn hơn 0");
    budgetInputEl.focus();
    return;
  }

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
