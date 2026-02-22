// Nextcloud Talk Hand Raise Alert - Content Script v1.1
// Uses confirmed selectors from dala.work Talk instance

(function() {
  'use strict';

  window.__talkHandAlertLoaded = true;
  console.log('[Talk Hand Alert] Content script loaded on', window.location.href);

  // Config defaults
  let config = {
    soundEnabled: true,
    visualEnabled: true,
    soundVolume: 0.7,
    repeatAlert: true,
    alertInterval: 8000
  };

  // Track raised hands with timestamps: key -> { name, raisedAt }
  const raisedHandsMap = new Map();
  let repeatTimer = null;
  let audioContext = null;

  // Load config from storage
  chrome.storage.sync.get(['config'], (result) => {
    if (result.config) config = { ...config, ...result.config };
    console.log('[Talk Hand Alert] Config:', config);
  });

  // Listen for config updates from popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.config) config = { ...config, ...changes.config.newValue };
  });

  // Resume AudioContext on first user interaction (Chrome autoplay policy)
  function ensureAudioContext() {
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  document.addEventListener('click', () => {
    if (audioContext && audioContext.state === 'suspended') audioContext.resume();
  }, { once: false });

  // Play alert using Web Audio API (no file needed)
  function playAlert() {
    if (!config.soundEnabled) return;
    try {
      const audioContext = ensureAudioContext();

      const now = audioContext.currentTime;

      // Two-tone beep: 880Hz then 1100Hz
      [880, 1100].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.2);

        gain.gain.setValueAtTime(0, now + i * 0.2);
        gain.gain.linearRampToValueAtTime(config.soundVolume * 0.5, now + i * 0.2 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.25);

        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.25);
      });
    } catch (e) {
      console.error('[Talk Hand Alert] Audio error:', e);
    }
  }

  // Show visual notification
  function showVisualAlert(names) {
    if (!config.visualEnabled) return;

    // Remove existing notification
    const existing = document.getElementById('talk-hand-alert-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'talk-hand-alert-notification';
    notification.innerHTML = `
      <div style="font-size:24px;margin-bottom:4px;">✋</div>
      <div style="font-weight:bold;margin-bottom:2px;">Hand Raised!</div>
      <div style="font-size:12px;opacity:0.9;">${names.join(', ')}</div>
      <div style="font-size:11px;margin-top:4px;opacity:0.7;">Click to dismiss</div>
    `;
    notification.addEventListener('click', () => notification.remove());
    document.body.appendChild(notification);

    // Auto-dismiss after 10s
    setTimeout(() => notification.remove(), 10000);
  }

  // Get participant name from a raised-hand element
  function getParticipantName(el) {
    // Walk up to the list-item container and find the confirmed name span
    let node = el;
    for (let i = 0; i < 12; i++) {
      if (!node.parentElement) break;
      node = node.parentElement;
      const nameEl = node.querySelector('span.participant__user-name');
      if (nameEl && nameEl.textContent.trim()) return nameEl.textContent.trim();
    }
    return 'Unknown participant';
  }

  // Main check function
  function checkForRaisedHands() {
    // This selector was confirmed working on dala.work
    const raisedHandEls = document.querySelectorAll(
      '[aria-label="Raised their hand"], span.participant__call-state.hand-back-left-icon'
    );

    const currentlyRaised = new Set();

    raisedHandEls.forEach(el => {
      const name = getParticipantName(el);
      const key = name + '_' + (el.closest('[data-participant-id]')?.dataset?.participantId || el.parentElement?.innerHTML?.substring(0, 50));
      currentlyRaised.add(key);

      if (!raisedHandsMap.has(key)) {
        // New raised hand — record timestamp and alert
        raisedHandsMap.set(key, { name, raisedAt: Date.now() });
        console.log('[Talk Hand Alert] New raised hand detected:', name);
        playAlert();
        showVisualAlert([name]);
      }
    });

    // Clear hands that are no longer raised
    for (const key of raisedHandsMap.keys()) {
      if (!currentlyRaised.has(key)) {
        console.log('[Talk Hand Alert] Hand lowered:', raisedHandsMap.get(key).name);
        raisedHandsMap.delete(key);
      }
    }
  }

  // Watch for DOM changes (Talk updates the participant list dynamically)
  function startObserver() {
    const observer = new MutationObserver(() => checkForRaisedHands());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'class']
    });
    console.log('[Talk Hand Alert] MutationObserver started');
  }

  // Also poll every 3 seconds as a fallback
  setInterval(checkForRaisedHands, 3000);

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      startObserver();
      checkForRaisedHands();
    });
  } else {
    startObserver();
    checkForRaisedHands();
  }

  // Expose test function for console debugging
  window.__talkHandAlertTest = function() {
    console.log('[Talk Hand Alert] Manual test triggered');
    playAlert();
    showVisualAlert(['Test User']);
  };

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'test') {
      window.__talkHandAlertTest();
      sendResponse({ ok: true });
    } else if (message.action === 'getRaisedHands') {
      // Return { name, raisedAt } sorted oldest to newest
      const sorted = Array.from(raisedHandsMap.values())
        .sort((a, b) => a.raisedAt - b.raisedAt)
        .map(entry => ({ name: entry.name, raisedAt: entry.raisedAt }));
      sendResponse({ hands: sorted });
    }
    return true;
  });

  console.log('[Talk Hand Alert] Ready. Run window.__talkHandAlertTest() to test audio/visual.');
})();
