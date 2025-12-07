/* Listener for background events */
chrome.runtime.onInstalled.addListener(() => {
    console.log("Zero Phish Extension Installed - v1.1 (Fix Loaded)");
});

console.log("Zero Phish: Background Script v1.1 Loaded ✅");

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
        chrome.tabs.captureVisibleTab(null, { format: "png" }, async (dataUrl) => {
            const fullReport = {
                ...request.data,
                screenshot: dataUrl || null,
                userAgent: navigator.userAgent,
                id: Date.now().toString()
            };

            if (chrome.runtime.lastError) {
                // Log the precise error message
                console.warn("Zero Phish: Screenshot failed:", chrome.runtime.lastError.message);
                fullReport.screenshot = null;
            } else if (!dataUrl) {
                console.warn("Zero Phish: Screenshot returned empty data");
                fullReport.screenshot = null;
            }

            // Try to send to backend
            let backendSuccess = false;
            try {
                const response = await fetch('http://localhost:3000/api/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fullReport)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Zero Phish: Report sent to backend', data);
                    backendSuccess = true;
                }
            } catch (err) {
                console.warn('Zero Phish: Backend unavailable, storing locally', err.message);
            }

            // Store in local storage as backup/fallback
            try {
                const { pendingReports = [] } = await chrome.storage.local.get('pendingReports');
                const updatedReports = [...pendingReports, { ...fullReport, backendSynced: backendSuccess }];
                // Keep only last 50 reports to avoid storage issues
                const trimmedReports = updatedReports.slice(-50);
                await chrome.storage.local.set({ pendingReports: trimmedReports });
                console.log('Zero Phish: Report stored locally', { total: trimmedReports.length, synced: backendSuccess });
            } catch (storageErr) {
                console.error('Zero Phish: Failed to store locally', storageErr);
            }

            sendResponse({ success: true, backendSynced: backendSuccess });
        });

        return true; // Keep message channel open for async response
    }

    // 3. Get Local Reports (for dashboard when backend is offline)
    if (request.action === "get_local_reports") {
        chrome.storage.local.get('pendingReports', (result) => {
            sendResponse({ reports: result.pendingReports || [] });
        });
        return true;
    }

    // 4. Sync pending reports to backend
    if (request.action === "sync_reports") {
        syncPendingReports().then(result => {
            sendResponse(result);
        });
        return true;
    }

    // 5. Proxy URL Check (to avoid Mixed Content errors in content script)
    if (request.action === "check_url") {
        fetch('http://localhost:3000/api/check-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: request.url })
        })
            .then(response => response.json())
            .then(data => sendResponse({ success: true, data }))
            .catch(error => {
                console.warn('Zero Phish: Backend check failed', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep channel open
    }
});

// Function to sync pending reports to backend
async function syncPendingReports() {
    try {
        const { pendingReports = [] } = await chrome.storage.local.get('pendingReports');
        const unsynced = pendingReports.filter(r => !r.backendSynced);

        if (unsynced.length === 0) {
            return { synced: 0, total: pendingReports.length };
        }

        let syncedCount = 0;
        for (const report of unsynced) {
            try {
                const response = await fetch('http://localhost:3000/api/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                });

                if (response.ok) {
                    report.backendSynced = true;
                    syncedCount++;
                }
            } catch (err) {
                console.warn('Zero Phish: Failed to sync report', report.id);
                break; // Stop if backend is unavailable
            }
        }

        await chrome.storage.local.set({ pendingReports });
        console.log(`Zero Phish: Synced ${syncedCount}/${unsynced.length} reports`);
        return { synced: syncedCount, total: pendingReports.length };
    } catch (err) {
        console.error('Zero Phish: Sync failed', err);
        return { error: err.message };
    }
}

