const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const transactionDate = document.getElementById('transaction-date');
const filterType = document.getElementById('filter-type');
const sortBy = document.getElementById('sort-by');
const expenseChart = document.getElementById('expense-chart');

// Set default date to today
transactionDate.valueAsDate = new Date();

// Get transactions from local storage
const localStorageTransactions = JSON.parse(
  localStorage.getItem('transactions')
);

let transactions =
  localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    showAlert('Please add a description and amount', 'error');
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value,
      category: categorySelect.value,
      date: transactionDate.value || new Date().toISOString().split('T')[0]
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    updateChart();

    // Show success message
    showAlert('Transaction added successfully!', 'success');

    // Reset form
    text.value = '';
    amount.value = '';
    categorySelect.value = 'food';
    transactionDate.valueAsDate = new Date();
  }
}

// Show alert message
function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.appendChild(document.createTextNode(message));
  
  const container = document.querySelector('.container');
  const form = document.querySelector('#form');
  
  container.insertBefore(alertDiv, form);
  
  // Remove alert after 3 seconds
  setTimeout(() => {
    alertDiv.remove();
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
  // Get sign
  const sign = transaction.amount < 0 ? '-' : '+';

  const item = document.createElement('li');

  // Add class based on value
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  
  // Add animation class
  item.classList.add('fade-in');

  // Get category icon
  const categoryIcon = getCategoryIcon(transaction.category);

  item.innerHTML = `
    <div class="transaction-details">
      <div class="transaction-info">
        <span class="category-icon">${categoryIcon}</span>
        <div>
          <p class="transaction-text">${transaction.text}</p>
          <small class="transaction-date">${formatDate(transaction.date)}</small>
          <small class="transaction-category">${transaction.category}</small>
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
  
  // Remove animation class after animation completes
  setTimeout(() => {
    item.classList.remove('fade-in');
  }, 500);
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

// Update the balance, income and expense
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

  // Fix: Display income correctly (was showing total)
  balance.innerText = `₹${total}`;
  money_plus.innerText = `+₹${income}`;
  money_minus.innerText = `-₹${expense}`;
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  
  updateLocalStorage();
  init();
  updateChart();
  
  // Show success message
  showAlert('Transaction removed!', 'success');
}

// Update local storage transactions
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Filter and sort transactions
function filterAndSortTransactions() {
  let filteredTransactions = [...transactions];
  
  // Filter by type
  if (filterType.value === 'income') {
    filteredTransactions = filteredTransactions.filter(t => t.amount > 0);
  } else if (filterType.value === 'expense') {
    filteredTransactions = filteredTransactions.filter(t => t.amount < 0);
  }
  
  // Sort transactions
  switch(sortBy.value) {
    case 'date-desc':
      filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-asc':
      filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'amount-desc':
      filteredTransactions.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      filteredTransactions.sort((a, b) => a.amount - b.amount);
      break;
  }
  
  return filteredTransactions;
}

// Create and update chart
function updateChart() {
  // Group transactions by category
  const categoryData = {};
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  
  expenseTransactions.forEach(transaction => {
    const category = transaction.category;
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += Math.abs(transaction.amount);
  });
  
  const categories = Object.keys(categoryData);
  const amounts = Object.values(categoryData);
  
  // Define colors for categories
  const backgroundColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#C9CBCF', '#7CFC00'
  ];
  
  // Create or update chart
  if (window.expenseChartInstance) {
    window.expenseChartInstance.destroy();
  }
  
  if (categories.length > 0) {
    window.expenseChartInstance = new Chart(expenseChart, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: backgroundColors.slice(0, categories.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Expense by Category'
        },
        legend: {
          position: 'right'
        }
      }
    });
  }
}

// Init app
function init() {
  list.innerHTML = '';
  
  const filteredTransactions = filterAndSortTransactions();
  filteredTransactions.forEach(addTransactionDOM);
  
  updateValues();
  updateChart();
}

// Event listeners
form.addEventListener('submit', addTransaction);
filterType.addEventListener('change', init);
sortBy.addEventListener('change', init);

// Initialize app
init();
