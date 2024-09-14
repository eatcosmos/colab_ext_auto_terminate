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

let isWaitingForConfirmation = false;
let lastConfirmationTime = 0;
const CONFIRMATION_COOLDOWN = 10000; // 10 seconds cooldown

function checkExecutingCellsAndRun() {
  if (isWaitingForConfirmation) {
    console.log('Waiting for user confirmation...');
    return;
  }

  const currentTime = Date.now();
  if (currentTime - lastConfirmationTime < CONFIRMATION_COOLDOWN) {
    console.log('In cooldown period...');
    return;
  }

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
      console.log('No execution in progress and connected. Asking user for permission...');
      isWaitingForConfirmation = true;
      chrome.runtime.sendMessage({action: "askUserPermission"});
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showConfirmDialog") {
    const confirmed = confirm("Terminate this session?");
    isWaitingForConfirmation = false;
    lastConfirmationTime = confirmed ? 0 : Date.now(); // 只在取消时设置冷却时间
    sendResponse({confirmed: confirmed});
  }
  return true;
});