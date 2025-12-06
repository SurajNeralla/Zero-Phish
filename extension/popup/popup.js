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
        // Correct path relative to manifest.json (extension root)
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
    });
});
