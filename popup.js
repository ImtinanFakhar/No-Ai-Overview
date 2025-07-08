document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const status = document.getElementById('status');
  const blockedCount = document.getElementById('blockedCount');
  const searchCount = document.getElementById('searchCount');
  const aggressiveMode = document.getElementById('aggressiveMode');
  const showNotifications = document.getElementById('showNotifications');
  
  // Load current state and settings
  chrome.storage.sync.get(['noAiEnabled', 'detectionMode', 'showNotifications'], function(result) {
    const isEnabled = result.noAiEnabled !== false; // Default to true
    const isAggressive = result.detectionMode === 'aggressive';
    const notifications = result.showNotifications !== false; // Default to true
    
    updateUI(isEnabled);
    aggressiveMode.checked = isAggressive;
    showNotifications.checked = notifications;
  });
  
  // Load statistics
  chrome.storage.local.get(['blockedToday', 'searchesToday', 'lastResetDate'], function(result) {
    const today = new Date().toDateString();
    
    // Reset daily stats if it's a new day
    if (result.lastResetDate !== today) {
      chrome.storage.local.set({
        blockedToday: 0,
        searchesToday: 0,
        lastResetDate: today
      });
      blockedCount.textContent = '0';
      searchCount.textContent = '0';
    } else {
      blockedCount.textContent = result.blockedToday || 0;
      searchCount.textContent = result.searchesToday || 0;
    }
  });
  
  // Handle toggle click
  toggleSwitch.addEventListener('click', function() {
    chrome.storage.sync.get(['noAiEnabled'], function(result) {
      const currentState = result.noAiEnabled !== false;
      const newState = !currentState;
      
      chrome.storage.sync.set({'noAiEnabled': newState}, function() {
        updateUI(newState);
        reloadGoogleTabs();
      });
    });
  });
  
  // Handle aggressive mode toggle
  aggressiveMode.addEventListener('change', function() {
    const detectionMode = this.checked ? 'aggressive' : 'enhanced';
    chrome.storage.sync.set({'detectionMode': detectionMode}, function() {
      reloadGoogleTabs();
    });
  });
  
  // Handle notifications toggle
  showNotifications.addEventListener('change', function() {
    chrome.storage.sync.set({'showNotifications': this.checked});
  });
  
  // Keyboard shortcut listener
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-extension') {
      toggleSwitch.click();
    }
  });
  
  // Open Options page from popup
  document.getElementById('openOptionsBtn').addEventListener('click', function() {
    if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  });
  
  function reloadGoogleTabs() {
    // Reload all Google search tabs
    chrome.tabs.query({url: ["*://*.google.com/search*", "*://*.google.co.uk/search*", "*://*.google.ca/search*", "*://*.google.de/search*", "*://*.google.fr/search*"]}, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.reload(tab.id);
      });
    });
  }
  
  function updateUI(isEnabled) {
    if (isEnabled) {
      toggleSwitch.classList.add('active');
      status.textContent = 'Extension is enabled';
      status.className = 'status enabled';
    } else {
      toggleSwitch.classList.remove('active');
      status.textContent = 'Extension is disabled';
      status.className = 'status disabled';
    }
  }
});
