// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Received message:', request);
  
  if (request.action === 'updateProxy') {
    if (request.enabled) {
      console.log('Enabling proxy with settings:', {
        host: request.host,
        port: request.port
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

// 初始化时检查代理状态
chrome.storage.sync.get(['enabled', 'proxyHost', 'proxyPort'], function(result) {
  console.log('Initial proxy settings:', result);
  
  if (result.enabled && result.proxyHost && result.proxyPort) {
    console.log('Setting initial proxy configuration');
    // 初始化代理配置
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