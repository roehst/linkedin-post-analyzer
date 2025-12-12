// LinkedIn Post Analyzer - Content Script
// This script runs on LinkedIn pages and extracts posts from the feed

class LinkedInPostAnalyzer {
  constructor() {
    this.posts = new Map();
    this.observers = [];
    this.init();
  }

  init() {
    console.log('LinkedIn Post Analyzer initialized');
    this.setupObserver();
    this.scanExistingPosts();
  }

  // Set up mutation observer to detect new posts
  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      this.scanExistingPosts();
    });

    // Wait for feed to load
    const checkFeed = setInterval(() => {
      const feed = document.querySelector('.scaffold-finite-scroll__content, [role="main"]');
      if (feed) {
        observer.observe(feed, {
          childList: true,
          subtree: true
        });
        this.observers.push(observer);
        clearInterval(checkFeed);
      }
    }, 1000);
  }

  // Extract post data from a post element
  extractPostData(postElement) {
    try {
      // Find the post content
      const contentElement = postElement.querySelector('.feed-shared-update-v2__description, .feed-shared-inline-show-more-text');
      const content = contentElement ? contentElement.innerText.trim() : '';

      // Find the author info
      const authorElement = postElement.querySelector('.update-components-actor__name, .feed-shared-actor__name');
      const authorName = authorElement ? authorElement.innerText.trim() : 'Unknown';

      // Find author link to get profile URL
      const authorLink = postElement.querySelector('a.app-aware-link[href*="/in/"]');
      const authorUrl = authorLink ? authorLink.href : '';
      
      // Extract user ID from URL
      const userIdMatch = authorUrl.match(/\/in\/([^/]+)/);
      const userId = userIdMatch ? userIdMatch[1] : '';

      // Find timestamp
      const timeElement = postElement.querySelector('time, .update-components-actor__sub-description');
      const timestamp = timeElement ? timeElement.getAttribute('datetime') || timeElement.innerText : new Date().toISOString();

      // Generate unique post ID
      const postId = this.generatePostId(userId, content, timestamp);

      return {
        id: postId,
        userId,
        userName: authorName,
        userUrl: authorUrl,
        content,
        timestamp,
        element: postElement,
        analyzed: false,
        aiScore: null
      };
    } catch (error) {
      console.error('Error extracting post data:', error);
      return null;
    }
  }

  // Generate a unique post ID
  generatePostId(userId, content, timestamp) {
    const str = `${userId}-${content.substring(0, 50)}-${timestamp}`;
    return btoa(str).substring(0, 32);
  }

  // Scan the feed for posts
  scanExistingPosts() {
    // Multiple selectors to catch different LinkedIn feed layouts
    const postSelectors = [
      '.feed-shared-update-v2',
      '[data-id^="urn:li:activity"]',
      '.feed-shared-update-v2__description-wrapper'
    ];

    let postElements = [];
    for (const selector of postSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        postElements = Array.from(elements);
        break;
      }
    }

    postElements.forEach(postElement => {
      const postData = this.extractPostData(postElement);
      if (postData && postData.content && !this.posts.has(postData.id)) {
        this.posts.set(postData.id, postData);
        this.processPost(postData);
      }
    });
  }

  // Process a post - analyze and store
  async processPost(postData) {
    // Add visual indicator
    this.addPostIndicator(postData.element, 'pending');

    // Send to background script for AI analysis
    chrome.runtime.sendMessage({
      action: 'analyzePost',
      post: {
        id: postData.id,
        userId: postData.userId,
        userName: postData.userName,
        userUrl: postData.userUrl,
        content: postData.content,
        timestamp: postData.timestamp
      }
    }, (response) => {
      if (response && response.success) {
        postData.analyzed = true;
        postData.aiScore = response.aiScore;
        this.updatePostIndicator(postData.element, response.aiScore);
        
        // Check if user should be filtered
        this.checkAndApplyFilter(postData);
      }
    });
  }

  // Add visual indicator to post
  addPostIndicator(element, status) {
    if (!element || element.querySelector('.ai-analyzer-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'ai-analyzer-indicator';
    indicator.setAttribute('data-status', status);
    
    if (status === 'pending') {
      indicator.innerHTML = '<span class="ai-indicator-dot pending"></span> Analyzing...';
    }

    // Insert indicator near the post header
    const header = element.querySelector('.feed-shared-actor, .update-components-actor');
    if (header) {
      header.appendChild(indicator);
    }
  }

  // Update post indicator with AI score
  updatePostIndicator(element, aiScore) {
    const indicator = element.querySelector('.ai-analyzer-indicator');
    if (!indicator) return;

    const scorePercent = Math.round(aiScore * 100);
    let statusClass = 'low';
    let emoji = '✅';
    
    if (aiScore > 0.7) {
      statusClass = 'high';
      emoji = '🤖';
    } else if (aiScore > 0.4) {
      statusClass = 'medium';
      emoji = '⚠️';
    }

    indicator.setAttribute('data-status', statusClass);
    indicator.innerHTML = `<span class="ai-indicator-dot ${statusClass}"></span> ${emoji} AI: ${scorePercent}%`;
  }

  // Check if user should be filtered and apply
  async checkAndApplyFilter(postData) {
    chrome.storage.local.get(['filteredUsers', 'aiThreshold'], (result) => {
      const filteredUsers = result.filteredUsers || {};
      const threshold = result.aiThreshold || 0.7;

      if (postData.aiScore > threshold && filteredUsers[postData.userId]) {
        this.filterPost(postData.element);
      }
    });
  }

  // Hide/filter a post
  filterPost(element) {
    if (!element) return;
    element.style.opacity = '0.3';
    element.style.filter = 'blur(5px)';
    element.style.pointerEvents = 'none';
    
    const overlay = document.createElement('div');
    overlay.className = 'ai-analyzer-filter-overlay';
    overlay.innerHTML = `
      <div class="filter-message">
        🚫 Post filtered (High AI content)
        <button class="show-anyway">Show anyway</button>
      </div>
    `;
    
    overlay.querySelector('.show-anyway').addEventListener('click', (e) => {
      e.stopPropagation();
      element.style.opacity = '1';
      element.style.filter = 'none';
      element.style.pointerEvents = 'auto';
      overlay.remove();
    });

    element.style.position = 'relative';
    element.appendChild(overlay);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refreshFilters') {
    // Reapply filters
    window.location.reload();
  }
});

// Initialize the analyzer
const analyzer = new LinkedInPostAnalyzer();
