// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-extension') {
    // Toggle the extension state
    chrome.storage.sync.get(['noAiEnabled'], function(result) {
      const currentState = result.noAiEnabled !== false;
      const newState = !currentState;
      
      chrome.storage.sync.set({'noAiEnabled': newState}, function() {
        // Show notification if enabled
        chrome.storage.sync.get(['showNotifications'], function(notifResult) {
          if (notifResult.showNotifications !== false) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icon48.png',
              title: 'No AI Search',
              message: `Extension ${newState ? 'enabled' : 'disabled'}`
            });
          }
        });
        
        // Reload Google search tabs
        chrome.tabs.query({url: ["*://*.google.com/search*", "*://*.google.co.uk/search*"]}, function(tabs) {
          tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
          });
        });
      });
    });
  }
});

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Set default values
  chrome.storage.sync.set({
    noAiEnabled: true,
    detectionMode: 'enhanced',
    showNotifications: true
  });
  
  // Initialize daily stats
  const today = new Date().toDateString();
  chrome.storage.local.set({
    blockedToday: 0,
    searchesToday: 0,
    lastResetDate: today
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStats') {
    chrome.storage.local.get(['blockedToday', 'searchesToday'], function(result) {
      const newBlocked = (result.blockedToday || 0) + (request.blocked || 0);
      const newSearches = (result.searchesToday || 0) + (request.searches || 0);
      
      chrome.storage.local.set({
        blockedToday: newBlocked,
        searchesToday: newSearches
      });
    });
  }
});
