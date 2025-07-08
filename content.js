(function () {
  const baseAiKeywords = [
    'artificial intelligence', 'ai generated', 'ai-generated',
    'chatgpt', 'openai', 'bard', 'claude', 'gemini'
  ];
  const aggressiveAiKeywords = [
    'ai tool', 'ai tools', 'ai platform', 'ai software',
    'machine learning model', 'language model',
    'ai assistant', 'ai chatbot', 'ai writer',
    'generative ai', 'ai content', 'ai-powered',
    'neural network', 'deep learning', 'llm',
    'gpt-', 'transformer model', 'midjourney', 'stability ai', 'huggingface', 'replicate', 'anthropic'
  ];
  const aiDomains = [
    'openai.com', 'chat.openai.com', 'bard.google.com', 'claude.ai', 'huggingface.co', 'replicate.com',
    'midjourney.com', 'stability.ai', 'anthropic.com',
    'tensorflow.org', 'pytorch.org', 'keras.io', 'scikit-learn.org', 'kaggle.com'
  ];

  let observer = null;

  // Onboarding tooltip for first-time users
  function showOnboardingTooltip() {
    if (document.getElementById('noai-onboarding-tooltip')) return;
    const tooltip = document.createElement('div');
    tooltip.id = 'noai-onboarding-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.top = '20px';
    tooltip.style.right = '20px';
    tooltip.style.zIndex = '2147483647';
    tooltip.style.background = '#fff';
    tooltip.style.border = '1px solid #dadce0';
    tooltip.style.borderRadius = '10px';
    tooltip.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
    tooltip.style.padding = '20px 28px 16px 20px';
    tooltip.style.maxWidth = '320px';
    tooltip.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    tooltip.style.fontSize = '15px';
    tooltip.style.color = '#222';
    tooltip.style.display = 'flex';
    tooltip.style.flexDirection = 'column';
    tooltip.style.alignItems = 'flex-start';
    tooltip.innerHTML = `
      <div style="font-weight:600;font-size:17px;margin-bottom:6px;color:#1a73e8;">Welcome to No AI Search!</div>
      <div style="margin-bottom:12px;line-height:1.5;">
        This extension automatically blocks Google's AI Overview and AI panels.<br>
        <b>For most searches:</b> It adds <code>-ai</code> to your query.<br>
        <b>For AI-related searches:</b> It only hides Google's AI Overview.<br>
        You can toggle or customize the extension from the popup or the extension options page.
      </div>
      <button id="noai-onboarding-close" style="margin-top:4px;padding:6px 16px;background:#1a73e8;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;">Got it!</button>
    `;
    document.body.appendChild(tooltip);
    document.getElementById('noai-onboarding-close').onclick = function() {
      tooltip.remove();
      chrome.storage.local.set({noaiOnboardingShown: true});
    };
  }

  function injectOnboardingIfNeeded() {
    chrome.storage.local.get(['noaiOnboardingShown'], function(data) {
      if (!data.noaiOnboardingShown) {
        showOnboardingTooltip();
      }
    });
  }

  function onReadyOrLoaded(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  chrome.storage.sync.get(['noAiEnabled', 'blockGoogleAI', 'aggressiveMode', 'customKeywords'], function(result) {
    const isEnabled = result.noAiEnabled !== false;
    const blockGoogleAI = result.blockGoogleAI !== false;
    const aggressiveMode = result.aggressiveMode === true;
    const customKeywords = (result.customKeywords || '').split('\n').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
    if (!isEnabled) {
      removeBlockedIndicator();
      if (observer) observer.disconnect();
      removeAiFromQueryIfPresent();
      return;
    }
    onReadyOrLoaded(injectOnboardingIfNeeded);
    runNoAiSmart(blockGoogleAI, aggressiveMode, customKeywords);
  });

  // Listen for extension enable/disable and auto-remove -ai if turned off
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'sync' && changes.noAiEnabled) {
      if (changes.noAiEnabled.newValue === false) {
        removeBlockedIndicator();
        if (observer) observer.disconnect();
        removeAiFromQueryIfPresent();
      }
    }
  });

  function removeAiFromQueryIfPresent() {
    if (!window.location.hostname.includes('google.com') || !window.location.pathname.includes('/search')) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    let query = params.get('q');
    if (!query || !query.includes('-ai')) return;
    let newQuery = query.replace(/\s*-ai\s*/gi, ' ').replace(/\s{2,}/g, ' ').trim();
    params.set('q', newQuery);
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params.toString()}`;
    window.location.replace(newUrl);
  }

  function isAiQuery(query, customKeywords) {
    if (!query) return false;
    const q = query.toLowerCase();
    if (q.trim() === 'ai') return true;
    // Also treat as AI query if it matches any custom keyword
    if (customKeywords && customKeywords.some(kw => q.includes(kw))) return true;
    return baseAiKeywords.concat(aggressiveAiKeywords).some(keyword => {
      const pattern = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return pattern.test(q);
    });
  }

  function runNoAiSmart(blockGoogleAI, aggressiveMode, customKeywords) {
    if (!window.location.hostname.includes('google.com') || !window.location.pathname.includes('/search')) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    let query = params.get('q');
    if (!query) return;

    chrome.runtime.sendMessage({action: 'updateStats', searches: 1});

    if (!isAiQuery(query, customKeywords)) {
      if (!query.includes('-ai')) {
        query += ' -ai';
        params.set('q', query);
        const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params.toString()}`;
        window.location.replace(newUrl);
        return;
      }
    }
    hideGoogleAiOverview(blockGoogleAI, aggressiveMode, customKeywords);
    setupObserver(blockGoogleAI, aggressiveMode, customKeywords);
  }

  function hideGoogleAiOverview(blockGoogleAI, aggressiveMode, customKeywords) {
    if (!blockGoogleAI) return;
    let blockedCount = 0;
    const googleAiSelectors = [
      '[data-attrid="AIOverview"]',
      '[data-attrid="GenAIOverview"]',
      '.ai-overview-container',
      '.generative-ai-overview',
      '.SGE',
      '.sge-container',
      '[aria-label*="Gemini"]',
      '[data-ved*="Gemini"]',
      '.gemini-response',
      '.bard-response',
      '.ai-generated-snippet',
      '.ai-generated-content',
      '[data-testid*="ai-overview"]',
      '[data-testid*="generative"]',
      '.experimental-ai-result',
      '.labs-ai-result',
      '[data-ved*="AI"]',
      '.knowledge-panel [data-attrid*="ai"]',
      '.kp-blk:has([aria-label*="AI generated"])',
      '.ai-powered-result',
      '[data-ved*="AIOverview"]'
    ];
    // Hide Google's official AI elements
    googleAiSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.style.display !== 'none') {
            element.style.display = 'none';
            blockedCount++;
          }
        });
      } catch (e) {}
    });
    // Aggressive filtering and custom keywords
    const keywordsToCheck = aggressiveMode ? baseAiKeywords.concat(aggressiveAiKeywords) : baseAiKeywords;
    const allKeywords = [...keywordsToCheck, ...(customKeywords || [])];
    const selectors = [
      '[data-ved]', '.g', '.MjjYud', '.hlcw0c', '.kp-blk', '.ULSxyf', '.rc', '.srg .g', '.GyAeWb', '.IZ6rdc'
    ];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.style.display === 'none') return;
        const text = element.textContent.toLowerCase();
        // Block if matches any custom keyword or (if aggressive) any aggressive keyword
        const hasCustomKeyword = (customKeywords || []).some(keyword => text.includes(keyword));
        const hasAggressiveKeyword = aggressiveMode && aggressiveAiKeywords.some(keyword => text.includes(keyword));
        // Block if matches AI domains (aggressive mode)
        const links = element.querySelectorAll('a[href]');
        const hasAiUrl = aggressiveMode && Array.from(links).some(link => {
          const url = link.href.toLowerCase();
          return aiDomains.some(domain => url.includes(domain));
        });
        if (hasCustomKeyword || hasAggressiveKeyword || hasAiUrl) {
          element.style.display = 'none';
          blockedCount++;
        }
      });
    });
    if (blockedCount > 0) {
      chrome.runtime.sendMessage({action: 'updateStats', blocked: blockedCount});
      showBlockedIndicator(blockedCount);
    } else {
      removeBlockedIndicator();
    }
  }

  function showBlockedIndicator(count) {
    let indicator = document.getElementById('noai-blocked-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'noai-blocked-indicator';
      indicator.className = 'noai-blocked-indicator';
      indicator.style.zIndex = '2147483647';
      document.body.appendChild(indicator);
    }
    indicator.textContent = `${count} Google AI results blocked`;
    indicator.classList.add('show');
    setTimeout(() => {
      indicator.classList.add('hide');
      setTimeout(() => {
        indicator.classList.remove('show', 'hide');
      }, 300);
    }, 3000);
  }

  function removeBlockedIndicator() {
    const indicator = document.getElementById('noai-blocked-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function throttle(fn, wait) {
    let lastTime = 0;
    let timeout;
    return function throttled() {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn();
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          lastTime = Date.now();
          fn();
        }, wait - (now - lastTime));
      }
    };
  }

  function setupObserver(blockGoogleAI, aggressiveMode, customKeywords) {
    if (observer) observer.disconnect();
    const throttledHide = throttle(() => hideGoogleAiOverview(blockGoogleAI, aggressiveMode, customKeywords), 300);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', throttledHide);
    } else {
      throttledHide();
    }
    observer = new MutationObserver(() => {
      throttledHide();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
