const categoryMonthInputEl = document.getElementById("category-month-input");
const categoryNameInputEl = document.getElementById("category-name-input");
const categoryLimitInputEl = document.getElementById("category-limit-input");
const addCategoryBtn = document.getElementById("add-category-btn");
const categoryMessageEl = document.getElementById("category-message");
const categoryListEl = document.getElementById("category-list");
const moneyLeftValueEl = document.querySelector(".money-left-value");
const deleteOverlayEl = document.getElementById("delete-overlay");
const deleteConfirmBtn = document.getElementById("delete-confirm-btn");
const deleteCancelBtn = document.getElementById("delete-cancel-btn");
const editOverlayEl = document.getElementById("edit-overlay");
const editCategoryNameEl = document.getElementById("edit-category-name");
const editCategoryLimitEl = document.getElementById("edit-category-limit");
const editSaveBtn = document.getElementById("edit-save-btn");
const editCancelBtn = document.getElementById("edit-cancel-btn");
const editCloseBtn = document.getElementById("edit-close-btn");
const editMessageEl = document.getElementById("edit-message");

let isCategoryPageInitialized = false;
let pendingCategoryDeleteId = null;
let editingCategoryId = null;

function getCurrentUserForCategory() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function getCategoryUserKey() {
  const currentUser = getCurrentUserForCategory();
  return currentUser?.email || currentUser?.id || currentUser?.username || "guest";
}

function getCategoryStorageKey() {
  return `categories_${getCategoryUserKey()}`;
}

function getTransactionStorageKey() {
  return `transactions_${getCategoryUserKey()}`;
}

function getBudgetStorageKeyForCategory() {
  return `monthlyBudgets_${getCategoryUserKey()}`;
}

function getRemainingMoneyStorageKeyForCategory() {
  return `remainingMoney_${getCategoryUserKey()}`;
}

function getSelectedMonthStorageKeyForCategory() {
  return `selectedMonth_${getCategoryUserKey()}`;
}

