/* Listener for background events */
chrome.runtime.onInstalled.addListener(() => {
    console.log("Zero Phish Extension Installed");
});

// Redirect Tracking
const redirectChains = {}; // { tabId: [{ url, timeStamp }] }

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) { // Main frame only
        if (!redirectChains[details.tabId]) {
            redirectChains[details.tabId] = [];
        }
    }
});

chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return; // Ignore subframes

    const { tabId, url, transitionType, transitionQualifiers } = details;

    const isRedirect = transitionType === 'server_redirect' ||
        transitionType === 'client_redirect' ||
        transitionQualifiers.includes('server_redirect') ||
        transitionQualifiers.includes('client_redirect');

    if (!redirectChains[tabId]) {
        redirectChains[tabId] = [];
    }

    if (isRedirect) {
        redirectChains[tabId].push({ url, timestamp: Date.now() });

        // Check for suspicious rapid redirects (> 3)
        if (redirectChains[tabId].length >= 3) {
            console.log(`[Zero Phish] Suspicious redirect chain detected in tab ${tabId}`, redirectChains[tabId]);

            // Send to Node.js Backend
            fetch('http://localhost:3000/api/redirect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chain: redirectChains[tabId].map(i => i.url)
                })
            }).catch(err => console.error('Backend Error:', err));

            // Send warning to content script
            chrome.tabs.sendMessage(tabId, {
                action: "trigger_redirect_warning",
                chain: redirectChains[tabId].map(i => i.url)
            }).catch(() => {
                // Content script might not be loaded yet during a fast redirect
            });
        }
    } else {
        // Reset chain if it's a normal navigation (user clicked link or typed URL)
        // Keep the current URL as the "start" of a potential new chain
        redirectChains[tabId] = [{ url, timestamp: Date.now() }];
    }
});

// Listener for cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
    if (redirectChains[tabId]) {
        delete redirectChains[tabId];
    }
});

// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 1. Close Tab Action
    if (request.action === "close_tab") {
        console.log("Zero Phish: Received close_tab request from", sender);
        const tabId = sender.tab ? sender.tab.id : null;
        if (tabId) {
            chrome.tabs.remove(tabId).then(() => console.log("Tab closed")).catch(err => console.error("Error closing tab:", err));
        } else {
            // Fallback: Query active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) chrome.tabs.remove(tabs[0].id);
            });
        }
    }

    // 2. Report Phishing Action
    if (request.action === "report_phishing") {
        console.log("Zero Phish: Received Report Request", request.data);

        // Capture Screenshot
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error("Zero Phish: Screenshot failed", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                console.log("Zero Phish: Screenshot Captured (Base64 length):", dataUrl.length);

                // Simulate Backend Payload
                const fullReport = {
                    ...request.data,
                    screenshot: dataUrl,
                    userAgent: navigator.userAgent
                };

                console.log("Zero Phish: REPORT SENT TO BACKEND (Simulation)", fullReport);

                // Send to Node.js Backend
                fetch('http://localhost:3000/api/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fullReport)
                })
                    .then(response => response.json())
                    .then(data => console.log('Backend Response:', data))
                    .catch(err => console.error('Backend Error:', err));

                // Send success back to content script
                sendResponse({ success: true });
            }
        });

        return true; // Keep message channel open for async response
    }
});
