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
        this.close();
    }
}

class FloatingShield {
    constructor() {
        this.root = null;
        this.status = 'unknown'; // safe, suspicious, phishing, unknown
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
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

        // Restore saved position
        this.restorePosition();

        const shieldIcon = this.root.querySelector('#zp-shield-icon');

        // Click Handler for Shield (only if not dragging)
        shieldIcon.addEventListener('click', (e) => {
            if (!this.wasDragged) {
                const report = this.root.querySelector('#zp-report-card');
                report.classList.toggle('visible');
            }
            this.wasDragged = false;
        });

        // Drag functionality
        shieldIcon.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());

        // Touch support for mobile
        shieldIcon.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.onDrag(e.touches[0]);
            }
        }, { passive: false });
        document.addEventListener('touchend', () => this.endDrag());

        // Click Handler for Report Button
        this.root.querySelector('#zp-btn-report').addEventListener('click', (e) => this.handleReport(e));

        this.checkStatus();
    }

    startDrag(e) {
        const shieldIcon = this.root.querySelector('#zp-shield-icon');
        const rect = this.root.getBoundingClientRect();
        this.isDragging = true;
        this.wasDragged = false;
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        shieldIcon.style.cursor = 'grabbing';
        shieldIcon.style.transition = 'none';
    }

    onDrag(e) {
        if (!this.isDragging) return;

        this.wasDragged = true;

        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;

        // Keep within viewport bounds
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        this.root.style.left = newX + 'px';
        this.root.style.top = newY + 'px';
        this.root.style.right = 'auto';
        this.root.style.bottom = 'auto';
    }

    endDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;
        const shieldIcon = this.root.querySelector('#zp-shield-icon');
        shieldIcon.style.cursor = 'grab';
        shieldIcon.style.transition = 'transform 0.2s, box-shadow 0.2s';

        // Save position to localStorage
        this.savePosition();
    }

    savePosition() {
        const rect = this.root.getBoundingClientRect();
        localStorage.setItem('zerophish-shield-pos', JSON.stringify({
            left: rect.left,
            top: rect.top
        }));
    }

    restorePosition() {
        try {
            const saved = localStorage.getItem('zerophish-shield-pos');
            if (saved) {
                const pos = JSON.parse(saved);
                // Validate position is within current viewport
                if (pos.left >= 0 && pos.left < window.innerWidth - 60 &&
                    pos.top >= 0 && pos.top < window.innerHeight - 60) {
                    this.root.style.left = pos.left + 'px';
                    this.root.style.top = pos.top + 'px';
                    this.root.style.right = 'auto';
                    this.root.style.bottom = 'auto';
                }
            }
        } catch (e) {
            console.warn('Zero Phish: Could not restore shield position');
        }
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
                    btn.innerText = '✓ Report Sent!';
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
            if (err.message.includes('Extension context invalidated')) {
                btn.innerText = '⟳ Refresh Page';
                alert('Extension was updated. Please refresh this page to reconnect.');
            } else {
                btn.innerText = 'Error.';
            }
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

    async checkStatus() {
        const domain = window.location.hostname;
        const protocol = window.location.protocol;
        const isSecure = protocol === 'https:';
        const currentURL = window.location.href;

        let status = 'unknown';
        let threatLevel = isSecure ? 'Low' : 'Medium (No HTTPS)';

        // First, update with basic info
        this.updateUI(status, domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', threatLevel);

        // Check for test/demo phishing indicators
        if (currentURL.includes('phish=true') || currentURL.includes('phishing-test')) {
            this.updateUI('phishing', domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', 'High - Phishing Detected');
            return;
        }

        // Check via backend API
        try {
            chrome.runtime.sendMessage({
                action: "check_url",
                url: currentURL
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Zero Phish Shield: Could not connect to background script");
                    // Default to safe if we can't check
                    this.updateUI('safe', domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', isSecure ? 'Low' : 'Medium (No HTTPS)');
                    return;
                }

                if (response && response.success && response.data) {
                    if (response.data.isPhishing || response.data.threat === 'high') {
                        this.updateUI('phishing', domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', 'High - Phishing Detected');
                    } else if (response.data.threat === 'medium' || response.data.suspicious) {
                        this.updateUI('suspicious', domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', 'Medium - Suspicious Activity');
                    } else {
                        this.updateUI('safe', domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', isSecure ? 'Low' : 'Medium (No HTTPS)');
                    }
                } else {
                    // If backend doesn't respond or no data, assume safe
                    this.updateUI('safe', domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', isSecure ? 'Low' : 'Medium (No HTTPS)');
                }
            });
        } catch (err) {
            console.warn("Zero Phish Shield: URL check failed", err);
            // Default to safe on error
            this.updateUI('safe', domain, isSecure ? 'Secure (HTTPS)' : 'Insecure (HTTP)', isSecure ? 'Low' : 'Medium (No HTTPS)');
        }
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
    console.log("Zero Phish: Initializing...");
    if (!phishGuard) {
        phishGuard = new PhishingOverlay();
        console.log("Zero Phish: PhishingOverlay Initialized");
    }
    if (!zeroShield) {
        zeroShield = new FloatingShield();
        console.log("Zero Phish: FloatingShield Initialized");
    }

    // Automatically scan the current URL
    scanCurrentURL();
}

// Automatic URL Scanning
async function scanCurrentURL() {
    const currentURL = window.location.href;
    console.log("Zero Phish: Scanning URL", currentURL);

    // Check for test/demo phishing indicators
    if (currentURL.includes('phish=true') || currentURL.includes('phishing-test')) {
        console.log("Zero Phish: THREAT DETECTED - Test phishing URL");
        phishGuard.start();
        return;
    }

    // Check via backend API
    try {
        chrome.runtime.sendMessage({
            action: "check_url",
            url: currentURL
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Zero Phish: Could not connect to background script", chrome.runtime.lastError.message);
                return;
            }

            if (response && response.success && response.data) {
                console.log("Zero Phish: API Response", response.data);

                if (response.data.isPhishing || response.data.threat === 'high') {
                    console.log("Zero Phish: THREAT DETECTED by API");
                    phishGuard.start();
                } else if (response.data.threat === 'medium' || response.data.suspicious) {
                    console.log("Zero Phish: Suspicious activity detected");
                    // Could show a banner instead of full overlay for medium threats
                }
            }
        });
    } catch (err) {
        console.warn("Zero Phish: URL check failed", err);
    }
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
