console.log("Zero Phish Content Script Loaded");

class PhishingOverlay {
    constructor() {
        this.root = null;
        this.timer = null;
        this.countdownValue = 5;

        // Listen for messages
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "start_simulation") {
                this.start();
            } else if (request.action === "trigger_redirect_warning") {
                this.showRedirectWarning(request.chain);
            }
        });
    }

    createRoot() {
        if (!this.root) {
            this.root = document.createElement('div');
            this.root.id = 'zerophish-overlay-root';
            document.body.appendChild(this.root);
        }
    }

    start() {
        this.createRoot();
        this.showWarning();
    }

    showWarning() {
        this.countdownValue = 5;
        this.root.innerHTML = ''; // Clear previous

        const overlay = document.createElement('div');
        overlay.className = 'warning-overlay';

        overlay.innerHTML = `
            <div class="overlay-bg">
                <div class="cyber-grid"></div>
                <div class="scanline"></div>
            </div>
            <div class="warning-box">
                <div class="warning-icon">⚠️</div>
                <h2 class="warning-title">Suspicious Activity</h2>
                <p class="warning-text">
                    <strong>THREAT DETECTED:</strong> Phishing heuristics matched.
                    <br>Connection Intercepted.
                </p>
                
                <div class="countdown-box">
                    System Locking In
                    <span class="countdown-timer" id="pg-timer">5.00</span>s
                </div>

                <div class="warning-actions">
                    <button class="btn-leave" id="pg-btn-leave">Leave Site Now</button>
                    <button class="btn-trust" id="pg-btn-trust">I Trust This Site</button>
                </div>
            </div>
        `;

        this.root.appendChild(overlay);

        // Attach listeners
        document.getElementById('pg-btn-leave').addEventListener('click', () => this.close());
        document.getElementById('pg-btn-trust').addEventListener('click', () => this.forceProceed());

        this.startCountdown();
    }

    startCountdown() {
        const display = document.getElementById('pg-timer');

        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            this.countdownValue -= 0.01;
            if (display) {
                display.innerText = Math.abs(this.countdownValue).toFixed(2);
            }

            if (this.countdownValue <= 0) {
                clearInterval(this.timer);
                this.showBlocked();
            }
        }, 10);
    }

    showBlocked() {
        this.root.innerHTML = '';
        const overlay = document.createElement('div');
        overlay.className = 'blocked-overlay';

        overlay.innerHTML = `
            <div class="blocked-icon">🛡️</div>
            <h1 class="blocked-title">Access Denied</h1>
            <p class="blocked-desc">
                PhishGuard has blocked this connection to protect your personal data.
                High-risk phishing patterns were confirmed.
            </p>
            <button class="btn-safety" id="pg-btn-safety">Back to Safety</button>
        `;

        this.root.appendChild(overlay);

        document.getElementById('pg-btn-safety').addEventListener('click', () => this.closeTab());
    }

    closeTab() {
        if (this.timer) clearInterval(this.timer);
        chrome.runtime.sendMessage({ action: "close_tab" });
    }

    close() {
        if (this.timer) clearInterval(this.timer);
        if (this.root) {
            this.root.remove();
            this.root = null;
        }
    }

    forceProceed() {
        if (this.timer) clearInterval(this.timer);
        // In a real extension, we would whitelist the site.
        // Here we just close the overlay
        this.close();
        alert("Site temporarily trusted for this session.");
    }
}

class FloatingShield {
    constructor() {
        this.root = null;
        this.status = 'unknown'; // safe, suspicious, phishing, unknown
        this.createShield();
    }

    createShield() {
        this.root = document.createElement('div');
        this.root.id = 'zerophish-shield-root';
        this.root.innerHTML = `
            <div class="shield-icon shield-status-unknown" id="zp-shield-icon">
                🛡️
            </div>
            <div class="security-report" id="zp-report-card">
                <div class="report-header">
                    <h3 class="report-title">Security Report</h3>
                    <span class="report-status status-text-unknown" id="zp-report-status">ANALYZING</span>
                </div>
                <div class="report-details">
                    <div class="report-row">
                        <span class="report-label">Domain:</span>
                        <span id="zp-domain">...</span>
                    </div>
                    <div class="report-row">
                        <span class="report-label">Encryption:</span>
                        <span id="zp-encryption">Checking...</span>
                    </div>
                    <div class="report-row">
                        <span class="report-label">Threat Level:</span>
                        <span id="zp-threat-level">Unknown</span>
                    </div>
                </div>
                <!-- Report Button -->
                <button class="btn-report" id="zp-btn-report">
                    ⚠️ Report Phishing
                </button>
            </div>
        `;

        document.body.appendChild(this.root);

        // Click Handler for Shield
        this.root.querySelector('#zp-shield-icon').addEventListener('click', () => {
            const report = this.root.querySelector('#zp-report-card');
            report.classList.toggle('visible');
        });

        // Click Handler for Report Button
        this.root.querySelector('#zp-btn-report').addEventListener('click', (e) => this.handleReport(e));

        this.checkStatus();
    }

