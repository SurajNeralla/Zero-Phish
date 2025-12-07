// API Configuration
// Change this URL if your backend is hosted elsewhere

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
    stats: `${API_BASE_URL}/api/stats`,
    logs: `${API_BASE_URL}/api/logs`,
    reports: `${API_BASE_URL}/api/reports`,
    report: `${API_BASE_URL}/api/report`,
    redirects: `${API_BASE_URL}/api/redirects`,
    checkUrl: `${API_BASE_URL}/api/check-url`,
    health: `${API_BASE_URL}/api/health`,
};

// Fetch with timeout and error handling
export async function apiFetch(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch(endpoint, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

// API Helper Functions
export const api = {
    async getStats() {
        return apiFetch(API_ENDPOINTS.stats);
    },

    async getLogs(limit = 50) {
        return apiFetch(`${API_ENDPOINTS.logs}?limit=${limit}`);
    },

    async getReports(limit = 20) {
        return apiFetch(`${API_ENDPOINTS.reports}?limit=${limit}`);
    },

    async getRedirects(limit = 20) {
        return apiFetch(`${API_ENDPOINTS.redirects}?limit=${limit}`);
    },

    async submitReport(reportData) {
        return apiFetch(API_ENDPOINTS.report, {
            method: 'POST',
            body: JSON.stringify(reportData),
        });
    },

    async checkUrl(url) {
        return apiFetch(API_ENDPOINTS.checkUrl, {
            method: 'POST',
            body: JSON.stringify({ url }),
        });
    },

    async checkHealth() {
        return apiFetch(API_ENDPOINTS.health);
    },
};

export default api;
