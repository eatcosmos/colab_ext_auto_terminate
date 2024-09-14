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