    async handleReport(event) {
        const btn = event.target;
        if (btn.classList.contains('loading') || btn.classList.contains('success')) return;

        btn.innerText = 'Analyzing & Reporting...';
        btn.classList.add('loading');

        const pageData = this.collectPageData();
        console.log("Zero Phish: Sending Report...", pageData);

        try {
            chrome.runtime.sendMessage({
                action: "report_phishing",
                data: pageData
            }, (response) => {
                if (response && response.success) {
                    btn.innerText = ' Report Sent!';
                    btn.classList.remove('loading');
                    btn.classList.add('success');

                    // Reset after 3 seconds
                    setTimeout(() => {
                        btn.innerText = '⚠️ Report Phishing';
                        btn.classList.remove('success');
                    }, 3000);
                } else {
                    btn.innerText = 'Failed. Try Again.';
                    btn.classList.remove('loading');
                }
            });
        } catch (err) {
            console.error(err);
            btn.innerText = 'Error.';
            btn.classList.remove('loading');
        }
    }

    collectPageData() {
        return {
            url: window.location.href,
            title: document.title,
            htmlSnippet: document.documentElement.outerHTML.substring(0, 2000), // First 2KB
            timestamp: new Date().toISOString()
        };
    }

    checkStatus() {
        const domain = window.location.hostname;
        const protocol = window.location.protocol;

        let status = 'safe';
        let threatLevel = 'Low';

        // 1. Check Protocol
        const isSecure = protocol === 'https:';

        // 2. Check Suspicious Patterns (Hardcoded for demo)
        const suspiciousPatterns = ['test-phishing', 'suspicious', '?phish=true'];
        const isSuspicious = suspiciousPatterns.some(p => window.location.href.includes(p));

        if (!isSecure && !isSuspicious) {
            status = 'unknown';
            threatLevel = 'Medium (No HTTPS)';
        }

        if (isSuspicious) {
            status = 'phishing';
            threatLevel = 'Critical';
        }

        this.updateUI(status, domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', threatLevel);
    }

    updateUI(status, domain, encryption, threat) {
        this.status = status;
        const icon = this.root.querySelector('#zp-shield-icon');
        const badge = this.root.querySelector('#zp-report-status');

        // Reset classes
        icon.className = `shield-icon shield-status-${status}`;
        badge.className = `report-status status-text-${status}`;
        badge.innerText = status.toUpperCase();

        this.root.querySelector('#zp-domain').innerText = domain;
        this.root.querySelector('#zp-encryption').innerText = encryption;
        this.root.querySelector('#zp-threat-level').innerText = threat;
    }
}

// Initialize
let phishGuard;
let zeroShield;

function init() {
    console.log("Zero Phish: Initializing..."); // DEBUG
    if (!phishGuard) {
        phishGuard = new PhishingOverlay();
        console.log("Zero Phish: PhishingOverlay Initialized"); // DEBUG
    }
    if (!zeroShield) {
        zeroShield = new FloatingShield();
        console.log("Zero Phish: FloatingShield Initialized"); // DEBUG
    }
    runAutoScan();
}

// Automatic Scanning Logic
function runAutoScan() {
    const currentUrl = window.location.href;
    console.log("Zero Phish: Scanning URL", currentUrl); // DEBUG

    const suspiciousPatterns = [
        'example.com',           // Safe for testing
        'test-phishing',         // Demo keyword
        'suspicious',            // Demo keyword
        '?phish=true',           // Manual trigger via URL
        'adventure-nicaragua.net' // User added Phishing Site
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => currentUrl.includes(pattern));

    if (isSuspicious) {
        console.log("Zero Phish: Auto-detected suspicious URL:", currentUrl);
        // Add a small delay so the user sees the page first
        setTimeout(() => {
            if (phishGuard) phishGuard.start();
        }, 1000); // 1 second delay
    }
}

// Run scan on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
