function simulateMouseMove(element) {
  const mouseenterEvent = new MouseEvent('mouseenter', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(mouseenterEvent);
}

function simulateClick(element) {
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(clickEvent);
}

function checkConnectionStatus() {
  const connectButton = document.querySelector('colab-connect-button');
  if (connectButton && connectButton.shadowRoot) {
    const buttonContent = connectButton.shadowRoot.textContent;
    return !['Connect', 'Reconnect', 'Connecting'].some(status => buttonContent.includes(status));
  }
  return false; // 如果找不到按钮，默认返回 false
}

function checkExecutingCellsAndRun() {
  console.log('Checking execution status...');
  const statusBar = document.querySelector('colab-status-bar');
  if (statusBar && statusBar.shadowRoot) {
    const shadowContent = statusBar.shadowRoot.textContent;
    console.log('Status bar content:', shadowContent.trim());
    
    const executionKeywords = [
      'Executing (',
      'Allocating runtime',
      'Initializing',
      'Connecting to',
    ];
    
    const isExecuting = executionKeywords.some(keyword => shadowContent.includes(keyword));
    const isConnected = checkConnectionStatus();
    
    if (!isExecuting && isConnected) {
      console.log('No execution in progress and connected. Attempting to run cell 0...');
      chrome.runtime.sendMessage({action: "clickRunButton"});
    } else if (!isConnected) {
      console.log('Not connected. Waiting for connection...');
    } else {
      console.log('Execution or setup in progress. Waiting...');
    }
  } else {
    console.log('Could not find status bar or its shadow root');
  }
}

// 初始延迟，给页面加载一些时间
setTimeout(() => {
  setInterval(checkExecutingCellsAndRun, 1000*10);
}, 5000);