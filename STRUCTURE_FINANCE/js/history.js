const historyMonthInputEl = document.getElementById("history-month-input");
const historyAmountInputEl = document.getElementById("history-amount-input");
const historyCategorySelectEl = document.getElementById("history-category-select");
const historyNoteInputEl = document.getElementById("history-note-input");
const addTransactionBtn = document.getElementById("add-transaction-btn");
const historyMessageEl = document.getElementById("history-message");
const historyTableBodyEl = document.getElementById("history-table-body");
const historyEmptyStateEl = document.getElementById("history-empty-state");
const sortAmountBtn = document.getElementById("sort-amount-btn");
const historySearchInputEl = document.getElementById("history-search-input");
const moneyLeftValueEl = document.querySelector(".money-left-value");
const deleteOverlayEl = document.getElementById("delete-overlay");
const deleteConfirmBtn = document.getElementById("delete-confirm-btn");
const deleteCancelBtn = document.getElementById("delete-cancel-btn");

let isHistoryInitialized = false;
let isSortDescending = true;
let pendingTransactionDeleteId = null;

function getCurrentUserForHistory() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function getHistoryUserKey() {
  const currentUser = getCurrentUserForHistory();
  return currentUser?.email || currentUser?.id || currentUser?.username || "guest";
}

function getHistorySelectedMonthKey() {
  return `selectedMonth_${getHistoryUserKey()}`;
}

function getHistoryTransactionsKey() {
  return `transactions_${getHistoryUserKey()}`;
}

function getHistoryCategoriesKey() {
  return `categories_${getHistoryUserKey()}`;
}

function getHistoryBudgetsKey() {
  return `monthlyBudgets_${getHistoryUserKey()}`;
}

function getHistoryRemainingMoneyKey() {
  return `remainingMoney_${getHistoryUserKey()}`;
}

function getDefaultHistoryMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatHistoryCurrency(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} VND`;
}

function getStoredTransactionsForHistory() {
  return JSON.parse(localStorage.getItem(getHistoryTransactionsKey())) || {};
}

function saveStoredTransactionsForHistory(transactionsByMonth) {
  localStorage.setItem(getHistoryTransactionsKey(), JSON.stringify(transactionsByMonth));
}

function getStoredRemainingMoneyForHistory() {
  return JSON.parse(localStorage.getItem(getHistoryRemainingMoneyKey())) || {};
}

function saveStoredRemainingMoneyForHistory(remainingMoneyByMonth) {
  localStorage.setItem(getHistoryRemainingMoneyKey(), JSON.stringify(remainingMoneyByMonth));
}

function getTransactionsForMonth(month) {
  const transactionsByMonth = getStoredTransactionsForHistory();

  if (Array.isArray(transactionsByMonth[month])) {
    return transactionsByMonth[month];
  }

  return [];
}

function getStoredCategoriesForHistory() {
  return JSON.parse(localStorage.getItem(getHistoryCategoriesKey())) || {};
}

function getCategoriesForMonth(month) {
  const categoriesByMonth = getStoredCategoriesForHistory();
  return categoriesByMonth[month] || [];
}

function getStoredBudgetsForHistory() {
  return JSON.parse(localStorage.getItem(getHistoryBudgetsKey())) || {};
}

function saveSelectedHistoryMonth(month) {
  localStorage.setItem(getHistorySelectedMonthKey(), month);
}

function showHistoryMessage(message, isSuccess) {
  historyMessageEl.textContent = message;
  historyMessageEl.classList.toggle("success", Boolean(isSuccess));
}

function clearHistoryMessage() {
  showHistoryMessage("", false);
}

function updateRemainingMoneyForHistory(month) {
  if (!moneyLeftValueEl) {
    return;
  }

  const remainingMoneyByMonth = getStoredRemainingMoneyForHistory();
  const monthlyBudget = Number(getStoredBudgetsForHistory()[month] || 0);
  const remainingMoney =
    remainingMoneyByMonth[month] !== undefined
      ? Number(remainingMoneyByMonth[month] || 0)
      : monthlyBudget - getTransactionsForMonth(month).reduce(function (sum, transaction) {
          return sum + Number(transaction.amount || 0);
        }, 0);

  moneyLeftValueEl.textContent = formatHistoryCurrency(remainingMoney);
}

function renderCategoryOptions() {
  const selectedMonth = historyMonthInputEl.value || getDefaultHistoryMonth();
  const categories = getCategoriesForMonth(selectedMonth);
  const currentValue = historyCategorySelectEl.value;

  historyCategorySelectEl.innerHTML = '<option value="">Danh mục chi tiêu</option>';

  categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    historyCategorySelectEl.appendChild(option);
  });

  if (categories.some(function (category) { return category.name === currentValue; })) {
    historyCategorySelectEl.value = currentValue;
  }
}

function buildFilteredTransactions(month) {
  const keyword = historySearchInputEl.value.trim().toLowerCase();
  let transactions = getTransactionsForMonth(month).slice();

  if (keyword) {
    transactions = transactions.filter(function (transaction) {
      const category = (transaction.category || "").toLowerCase();
      const note = (transaction.note || "").toLowerCase();
      return category.includes(keyword) || note.includes(keyword);
    });
  }

  transactions.sort(function (a, b) {
    return isSortDescending
      ? Number(b.amount || 0) - Number(a.amount || 0)
      : Number(a.amount || 0) - Number(b.amount || 0);
  });

  return transactions;
}

function renderHistoryTable() {
  const selectedMonth = historyMonthInputEl.value || getDefaultHistoryMonth();
  const transactions = buildFilteredTransactions(selectedMonth);

  if (!transactions.length) {
    historyTableBodyEl.innerHTML = "";
    historyEmptyStateEl.innerHTML = '<p class="empty-history">Chưa có khoản chi tiêu nào trong tháng này.</p>';
    updateRemainingMoneyForHistory(selectedMonth);
    return;
  }

  historyEmptyStateEl.innerHTML = "";
  historyTableBodyEl.innerHTML = transactions
    .map(function (transaction, index) {
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${transaction.category}</td>
          <td>${formatHistoryCurrency(transaction.amount)}</td>
          <td>${transaction.note || ""}</td>
          <td>
            <button class="delete-btn" data-id="${transaction.id}" title="Xóa giao dịch">
              <img class="delete" src="../assets/images/Trash.png" alt="Delete" />
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  updateRemainingMoneyForHistory(selectedMonth);
}

function resetHistoryForm() {
  historyAmountInputEl.value = "";
  historyCategorySelectEl.value = "";
  historyNoteInputEl.value = "";
}

function handleHistoryMonthChange() {
  const selectedMonth = historyMonthInputEl.value || getDefaultHistoryMonth();
  historyMonthInputEl.value = selectedMonth;
  saveSelectedHistoryMonth(selectedMonth);
  clearHistoryMessage();
  renderCategoryOptions();
  renderHistoryTable();
}

function handleAddTransaction() {
  const selectedMonth = historyMonthInputEl.value;
  const amountValue = historyAmountInputEl.value.trim();
  const categoryValue = historyCategorySelectEl.value;
  const noteValue = historyNoteInputEl.value.trim();

  if (!selectedMonth) {
    showHistoryMessage("Vui lòng chọn tháng chi tiêu", false);
    historyMonthInputEl.focus();
    return;
  }

  if (!amountValue) {
    showHistoryMessage("Vui lòng nhập số tiền", false);
    historyAmountInputEl.focus();
    return;
  }

  const amountNumber = Number(amountValue);
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    showHistoryMessage("Số tiền phải lớn hơn 0", false);
    historyAmountInputEl.focus();
    return;
  }

  if (!categoryValue) {
    showHistoryMessage("Vui lòng chọn danh mục chi tiêu", false);
    historyCategorySelectEl.focus();
    return;
  }

  const transactionsByMonth = getStoredTransactionsForHistory();
  const transactions = transactionsByMonth[selectedMonth] || [];
  const remainingMoneyByMonth = getStoredRemainingMoneyForHistory();
  const currentRemainingMoney =
    remainingMoneyByMonth[selectedMonth] !== undefined
      ? Number(remainingMoneyByMonth[selectedMonth] || 0)
      : Number(getStoredBudgetsForHistory()[selectedMonth] || 0);

  transactions.push({
    id: `${Date.now()}`,
    amount: amountNumber,
    category: categoryValue,
    note: noteValue,
    month: selectedMonth,
  });

  transactionsByMonth[selectedMonth] = transactions;
  saveStoredTransactionsForHistory(transactionsByMonth);
  remainingMoneyByMonth[selectedMonth] = currentRemainingMoney - amountNumber;
  saveStoredRemainingMoneyForHistory(remainingMoneyByMonth);
  saveSelectedHistoryMonth(selectedMonth);

  resetHistoryForm();
  showHistoryMessage("Đã thêm khoản chi tiêu thành công", true);
  renderHistoryTable();
}

function handleHistoryTableClick(event) {
  const deleteButton = event.target.closest("[data-id]");
  if (!deleteButton) {
    return;
  }

  pendingTransactionDeleteId = deleteButton.dataset.id;
  deleteOverlayEl.style.display = "flex";
}

function closeDeleteOverlay() {
  pendingTransactionDeleteId = null;
  deleteOverlayEl.style.display = "none";
}

function confirmDeleteTransaction() {
  if (!pendingTransactionDeleteId) {
    return;
  }

  const selectedMonth = historyMonthInputEl.value || getDefaultHistoryMonth();
  const transactionsByMonth = getStoredTransactionsForHistory();
  const transactions = transactionsByMonth[selectedMonth] || [];
  const transactionToDelete = transactions.find(function (transaction) {
    return transaction.id === pendingTransactionDeleteId;
  });

  if (!transactionToDelete) {
    closeDeleteOverlay();
    return;
  }

  const remainingMoneyByMonth = getStoredRemainingMoneyForHistory();
  const currentRemainingMoney =
    remainingMoneyByMonth[selectedMonth] !== undefined
      ? Number(remainingMoneyByMonth[selectedMonth] || 0)
      : Number(getStoredBudgetsForHistory()[selectedMonth] || 0);

  transactionsByMonth[selectedMonth] = transactions.filter(function (transaction) {
    return transaction.id !== pendingTransactionDeleteId;
  });

  saveStoredTransactionsForHistory(transactionsByMonth);
  remainingMoneyByMonth[selectedMonth] = currentRemainingMoney + Number(transactionToDelete.amount || 0);
  saveStoredRemainingMoneyForHistory(remainingMoneyByMonth);
  closeDeleteOverlay();
  showHistoryMessage("Đã xóa khoản chi tiêu", true);
  renderHistoryTable();
}

function initializeHistoryPage() {
  if (
    isHistoryInitialized ||
    !historyMonthInputEl ||
    !historyAmountInputEl ||
    !historyCategorySelectEl ||
    !historyNoteInputEl ||
    !addTransactionBtn ||
    !historyMessageEl ||
    !historyTableBodyEl ||
    !historyEmptyStateEl ||
    !sortAmountBtn ||
    !historySearchInputEl
  ) {
    return;
  }

  isHistoryInitialized = true;

  const savedMonth = localStorage.getItem(getHistorySelectedMonthKey()) || getDefaultHistoryMonth();
  historyMonthInputEl.value = savedMonth;

  renderCategoryOptions();
  renderHistoryTable();

  historyMonthInputEl.addEventListener("change", handleHistoryMonthChange);
  historyAmountInputEl.addEventListener("input", clearHistoryMessage);
  historyCategorySelectEl.addEventListener("change", clearHistoryMessage);
  historyNoteInputEl.addEventListener("input", clearHistoryMessage);
  addTransactionBtn.addEventListener("click", handleAddTransaction);
  historyTableBodyEl.addEventListener("click", handleHistoryTableClick);
  historySearchInputEl.addEventListener("input", renderHistoryTable);
  deleteConfirmBtn.addEventListener("click", confirmDeleteTransaction);
  deleteCancelBtn.addEventListener("click", closeDeleteOverlay);
  sortAmountBtn.addEventListener("click", function () {
    isSortDescending = !isSortDescending;
    renderHistoryTable();
  });
}

window.addEventListener("load", initializeHistoryPage);
