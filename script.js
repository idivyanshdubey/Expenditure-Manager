// DOM Elements
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('transaction-date');
const notesInput = document.getElementById('transaction-notes');
const searchInput = document.getElementById('search-transactions');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const sortBy = document.getElementById('sort-by');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const notificationContainer = document.getElementById('notification-container');

// Set default date to today
dateInput.valueAsDate = new Date();

// Pagination settings
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let filteredTransactions = [];

// Get transactions from localStorage
const localStorageTransactions = JSON.parse(
  localStorage.getItem('transactions')
);

let transactions =
  localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    showNotification('Please add a description and amount', 'error');
    return;
  }

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
    category: categorySelect.value,
    date: dateInput.value,
    notes: notesInput.value || ''
  };

  transactions.push(transaction);

  updateLocalStorage();
  init();

  // Show success notification
  showNotification('Transaction added successfully!', 'success');

  // Reset form
  text.value = '';
  amount.value = '';
  categorySelect.value = 'food';
  dateInput.valueAsDate = new Date();
  notesInput.value = '';
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerText = message;

  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Format date to display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';

  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  item.innerHTML = `
    <div class="transaction-details">
      <div class="transaction-info">
        <span class="category-icon">${getCategoryIcon(transaction.category)}</span>
        <div>
          <p class="transaction-text">${transaction.text}</p>
          <small class="transaction-date">${formatDate(transaction.date)}</small>
          <small class="transaction-category">${transaction.category}</small>
          <small class="transaction-notes">${transaction.notes}</small>
        </div>
      </div>
      <div class="transaction-amount">
        <span>${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  list.appendChild(item);
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    food: '<i class="fas fa-utensils"></i>',
    shopping: '<i class="fas fa-shopping-cart"></i>',
    entertainment: '<i class="fas fa-film"></i>',
    bills: '<i class="fas fa-file-invoice"></i>',
    transportation: '<i class="fas fa-car"></i>',
    health: '<i class="fas fa-heartbeat"></i>',
    salary: '<i class="fas fa-money-check-alt"></i>',
    other: '<i class="fas fa-question-circle"></i>'
  };

  return icons[category] || icons.other;
}

// Update the balance, income, and expense
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  const expense = (
    amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `+₹${income}`;
  money_minus.innerText = `-₹${expense}`;
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);

  updateLocalStorage();
  init();

  showNotification('Transaction removed!', 'success');
}

// Update localStorage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Filter and sort transactions
function filterAndSortTransactions() {
  let filtered = [...transactions];

  if (filterType.value === 'income') {
    filtered = filtered.filter(t => t.amount > 0);
  } else if (filterType.value === 'expense') {
    filtered = filtered.filter(t => t.amount < 0);
  }

  if (filterCategory.value !== 'all') {
    filtered = filtered.filter(t => t.category === filterCategory.value);
  }

  switch (sortBy.value) {
    case 'date-desc':
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-asc':
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'amount-desc':
      filtered.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      filtered.sort((a, b) => a.amount - b.amount);
      break;
  }

  return filtered;
}

// Paginate transactions
function paginateTransactions(transactions) {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return transactions.slice(start, end);
}

// Update pagination controls
function updatePaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  totalPagesSpan.innerText = totalPages;
  currentPageSpan.innerText = currentPage;

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// Handle pagination
function handlePagination(direction) {
  currentPage += direction;
  init();
}

// Init app
function init() {
  list.innerHTML = '';

  filteredTransactions = filterAndSortTransactions();
  const paginatedTransactions = paginateTransactions(filteredTransactions);

  paginatedTransactions.forEach(addTransactionDOM);

  updateValues();
  updatePaginationControls(filteredTransactions.length);
}

// Event listeners
form.addEventListener('submit', addTransaction);
filterType.addEventListener('change', init);
filterCategory.addEventListener('change', init);
sortBy.addEventListener('change', init);
prevPageBtn.addEventListener('click', () => handlePagination(-1));
nextPageBtn.addEventListener('click', () => handlePagination(1));

// Initialize app
init();