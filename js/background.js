// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Received message:', request);
  
  if (request.action === 'updateProxy') {
    if (request.enabled) {
      console.log('Enabling proxy with settings:', {
        host: request.host,
        port: request.port
      });
      
      // Set green icon when proxy is enabled
      chrome.action.setIcon({
        path: {
          128: "/images/icon128_green.png"
        }
      });
      
      chrome.proxy.settings.set({
        value: {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: "http",
              host: request.host,
              port: parseInt(request.port)
            }
          }
        },
        scope: 'regular'
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error enabling proxy:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Proxy enabled successfully');
          sendResponse({ success: true });
        }
      });
    } else {
      console.log('Disabling proxy');
      
      // Set default icon when proxy is disabled
      chrome.action.setIcon({
        path: {
          128: "/images/icon128.png"
        }
      });
    
      chrome.proxy.settings.set({
        value: { mode: "direct" },
        scope: 'regular'
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error disabling proxy:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Proxy disabled successfully');
          sendResponse({ success: true });
        }
      });
    }
    return true;
  }
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync') {
    if (changes.enabled) {
      chrome.action.setIcon({
        path: {
          128: changes.enabled.newValue ? "/images/icon128_green.png" : "/images/icon128.png"
        }
      });
    }
  }
});

// 初始化时检查代理状态
chrome.storage.sync.get(['enabled', 'proxyHost', 'proxyPort'], function(result) {
  console.log('Initial proxy settings:', result);
  
  chrome.action.setIcon({
    path: {
      128: result.enabled ? "/images/icon128_green.png" : "/images/icon128.png"
    }
  });
  
  if (result.enabled && result.proxyHost && result.proxyPort) {
    console.log('Setting initial proxy configuration');
    chrome.proxy.settings.set({
      value: {
        mode: "fixed_servers",
        rules: {
          singleProxy: {
            scheme: "http",
            host: result.proxyHost,
            port: parseInt(result.proxyPort)
          }
        }
      },
      scope: 'regular'
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error setting initial proxy:', chrome.runtime.lastError);
      } else {
        console.log('Initial proxy configuration set successfully');
      }
    });
  }
}); 