// Options page script
document.addEventListener('DOMContentLoaded', function() {
  const blockGoogleAI = document.getElementById('blockGoogleAI');
  const basicMode = document.getElementById('basicMode');
  const enhancedMode = document.getElementById('enhancedMode');
  const aggressiveMode = document.getElementById('aggressiveMode');
  const showNotifications = document.getElementById('showNotifications');
  const showBlockedCount = document.getElementById('showBlockedCount');
  const customKeywords = document.getElementById('customKeywords');
  const saveButton = document.getElementById('saveOptions');
  const resetStatsButton = document.getElementById('resetStats');
  const resetAllButton = document.getElementById('resetAllBtn');
  
  // Load current settings
  chrome.storage.sync.get([
    'detectionMode', 'blockGoogleAI',
    'showNotifications', 'showBlockedCount', 'customKeywords', 'aggressiveMode'
  ], function(result) {
    const mode = result.detectionMode || 'enhanced';
    document.querySelector(`input[value="${mode}"]`).checked = true;
    blockGoogleAI.checked = result.blockGoogleAI !== false; // Default to true
    showNotifications.checked = result.showNotifications !== false;
    showBlockedCount.checked = result.showBlockedCount || false;
    customKeywords.value = result.customKeywords || '';
    aggressiveMode.checked = result.aggressiveMode === true;
  });
  
  // Load statistics
  loadStatistics();
  
  // Save settings
  saveButton.addEventListener('click', function() {
    const detectionMode = document.querySelector('input[name="detectionMode"]:checked').value;
    
    const settings = {
      detectionMode: detectionMode,
      blockGoogleAI: blockGoogleAI.checked,
      showNotifications: showNotifications.checked,
      showBlockedCount: showBlockedCount.checked,
      customKeywords: customKeywords.value,
      aggressiveMode: aggressiveMode.checked
    };
    
    chrome.storage.sync.set(settings, function() {
      // Show confirmation
      const originalText = saveButton.textContent;
      saveButton.textContent = 'Saved!';
      saveButton.style.background = '#28a745';
      
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = '#1a73e8';
      }, 2000);
      
      // Reload Google tabs to apply new settings
      chrome.tabs.query({url: ["*://*.google.com/search*"]}, function(tabs) {
        tabs.forEach(tab => {
          chrome.tabs.reload(tab.id);
        });
      });
    });
  });
  
  // Reset statistics
  resetStatsButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all statistics?')) {
      chrome.storage.local.set({
        totalBlocked: 0,
        totalSearches: 0,
        blockedToday: 0,
        searchesToday: 0,
        lastResetDate: new Date().toDateString()
      }, function() {
        loadStatistics();
        resetStatsButton.textContent = 'Reset!';
        setTimeout(() => {
          resetStatsButton.textContent = 'Reset Statistics';
        }, 2000);
      });
    }
  });
  
  // Reset all settings and statistics
  resetAllButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all settings and statistics?')) {
      chrome.storage.sync.clear(function() {
        chrome.storage.local.clear(function() {
          location.reload();
        });
      });
    }
  });
  
  function loadStatistics() {
    chrome.storage.local.get([
      'totalBlocked', 'totalSearches', 'blockedToday'
    ], function(result) {
      document.getElementById('totalBlocked').textContent = result.totalBlocked || 0;
      document.getElementById('totalSearches').textContent = result.totalSearches || 0;
      document.getElementById('blockedToday').textContent = result.blockedToday || 0;
    });
  }
});
