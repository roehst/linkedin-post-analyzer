// LinkedIn Post Analyzer - Popup Script

class PopupController {
  constructor() {
    this.currentTab = 'stats';
    this.users = [];
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupEventListeners();
    this.loadStats();
    this.loadSettings();
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    this.currentTab = tabName;

    // Load tab-specific data
    if (tabName === 'users') {
      this.loadUsers();
    }
  }

  setupEventListeners() {
    // Save API Key
    document.getElementById('save-api-key').addEventListener('click', () => {
      this.saveApiKey();
    });

    // AI Threshold slider
    const thresholdSlider = document.getElementById('ai-threshold');
    const thresholdValue = document.getElementById('threshold-value');
    
    thresholdSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      thresholdValue.textContent = `${value}%`;
      this.saveThreshold(value / 100);
    });

    // Clear data
    document.getElementById('clear-data').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        this.clearData();
      }
    });

    // User search
    document.getElementById('user-search').addEventListener('input', (e) => {
      this.filterUsers(e.target.value);
    });
  }

  async loadStats() {
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
      if (response.success) {
        const stats = response.stats;
        document.getElementById('total-posts').textContent = stats.totalPosts;
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('high-ai-posts').textContent = stats.highAIPosts;
        document.getElementById('medium-ai-posts').textContent = stats.mediumAIPosts;
        document.getElementById('low-ai-posts').textContent = stats.lowAIPosts;
        document.getElementById('filtered-users').textContent = stats.filteredUsers;
      }
    });
  }

  async loadUsers() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '<div class="loading">Loading users...</div>';

    chrome.runtime.sendMessage({ action: 'getUsers' }, (response) => {
      if (response.success) {
        this.users = response.users;
        this.renderUsers(this.users);
      }
    });
  }

  renderUsers(users) {
    const usersList = document.getElementById('users-list');
    
    if (users.length === 0) {
      usersList.innerHTML = '<div class="loading">No users tracked yet. Visit LinkedIn to start analyzing posts.</div>';
      return;
    }

    usersList.innerHTML = users.map(user => {
      const aiScorePercent = Math.round(user.avgAIScore * 100);
      let scoreClass = 'low';
      if (user.avgAIScore > 0.7) scoreClass = 'high';
      else if (user.avgAIScore > 0.4) scoreClass = 'medium';

      const filterBtnText = user.filtered ? '✓ Filtered' : 'Filter';
      const filterBtnClass = user.filtered ? 'active' : '';

      return `
        <div class="user-item" data-user-id="${user.userId}">
          <div class="user-info">
            <div class="user-name">${this.escapeHtml(user.userName)}</div>
            <div class="user-stats">
              ${user.postCount} posts
              <span class="ai-score ${scoreClass}">${aiScorePercent}% AI</span>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn-small btn-filter ${filterBtnClass}" data-user-id="${user.userId}">
              ${filterBtnText}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners to filter buttons
    document.querySelectorAll('.btn-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.userId;
        this.toggleUserFilter(userId);
      });
    });
  }

  filterUsers(searchTerm) {
    if (!searchTerm) {
      this.renderUsers(this.users);
      return;
    }

    const filtered = this.users.filter(user => 
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.renderUsers(filtered);
  }

  async toggleUserFilter(userId) {
    chrome.runtime.sendMessage({ 
      action: 'toggleUserFilter', 
      userId 
    }, (response) => {
      if (response.success) {
        // Reload users to update UI
        this.loadUsers();
        this.loadStats();
      }
    });
  }

  async loadSettings() {
    chrome.storage.local.get(['apiKey', 'aiThreshold'], (result) => {
      if (result.apiKey) {
        document.getElementById('api-key').value = result.apiKey;
      }
      
      const threshold = result.aiThreshold || 0.7;
      const thresholdPercent = Math.round(threshold * 100);
      document.getElementById('ai-threshold').value = thresholdPercent;
      document.getElementById('threshold-value').textContent = `${thresholdPercent}%`;
    });
  }

  async saveApiKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    const statusEl = document.getElementById('api-key-status');
    
    if (!apiKey) {
      statusEl.className = 'status-message error';
      statusEl.textContent = 'Please enter an API key';
      return;
    }

    chrome.runtime.sendMessage({ 
      action: 'setApiKey', 
      apiKey 
    }, (response) => {
      if (response.success) {
        statusEl.className = 'status-message success';
        statusEl.textContent = 'API key saved successfully!';
        
        setTimeout(() => {
          statusEl.style.display = 'none';
        }, 3000);
      } else {
        statusEl.className = 'status-message error';
        statusEl.textContent = 'Failed to save API key';
      }
    });
  }

  async saveThreshold(threshold) {
    chrome.storage.local.set({ aiThreshold: threshold });
  }

  async clearData() {
    chrome.runtime.sendMessage({ action: 'clearData' }, (response) => {
      if (response.success) {
        this.loadStats();
        this.loadUsers();
        alert('All data has been cleared!');
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the popup
const popup = new PopupController();
