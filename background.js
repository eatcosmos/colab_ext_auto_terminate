chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "clickRunButton") {
    chrome.tabs.executeScript(sender.tab.id, {
      code: `
        (function() {
          const cell0 = document.querySelector('.cell.code');
          if (cell0) {
            // 模拟鼠标移动到 cell 上
            cell0.dispatchEvent(new MouseEvent('mouseenter', {
              view: window,
              bubbles: true,
              cancelable: true
            }));
            
            // 等待一段时间让运行按钮出现
            setTimeout(() => {
              const runButton = cell0.querySelector('colab-run-button');
              if (runButton && runButton.shadowRoot) {
                const actualButton = runButton.shadowRoot.querySelector('#run-button');
                if (actualButton) {
                  actualButton.click();
                  console.log('Clicked run button in cell 0');
                } else {
                  console.log('Could not find #run-button in colab-run-button');
                }
              } else {
                console.log('Could not find run button or its shadow root in cell 0');
              }
            }, 500);
          } else {
            console.log('Could not find cell 0');
          }
        })();
      `
    });
  }
});

function clickRunButton(tabId) {
  chrome.tabs.executeScript(tabId, {
    code: `
      (function() {
        const cell0 = document.querySelector('.cell.code');
        if (cell0) {
          cell0.dispatchEvent(new MouseEvent('mouseenter', {
            view: window,
            bubbles: true,
            cancelable: true
          }));
          
          setTimeout(() => {
            const runButton = cell0.querySelector('colab-run-button');
            if (runButton && runButton.shadowRoot) {
              const actualButton = runButton.shadowRoot.querySelector('#run-button');
              if (actualButton) {
                actualButton.click();
                console.log('Clicked run button in cell 0');
              } else {
                console.log('Could not find #run-button in colab-run-button');
              }
            } else {
              console.log('Could not find run button or its shadow root in cell 0');
            }
          }, 500);
        } else {
          console.log('Could not find cell 0');
        }
      })();
    `
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "askUserPermission") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "showConfirmDialog"}, function(response) {
        if (response && response.confirmed) {
          clickRunButton(sender.tab.id);
        }
      });
    });
  }
});