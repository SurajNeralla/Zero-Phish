document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const simulateBtn = document.getElementById('trigger-simulation');

    // Trigger Simulation in Active Tab
    simulateBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            // Send message to content script
            chrome.tabs.sendMessage(tab.id, { action: "start_simulation" });
            window.close(); // Close popup
        }
    });

    // Open Dashboard (New Tab)
    document.getElementById('open-dashboard').addEventListener('click', () => {
        const dashboardUrl = chrome.runtime.getURL('extension/dashboard/index.html');
        chrome.tabs.create({ url: dashboardUrl });
    });
});
