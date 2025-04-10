const watchedDomains = [
    'arxiv.org',
    'medium.com',
    'jstor.org',
    'thehindu.com',
    'wikipedia.org'
];

let previousTabId = null;
let isDialogShowing = false;

// Track when tab focus changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (isDialogShowing) return;
    
    try {
        // Get the previous tab info
        if (previousTabId) {
            const previousTab = await chrome.tabs.get(previousTabId);
            if (previousTab && previousTab.url) {
                const domain = new URL(previousTab.url).hostname;
                
                // Check if we're leaving a watched domain
                if (watchedDomains.some(d => domain.includes(d))) {
                    isDialogShowing = true;
                    
                    // Execute script in the current tab to show dialog
                    const result = await chrome.scripting.executeScript({
                        target: { tabId: activeInfo.tabId },
                        func: () => window.confirm("If you leave now, you'll lose your focus and the momentum we've built.")
                    });
                    
                    if (!result[0].result) {
                        // User clicked Cancel - switch back
                        await chrome.tabs.update(previousTabId, { active: true });
                    }
                    isDialogShowing = false;
                }
            }
        }
    } catch (error) {
        console.log('Error:', error);
    }
    
    previousTabId = activeInfo.tabId;
});

// Also track tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active) {
        previousTabId = tabId;
    }
});