function getDefaultMonthForCategory() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatCurrencyVND(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} VND`;
}

function getStoredCategories() {
  return JSON.parse(localStorage.getItem(getCategoryStorageKey())) || {};
}

function saveStoredCategories(categoriesByMonth) {
  localStorage.setItem(getCategoryStorageKey(), JSON.stringify(categoriesByMonth));
}

function getCategoriesByMonth(month) {

  const categoriesByMonth = getStoredCategories();
  return categoriesByMonth[month] || [];
}

function getStoredTransactions() {
  return JSON.parse(localStorage.getItem(getTransactionStorageKey())) || {};
}

function getTransactionsByMonth(month) {
  const storedTransactions = getStoredTransactions();

  if (Array.isArray(storedTransactions)) {
    return storedTransactions.filter(function (transaction) {
      return transaction?.month === month;
    });
  }

  if (Array.isArray(storedTransactions[month])) {
    return storedTransactions[month];
  }

  return [];
}

function saveStoredTransactions(transactionsByMonth) {
  localStorage.setItem(getTransactionStorageKey(), JSON.stringify(transactionsByMonth));
}

function getMonthlyBudgetsForCategory() {
  return JSON.parse(localStorage.getItem(getBudgetStorageKeyForCategory())) || {};
}

function getRemainingMoneyForCategory() {
  return JSON.parse(localStorage.getItem(getRemainingMoneyStorageKeyForCategory())) || {};
}

function showCategoryMessage(message, isSuccess) {
  categoryMessageEl.textContent = message;
  categoryMessageEl.classList.toggle("success", Boolean(isSuccess));

  if (isSuccess) {
    categoryLimitInputEl.classList.remove("input-error");
  }
}

function clearCategoryMessage() {
  showCategoryMessage("", false);
  categoryLimitInputEl.classList.remove("input-error");
}

function showEditMessage(message, isSuccess) {
  editMessageEl.textContent = message;
  editMessageEl.classList.toggle("success", Boolean(isSuccess));
}

function clearEditMessage() {
  showEditMessage("", false);
}

function resetCategoryForm() {
  editingCategoryId = null;
  categoryNameInputEl.value = "";
  categoryLimitInputEl.value = "";
  addCategoryBtn.textContent = "Thêm danh mục";
}

function saveSelectedMonthForCategory(month) {
  localStorage.setItem(getSelectedMonthStorageKeyForCategory(), month);
}

function resetEditForm() {
  editingCategoryId = null;
  editCategoryNameEl.value = "";
  editCategoryLimitEl.value = "";
  clearEditMessage();
}

function setSelectValueByNormalizedText(selectEl, value) {
  const normalizedValue = (value || "").trim().toLowerCase();
  const matchingOption = Array.from(selectEl.options).find(function (option) {
    return option.value.trim().toLowerCase() === normalizedValue;
  });

  selectEl.value = matchingOption ? matchingOption.value : "";
}

function openEditOverlay(category) {
  editingCategoryId = category.id;
  addCategoryBtn.textContent = "Thêm danh mục";
  setSelectValueByNormalizedText(editCategoryNameEl, category.name);
  editCategoryLimitEl.value = category.limit || "";
  clearEditMessage();
  editOverlayEl.style.display = "flex";
}

function closeEditOverlay() {
  editOverlayEl.style.display = "none";
  resetEditForm();
}

function getSpentAmountByCategory(month, categoryName) {
  const transactions = getTransactionsByMonth(month);

  return transactions.reduce(function (total, transaction) {
    const sameCategory = (transaction?.category || "").trim().toLowerCase() === categoryName.trim().toLowerCase();
    if (!sameCategory) {
      return total;
    }

    return total + Number(transaction?.amount || 0);
  }, 0);
}

function renameCategoryInTransactions(month, oldCategoryName, newCategoryName) {
  if (!oldCategoryName || oldCategoryName === newCategoryName) {
    return;
  }

  const transactionsByMonth = getStoredTransactions();
  const transactions = transactionsByMonth[month];

  if (!Array.isArray(transactions) || !transactions.length) {
    return;
  }

  transactionsByMonth[month] = transactions.map(function (transaction) {
    const currentCategoryName = (transaction?.category || "").trim().toLowerCase();
    const previousCategoryName = oldCategoryName.trim().toLowerCase();

    if (currentCategoryName !== previousCategoryName) {
      return transaction;
    }

    return {
      ...transaction,
      category: newCategoryName,
    };
  });

  saveStoredTransactions(transactionsByMonth);
}

function updateMoneyLeft(month) {
  if (!moneyLeftValueEl) {
    return;
  }

  const remainingMoneyByMonth = getRemainingMoneyForCategory();
  const monthlyBudgets = getMonthlyBudgetsForCategory();
  const budget = Number(monthlyBudgets[month] || 0);
  const remainingMoney =
    remainingMoneyByMonth[month] !== undefined
      ? Number(remainingMoneyByMonth[month] || 0)
      : budget - getTransactionsByMonth(month).reduce(function (sum, transaction) {
          return sum + Number(transaction?.amount || 0);
        }, 0);

  moneyLeftValueEl.textContent = formatCurrencyVND(remainingMoney);
}

function createCategoryCard(category, month) {
  const spentAmount = getSpentAmountByCategory(month, category.name);
  const limitText = Number(category.limit || 0) > 0
    ? `Giới hạn: ${formatCurrencyVND(category.limit)}`
    : "Chưa đặt giới hạn";

  return `
    <div class="card">
      <div class="icon">$</div>
      <div class="content">
        <p class="title">${category.name}</p>
        <p class="price">Đã chi: ${formatCurrencyVND(spentAmount)}</p>
        <p class="limit">${limitText}</p>
      </div>
      <div class="actions">
        <button class="action-btn" data-action="delete" data-id="${category.id}" title="Xóa danh mục">✕</button>
      </div>
    </div>
  `;
}

function renderCategoryList() {
  const selectedMonth = categoryMonthInputEl.value || getDefaultMonthForCategory();
  const categories = getCategoriesByMonth(selectedMonth);

  if (!categories.length) {
    categoryListEl.innerHTML = `
      <div class="empty-state">
        Chưa có danh mục nào trong tháng này.
      </div>
    `;
    updateMoneyLeft(selectedMonth);
    return;
  }

  categoryListEl.innerHTML = categories
    .map(function (category) {
      return createCategoryCard(category, selectedMonth);
    })
    .join("");

  categoryListEl.querySelectorAll(".actions").forEach(function (actionsEl, index) {
    if (actionsEl.querySelector("[data-action='edit']")) {
      return;
    }

    const editButton = document.createElement("button");
    editButton.className = "action-btn";
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.dataset.id = categories[index].id;
    editButton.title = "Sửa danh mục";
    editButton.textContent = "✎";
    actionsEl.appendChild(editButton);
  });

  updateMoneyLeft(selectedMonth);
}

function handleMonthChangeForCategory() {
  const selectedMonthValue = categoryMonthInputEl.value || getDefaultMonthForCategory();
  categoryMonthInputEl.value = selectedMonthValue;
  saveSelectedMonthForCategory(selectedMonthValue);
  resetCategoryForm();
  closeEditOverlay();
  clearCategoryMessage();
  renderCategoryList();
  return;

  const selectedMonth = categoryMonthInputEl.value || getDefaultMonthForCategory();
  categoryMonthInputEl.value = selectedMonth;
  saveSelectedMonthForCategory(selectedMonth);
  resetCategoryForm();
  clearCategoryMessage();
  if (editingCategoryId) {
    showCategoryMessage("Đã cập nhật danh mục thành công", true);
  } else {
    showCategoryMessage("Đã thêm danh mục thành công", true);
  }
  resetCategoryForm();
  renderCategoryList();
}

function handleAddCategory() {
  const selectedMonth = categoryMonthInputEl.value;
  const categoryName = categoryNameInputEl.value.trim();
  const categoryLimit = categoryLimitInputEl.value.trim();
  const isEditing = Boolean(editingCategoryId);

  if (!selectedMonth) {
    showCategoryMessage("Vui lòng chọn tháng trước khi thêm danh mục", false);
    categoryMonthInputEl.focus();
    return;
  }

  if (!categoryName) {
    showCategoryMessage("Vui lòng nhập tên danh mục", false);
    categoryNameInputEl.focus();
    return;
  }

  if (!categoryLimit) {
    showCategoryMessage("Vui lòng nhập số tiền", false);
    categoryLimitInputEl.classList.add("input-error");
    categoryLimitInputEl.focus();
    return;
  }

  const categoriesByMonth = getStoredCategories();
  const categories = categoriesByMonth[selectedMonth] || [];
  const isDuplicate = categories.some(function (category) {
    const sameName = category.name.trim().toLowerCase() === categoryName.toLowerCase();
    const isDifferentCategory = category.id !== editingCategoryId;
    return sameName && isDifferentCategory;
  });

  if (isDuplicate) {
    showCategoryMessage("Danh mục này đã tồn tại trong tháng đã chọn", false);
    categoryNameInputEl.focus();
    return;
  }

  if (categoryLimit && (Number.isNaN(Number(categoryLimit)) || Number(categoryLimit) < 0)) {
    showCategoryMessage("Giới hạn phải là số từ 0 trở lên", false);
    categoryLimitInputEl.focus();
    return;
  }

  if (editingCategoryId) {
    categoriesByMonth[selectedMonth] = categories.map(function (category) {
      if (category.id !== editingCategoryId) {
        return category;
      }

      return {
        ...category,
        name: categoryName,
        limit: Number(categoryLimit || 0),
      };
    });
  } else {
    categories.push({
      id: `${Date.now()}`,
      name: categoryName,
      limit: Number(categoryLimit || 0),
    });

    categoriesByMonth[selectedMonth] = categories;
  }
  saveStoredCategories(categoriesByMonth);
  saveSelectedMonthForCategory(selectedMonth);
  resetCategoryForm();

  if (isEditing) {
    showCategoryMessage("Đã cập nhật danh mục thành công", true);
    renderCategoryList();
    return;
  }

  showCategoryMessage("Đã thêm danh mục thành công", true);
  renderCategoryList();
}

function handleCategoryListClick(event) {
  const editButton = event.target.closest("[data-action='edit']");
  if (editButton) {
    const selectedMonth = categoryMonthInputEl.value || getDefaultMonthForCategory();
    const categories = getCategoriesByMonth(selectedMonth);
    const categoryToEdit = categories.find(function (category) {
      return category.id === editButton.dataset.id;
    });

    if (!categoryToEdit) {
      return;
    }

    openEditOverlay(categoryToEdit);
    addCategoryBtn.textContent = "Lưu chỉnh sửa";
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete']");
  if (!deleteButton) {
    return;
  }

  pendingCategoryDeleteId = deleteButton.dataset.id;
  deleteOverlayEl.style.display = "flex";
}

function closeDeleteOverlay() {
  pendingCategoryDeleteId = null;
  deleteOverlayEl.style.display = "none";
}

function handleEditSave() {
  const selectedMonth = categoryMonthInputEl.value || getDefaultMonthForCategory();
  const categoryName = editCategoryNameEl.value.trim();
  const categoryLimit = editCategoryLimitEl.value.trim();

  if (!editingCategoryId) {
    return;
  }

  if (!categoryName) {
    showEditMessage("Vui lòng chọn tên danh mục", false);
    editCategoryNameEl.focus();
    return;
  }

  if (categoryLimit && (Number.isNaN(Number(categoryLimit)) || Number(categoryLimit) < 0)) {
    showEditMessage("Giới hạn tiền phải từ 0 trở lên", false);
    editCategoryLimitEl.focus();
    return;
  }

  const categoriesByMonth = getStoredCategories();
  const categories = categoriesByMonth[selectedMonth] || [];
  const currentCategory = categories.find(function (category) {
    return category.id === editingCategoryId;
  });

  if (!currentCategory) {
    closeEditOverlay();
    return;
  }

  const previousCategoryName = currentCategory.name;
  const isDuplicate = categories.some(function (category) {
    const sameName = category.name.trim().toLowerCase() === categoryName.toLowerCase();
    const isDifferentCategory = category.id !== editingCategoryId;
    return sameName && isDifferentCategory;
  });

  if (isDuplicate) {
    showEditMessage("Danh mục này đã tồn tại trong tháng đã chọn", false);
    editCategoryNameEl.focus();
    return;
  }

  categoriesByMonth[selectedMonth] = categories.map(function (category) {
    if (category.id !== editingCategoryId) {
      return category;
    }

    return {
      ...category,
      name: categoryName,
      limit: Number(categoryLimit || 0),
    };
  });

  saveStoredCategories(categoriesByMonth);
  renameCategoryInTransactions(selectedMonth, previousCategoryName, categoryName);
  closeEditOverlay();
  showCategoryMessage("Đã cập nhật danh mục thành công", true);
  renderCategoryList();
}

function confirmDeleteCategory() {
  if (!pendingCategoryDeleteId) {
    return;
  }

  const selectedMonth = categoryMonthInputEl.value || getDefaultMonthForCategory();
  const categoriesByMonth = getStoredCategories();
  const categories = categoriesByMonth[selectedMonth] || [];

  categoriesByMonth[selectedMonth] = categories.filter(function (category) {
    return category.id !== pendingCategoryDeleteId;
  });

  saveStoredCategories(categoriesByMonth);
  closeDeleteOverlay();
  showCategoryMessage("Đã xóa danh mục", true);
  renderCategoryList();
}

function initializeCategoryPage() {
  if (
    isCategoryPageInitialized ||
    !categoryMonthInputEl ||
    !categoryNameInputEl ||
    !categoryLimitInputEl ||
    !addCategoryBtn ||
    !categoryMessageEl ||
    !categoryListEl
  ) {
    return;
  }

  isCategoryPageInitialized = true;

  const savedMonth =
    localStorage.getItem(getSelectedMonthStorageKeyForCategory()) || getDefaultMonthForCategory();

  categoryMonthInputEl.value = savedMonth;
  renderCategoryList();

  categoryMonthInputEl.addEventListener("change", handleMonthChangeForCategory);
  categoryNameInputEl.addEventListener("change", clearCategoryMessage);
  categoryLimitInputEl.addEventListener("input", clearCategoryMessage);
  addCategoryBtn.addEventListener("click", handleAddCategory);
  categoryListEl.addEventListener("click", handleCategoryListClick);
  deleteConfirmBtn.addEventListener("click", confirmDeleteCategory);
  deleteCancelBtn.addEventListener("click", closeDeleteOverlay);
  editSaveBtn.addEventListener("click", handleEditSave);
  editCancelBtn.addEventListener("click", closeEditOverlay);
  editCloseBtn.addEventListener("click", closeEditOverlay);
  editCategoryNameEl.addEventListener("change", clearEditMessage);
  editCategoryLimitEl.addEventListener("input", clearEditMessage);
}

window.addEventListener("load", initializeCategoryPage);
