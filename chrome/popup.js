const defaults = { soundEnabled: true, visualEnabled: true, repeatAlert: true, soundVolume: 0.7 };

chrome.storage.sync.get(['config'], (result) => {
  const config = { ...defaults, ...(result.config || {}) };
  document.getElementById('soundEnabled').checked = config.soundEnabled;
  document.getElementById('visualEnabled').checked = config.visualEnabled;
  document.getElementById('repeatAlert').checked = config.repeatAlert;
  document.getElementById('volume').value = Math.round(config.soundVolume * 100);
});

function save() {
  const config = {
    soundEnabled: document.getElementById('soundEnabled').checked,
    visualEnabled: document.getElementById('visualEnabled').checked,
    repeatAlert: document.getElementById('repeatAlert').checked,
    soundVolume: document.getElementById('volume').value / 100
  };
  chrome.storage.sync.set({ config });
}

['soundEnabled', 'visualEnabled', 'repeatAlert', 'volume'].forEach(id => {
  document.getElementById(id).addEventListener('change', save);
});

document.getElementById('testBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'test' }, (response) => {
      if (chrome.runtime.lastError) {
        document.getElementById('status').textContent = 'Not active on this tab — go to dala.work first';
      } else {
        document.getElementById('status').textContent = 'Test triggered!';
        setTimeout(() => document.getElementById('status').textContent = '', 2000);
      }
    });
  });
});

// Format elapsed seconds as "0:05", "1:23" etc
function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Stored hand data from last fetch: [{ name, raisedAt }]
let currentHands = [];

function fetchRaisedHands() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getRaisedHands' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        currentHands = null;
      } else {
        currentHands = response.hands; // [{ name, raisedAt }]
      }
      renderList();
    });
  });
}

function renderList() {
  const el = document.getElementById('raisedList');
  if (currentHands === null) {
    el.innerHTML = '<span class="no-hands">Not on a dala.work call</span>';
    return;
  }
  if (currentHands.length === 0) {
    el.innerHTML = '<span class="no-hands">No hands raised</span>';
    return;
  }
  const now = Date.now();
  el.innerHTML = currentHands.map(h =>
    `<div class="hand-item">
      <span class="hand-name">✋ ${h.name}</span>
      <span class="hand-timer">${formatElapsed(now - h.raisedAt)}</span>
    </div>`
  ).join('');
}

// Fetch fresh data every 3 seconds
fetchRaisedHands();
setInterval(fetchRaisedHands, 3000);

// Re-render timers every second (without re-fetching)
setInterval(renderList, 1000);
