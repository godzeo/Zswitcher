document.addEventListener('DOMContentLoaded', function() {
  const proxyHost = document.getElementById('proxyHost');
  const proxyPort = document.getElementById('proxyPort');
  const saveBtn = document.getElementById('saveBtn');
  const toggleBtn = document.getElementById('toggleBtn');
  const proxyStatus = document.getElementById('proxyStatus');
  const proxyStatusText = document.getElementById('proxyStatusText');
  const logArea = document.getElementById('logArea');

  document.getElementById('tab-normal').onclick = function() {
    setTab('normal');
  };
  document.getElementById('tab-log').onclick = function() {
    setTab('log');
    renderLog();
  };
  function setTab(tab) {
    document.getElementById('tab-normal').classList.toggle('active', tab === 'normal');
    document.getElementById('tab-log').classList.toggle('active', tab === 'log');
    document.getElementById('tabContent-normal').classList.toggle('active', tab === 'normal');
    document.getElementById('tabContent-log').classList.toggle('active', tab === 'log');
  }

  function addLog(msg) {
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${msg}`;
    chrome.storage.local.get({proxyLogs: []}, function(data) {
      const logs = data.proxyLogs || [];
      logs.push(entry);
      if (logs.length > 200) logs.shift(); 
      chrome.storage.local.set({proxyLogs: logs}, renderLog);
    });
  }
  function renderLog() {
    chrome.storage.local.get({proxyLogs: []}, function(data) {
      logArea.innerText = data.proxyLogs.join('\n');
      logArea.scrollTop = logArea.scrollHeight;
    });
  }

  function updateUIState(enabled) {
    toggleBtn.checked = enabled;
    proxyStatus.className = 'status-dot ' + (enabled ? 'connected' : 'disconnected');
    if (proxyStatusText) {
      proxyStatusText.textContent = enabled ? 'Connected' : 'Disconnected';
      proxyStatusText.style.color = enabled ? '#34c759' : '#888';
    }
  }

  function loadSettings() {
    chrome.storage.sync.get(['proxyHost', 'proxyPort', 'enabled'], function(result) {
      proxyHost.value = result.proxyHost || '';
      proxyPort.value = result.proxyPort || '';
      updateUIState(result.enabled || false);
      addLog('Settings loaded');
    });
  }

  loadSettings();

  saveBtn.addEventListener('click', function() {
    const host = proxyHost.value.trim();
    const port = proxyPort.value.trim();
    if (!host || !port) return;
    chrome.storage.sync.set({
      proxyHost: host,
      proxyPort: port,
      enabled: false
    }, function() {
      if (chrome.runtime.lastError) {
        addLog('Failed to save settings: ' + chrome.runtime.lastError.message);
      } else {
        addLog('Settings saved: ' + host + ':' + port);
        updateUIState(false);
      }
    });
  });

  toggleBtn.addEventListener('change', function() {
    chrome.storage.sync.get(['enabled', 'proxyHost', 'proxyPort'], function(result) {
      const newState = !result.enabled;
      if (newState && (!result.proxyHost || !result.proxyPort)) {
        addLog('Enable failed: host or port missing');
        toggleBtn.checked = false;
        return;
      }
      updateUIState(newState);
      chrome.storage.sync.set({ enabled: newState }, function() {
        if (chrome.runtime.lastError) {
          addLog('Failed to toggle proxy: ' + chrome.runtime.lastError.message);
          return;
        }
        chrome.runtime.sendMessage({
          action: 'updateProxy',
          enabled: newState,
          host: result.proxyHost,
          port: result.proxyPort
        }, function(response) {
          if (chrome.runtime.lastError) {
            addLog('Proxy message failed: ' + chrome.runtime.lastError.message);
          } else if (response && !response.success) {
            addLog('Proxy toggle failed: ' + response.error);
            toggleBtn.checked = !newState;
          } else {
            addLog(newState ? 'Proxy enabled' : 'Proxy disabled');
          }
        });
      });
    });
  });

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.enabled) {
      updateUIState(changes.enabled.newValue);
      addLog('Proxy state changed: ' + (changes.enabled.newValue ? 'connected' : 'disconnected'));
    }
  });
}); 