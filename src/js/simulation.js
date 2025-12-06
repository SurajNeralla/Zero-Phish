class PhishingSimulation {
    constructor() {
        this.overlay = document.getElementById('simulation-overlay');
        this.timer = null;
        this.countdownValue = 10;

        // Bind methods
        this.start = this.start.bind(this);
        this.showWarning = this.showWarning.bind(this);
        this.showBlocked = this.showBlocked.bind(this);
        this.close = this.close.bind(this);
    }

    start() {
        this.overlay.classList.remove('hidden');
        this.showWarning();
    }

    showWarning() {
        this.countdownValue = 10;
        this.overlay.innerHTML = `
            <div class="warning-overlay">
                <div class="warning-box">
                    <div class="warning-icon">⚠️</div>
                    <h2 class="warning-title">Suspicious Activity Detected</h2>
                    <p>This site has been flagged by PhishGuard AI as potentially malicious.</p>
                    
                    <div class="countdown-box">
                        Automatic Blocking in
                        <span class="countdown-timer" id="timer-display">10.00</span>s
                    </div>

                    <div class="warning-actions">
                        <button class="btn-leave" onclick="simulation.close()">Leave Site Now</button>
                        <button class="btn-trust">I Trust This Site</button>
                    </div>
                </div>
            </div>
        `;

        this.startCountdown();
    }

    startCountdown() {
        const display = document.getElementById('timer-display');

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
        this.overlay.innerHTML = `
            <div class="blocked-overlay">
                <div class="blocked-icon">🛡️</div>
                <h1 class="blocked-title">Access Denied</h1>
                <p class="blocked-desc">
                    Zero Phish has blocked this connection to protect your personal data.
                    High-risk phishing patterns were confirmed.
                </p>
                <button class="btn-safety" onclick="simulation.close()">Back to Safety</button>
            </div>
        `;
    }

    close() {
        clearInterval(this.timer);
        this.overlay.innerHTML = '';
        this.overlay.classList.add('hidden');
    }
}

// Initialize
const simulation = new PhishingSimulation();

// Hook into global scope for inline onclicks (simple demo)
window.simulation = simulation;
