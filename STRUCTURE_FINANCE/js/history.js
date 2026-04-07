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
const historySearchBtn = document.querySelector(".search-btn");
const moneyLeftValueEl = document.querySelector(".money-left-value");
const deleteOverlayEl = document.getElementById("delete-overlay");
const deleteConfirmBtn = document.getElementById("delete-confirm-btn");
const deleteCancelBtn = document.getElementById("delete-cancel-btn");

let isHistoryInitialized = false;
let isSortDescending = true;
let pendingTransactionDeleteId = null;
let activeHistoryKeyword = "";
let currentHistoryPage = 1;
const HISTORY_ITEMS_PER_PAGE = 5;

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

function getRemainingMoneyForMonth(month) {
  const remainingMoneyByMonth = getStoredRemainingMoneyForHistory();

  if (remainingMoneyByMonth[month] !== undefined) {
    return Number(remainingMoneyByMonth[month] || 0);
  }

  return Number(getStoredBudgetsForHistory()[month] || 0);
}

function saveSelectedHistoryMonth(month) {
  localStorage.setItem(getHistorySelectedMonthKey(), month);
}

function showHistoryMessage(message, isSuccess) {
  historyMessageEl.textContent = message;
  historyMessageEl.classList.toggle("success", Boolean(isSuccess));
  if (isSuccess) {
    historyAmountInputEl.classList.remove("input-error");
    historyCategorySelectEl.classList.remove("input-error");
    historyNoteInputEl.classList.remove("input-error");
    historySearchInputEl.classList.remove("input-error");
  }
}

function clearHistoryMessage() {
  showHistoryMessage("", false);
  historyAmountInputEl.classList.remove("input-error");
  historyCategorySelectEl.classList.remove("input-error");
  historyNoteInputEl.classList.remove("input-error");
  historySearchInputEl.classList.remove("input-error");
}

function syncHistoryInputErrorState() {
  if (!historyAmountInputEl.value.trim()) {
    historyAmountInputEl.classList.add("input-error");
  } else {
    historyAmountInputEl.classList.remove("input-error");
  }

  if (!historyCategorySelectEl.value) {
    historyCategorySelectEl.classList.add("input-error");
  } else {
    historyCategorySelectEl.classList.remove("input-error");
  }

  historyNoteInputEl.classList.remove("input-error");
}

function updateRemainingMoneyForHistory(month) {
  if (!moneyLeftValueEl) {
    return;
  }

  moneyLeftValueEl.textContent = formatHistoryCurrency(getRemainingMoneyForMonth(month));
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
  const keyword = activeHistoryKeyword;
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

function renderHistoryPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / HISTORY_ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    historyEmptyStateEl.innerHTML = "";
    return;
  }

  if (currentHistoryPage > totalPages) {
    currentHistoryPage = totalPages;
  }

  const paginationButtons = [];

  paginationButtons.push(`
    <button type="button" data-page="${currentHistoryPage - 1}" ${currentHistoryPage === 1 ? "disabled" : ""}>
      &lt;&lt;
    </button>
  `);

  for (let page = 1; page <= totalPages; page += 1) {
    paginationButtons.push(`
      <button type="button" data-page="${page}" class="${page === currentHistoryPage ? "active" : ""}">
        ${page}
      </button>
    `);
  }

  paginationButtons.push(`
    <button type="button" data-page="${currentHistoryPage + 1}" ${currentHistoryPage === totalPages ? "disabled" : ""}>
      &gt;&gt;
    </button>
  `);

  historyEmptyStateEl.innerHTML = paginationButtons.join("");
}

function handleSearchClick() {
  const keyword = historySearchInputEl.value.trim().toLowerCase();

  if (keyword) {
    activeHistoryKeyword = keyword;
    currentHistoryPage = 1;
    historySearchInputEl.classList.remove("input-error");
    clearHistoryMessage();
    renderHistoryTable();
    return;
  }

  activeHistoryKeyword = "";
  currentHistoryPage = 1;
  historySearchInputEl.classList.remove("input-error");
  clearHistoryMessage();
  renderHistoryTable();
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

  const totalPages = Math.ceil(transactions.length / HISTORY_ITEMS_PER_PAGE);

  if (currentHistoryPage > totalPages) {
    currentHistoryPage = totalPages;
  }

  const startIndex = (currentHistoryPage - 1) * HISTORY_ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + HISTORY_ITEMS_PER_PAGE);

  historyTableBodyEl.innerHTML = paginatedTransactions
    .map(function (transaction, index) {
      return `
        <tr>
          <td>${startIndex + index + 1}</td>
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

  renderHistoryPagination(transactions.length);
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
  activeHistoryKeyword = "";
  currentHistoryPage = 1;
  historySearchInputEl.value = "";
  clearHistoryMessage();
  renderCategoryOptions();
  renderHistoryTable();
}

function handleAddTransaction() {
  const selectedMonth = historyMonthInputEl.value;
  const amountValue = historyAmountInputEl.value.trim();
  const categoryValue = historyCategorySelectEl.value;
  const noteValue = historyNoteInputEl.value.trim();
  syncHistoryInputErrorState();

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
  const currentRemainingMoney = getRemainingMoneyForMonth(selectedMonth);

  if (amountNumber > currentRemainingMoney) {
    showHistoryMessage(
      `Giao dịch vượt quá số tiền chi tiêu còn lại (${formatHistoryCurrency(currentRemainingMoney)})`,
      false
    );
    historyAmountInputEl.focus();
    return;
  }

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
  currentHistoryPage = 1;
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
  const currentRemainingMoney = getRemainingMoneyForMonth(selectedMonth);

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

function handleHistoryPaginationClick(event) {
  const paginationButton = event.target.closest("[data-page]");

  if (!paginationButton || paginationButton.disabled) {
    return;
  }

  currentHistoryPage = Number(paginationButton.dataset.page || 1);
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
    !historySearchInputEl ||
    !historySearchBtn
  ) {
    return;
  }

  isHistoryInitialized = true;

  const savedMonth = localStorage.getItem(getHistorySelectedMonthKey()) || getDefaultHistoryMonth();
  historyMonthInputEl.value = savedMonth;

  activeHistoryKeyword = "";
  renderCategoryOptions();
  renderHistoryTable();

  historyMonthInputEl.addEventListener("change", handleHistoryMonthChange);
  historyAmountInputEl.addEventListener("input", clearHistoryMessage);
  historyCategorySelectEl.addEventListener("change", clearHistoryMessage);
  historyNoteInputEl.addEventListener("input", clearHistoryMessage);
  historySearchInputEl.addEventListener("input", clearHistoryMessage);
  addTransactionBtn.addEventListener("click", syncHistoryInputErrorState);
  addTransactionBtn.addEventListener("click", handleAddTransaction);
  historyTableBodyEl.addEventListener("click", handleHistoryTableClick);
  historyEmptyStateEl.addEventListener("click", handleHistoryPaginationClick);
  historySearchBtn.addEventListener("click", handleSearchClick);
  historySearchInputEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchClick();
    }
  });
  deleteConfirmBtn.addEventListener("click", confirmDeleteTransaction);
  deleteCancelBtn.addEventListener("click", closeDeleteOverlay);
  sortAmountBtn.addEventListener("click", function () {
    isSortDescending = !isSortDescending;
    renderHistoryTable();
  });
}

window.addEventListener("load", initializeHistoryPage);
