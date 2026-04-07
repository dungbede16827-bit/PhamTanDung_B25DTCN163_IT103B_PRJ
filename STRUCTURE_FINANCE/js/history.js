const historyMonthInputEl = document.getElementById("history-month-input");
const historyAmountInputEl = document.getElementById("history-amount-input");
// Cache cac phan tu giao dien cua trang lich su chi tieu.
const historyCategorySelectEl = document.getElementById("history-category-select");
const historyNoteInputEl = document.getElementById("history-note-input");
const addTransactionBtn = document.getElementById("add-transaction-btn");
const historyMessageEl = document.getElementById("history-message");
const historyTableBodyEl = document.getElementById("history-table-body");
const historyEmptyStateEl = document.getElementById("history-empty-state");
const sortAmountSelectEl = document.getElementById("sort-amount-select");
const historySearchInputEl = document.getElementById("history-search-input");
const historySearchBtn = document.querySelector(".search-btn");
const moneyLeftValueEl = document.querySelector(".money-left-value");
const deleteOverlayEl = document.getElementById("delete-overlay");
const deleteConfirmBtn = document.getElementById("delete-confirm-btn");
const deleteCancelBtn = document.getElementById("delete-cancel-btn");

let isHistoryInitialized = false;
let pendingTransactionDeleteId = null;
let activeHistoryKeyword = "";
let currentHistoryPage = 1;
const HISTORY_ITEMS_PER_PAGE = 5;

// Lay user dang dang nhap de tach du lieu theo tung tai khoan.
function getCurrentUserForHistory() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Tao khoa rieng cho moi user, tranh ghi de du lieu cua nhau.
function getHistoryUserKey() {
  const currentUser = getCurrentUserForHistory();
  return currentUser?.email || currentUser?.id || currentUser?.username || "guest";
}

// Cac key duoc tao dong theo user de luu du lieu trong localStorage.
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

// Tra ve thang hien tai theo dinh dang YYYY-MM.
function getDefaultHistoryMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Dinh dang so tien theo giao dien tien VND.
function formatHistoryCurrency(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} VND`;
}

// Doc / ghi du lieu giao dich va so tien con lai.
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
  // He thong hien tai luu giao dich theo tung thang trong 1 object.
  const transactionsByMonth = getStoredTransactionsForHistory();

  if (Array.isArray(transactionsByMonth[month])) {
    return transactionsByMonth[month];
  }

  return [];
}

// Lay danh sach danh muc da tao trong thang de do vao select.
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

// Neu da co remainingMoney thi uu tien dung gia tri do,
// neu chua thi lay ngan sach goc cua thang.
function getRemainingMoneyForMonth(month) {
  const remainingMoneyByMonth = getStoredRemainingMoneyForHistory();

  if (remainingMoneyByMonth[month] !== undefined) {
    return Number(remainingMoneyByMonth[month] || 0);
  }

  return Number(getStoredBudgetsForHistory()[month] || 0);
}

// Luu thang dang xem de khi tai lai trang van giu nguyen bo loc.
function saveSelectedHistoryMonth(month) {
  localStorage.setItem(getHistorySelectedMonthKey(), month);
}

// Hien message thanh cong / loi va reset vien do khi can.
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

// Dong bo class loi tren cac input truoc khi validate.
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

// Cap nhat o "so tien con lai" tren giao dien.
function updateRemainingMoneyForHistory(month) {
  if (!moneyLeftValueEl) {
    return;
  }

  moneyLeftValueEl.textContent = formatHistoryCurrency(getRemainingMoneyForMonth(month));
}

// Render lai danh sach option danh muc theo thang dang chon.
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

// Loc theo tu khoa va sap xep theo so tien truoc khi phan trang.
function buildFilteredTransactions(month) {
  const keyword = activeHistoryKeyword;
  const sortDirection = sortAmountSelectEl?.value || "default";
  let transactions = getTransactionsForMonth(month).slice();

  if (keyword) {
    transactions = transactions.filter(function (transaction) {
      const category = (transaction.category || "").toLowerCase();
      const note = (transaction.note || "").toLowerCase();
      return category.includes(keyword) || note.includes(keyword);
    });
  }

  if (sortDirection !== "default") {
    transactions.sort(function (a, b) {
      return sortDirection === "desc"
        ? Number(b.amount || 0) - Number(a.amount || 0)
        : Number(a.amount || 0) - Number(b.amount || 0);
    });
  }

  return transactions;
}

// Ve cac nut phan trang.
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

// Search tren category va note, sau do render lai bang tu trang 1.
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

// Render bang lich su theo bo loc hien tai.
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

// Reset form them giao dich sau khi luu thanh cong.
function resetHistoryForm() {
  historyAmountInputEl.value = "";
  historyCategorySelectEl.value = "";
  historyNoteInputEl.value = "";
}

// Khi doi thang, reset cac bo loc va nap du lieu cua thang moi.
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

// Validate du lieu va them 1 giao dich moi vao thang hien tai.
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

  // Khong cho chi vuot qua so tien con lai cua thang.
  if (amountNumber > currentRemainingMoney) {
    showHistoryMessage(
      `Giao dịch vượt quá số tiền chi tiêu còn lại (${formatHistoryCurrency(currentRemainingMoney)})`,
      false
    );
    historyAmountInputEl.focus();
    return;
  }

  // Moi giao dich luu id rieng de phuc vu xoa sau nay.
  transactions.push({
    id: `${Date.now()}`,
    amount: amountNumber,
    category: categoryValue,
    note: noteValue,
    month: selectedMonth,
  });

  // Sau khi them giao dich, tru so tien con lai cua thang.
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

// Bat click nut xoa trong bang va mo overlay xac nhan.
function handleHistoryTableClick(event) {
  const deleteButton = event.target.closest("[data-id]");
  if (!deleteButton) {
    return;
  }

  pendingTransactionDeleteId = deleteButton.dataset.id;
  deleteOverlayEl.style.display = "flex";
}

// Dong hop thoai xoa va xoa trang thai tam.
function closeDeleteOverlay() {
  pendingTransactionDeleteId = null;
  deleteOverlayEl.style.display = "none";
}

// Xoa giao dich da chon va cong tien tro lai cho thang do.
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

// Chuyen trang khi user bam cac nut pagination.
function handleHistoryPaginationClick(event) {
  const paginationButton = event.target.closest("[data-page]");

  if (!paginationButton || paginationButton.disabled) {
    return;
  }

  currentHistoryPage = Number(paginationButton.dataset.page || 1);
  renderHistoryTable();
}

// Khoi tao trang 1 lan: set thang, render du lieu, gan event.
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
    !sortAmountSelectEl ||
    !historySearchInputEl ||
    !historySearchBtn
  ) {
    return;
  }

  isHistoryInitialized = true;

  const savedMonth = localStorage.getItem(getHistorySelectedMonthKey()) || getDefaultHistoryMonth();
  historyMonthInputEl.value = savedMonth;
  sortAmountSelectEl.value = "default";

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
  sortAmountSelectEl.addEventListener("change", function () {
    currentHistoryPage = 1;
    renderHistoryTable();
  });
  historySearchInputEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchClick();
    }
  });
  deleteConfirmBtn.addEventListener("click", confirmDeleteTransaction);
  deleteCancelBtn.addEventListener("click", closeDeleteOverlay);
}

window.addEventListener("load", initializeHistoryPage);
