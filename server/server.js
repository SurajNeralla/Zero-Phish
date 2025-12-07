require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Local JSON file storage (fallback)
const DB_FILE = path.join(__dirname, 'db.json');

// Check if Supabase is configured
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const USE_SUPABASE = SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('placeholder');

// Initialize Supabase client if configured
let supabase = null;
if (USE_SUPABASE) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase configured');
} else {
    console.log('⚠️  Supabase not configured, using local storage (db.json)');
}

// Helper: Read local database
function readDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading db.json:', err);
    }
    return { reports: [], redirects: [], logs: [] };
}

// Helper: Write local database
function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing db.json:', err);
        return false;
    }
}

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// --- API Endpoints ---

// 1. Root Check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'Zero Phish Backend',
        version: '1.0.0',
        storage: USE_SUPABASE ? 'Supabase' : 'Local (db.json)',
        endpoints: {
            stats: '/api/stats',
            logs: '/api/logs',
            report: '/api/report',
            reports: '/api/reports',
            redirect: '/api/redirect',
            checkUrl: '/api/check-url',
            health: '/api/health'
        }
    });
});

// Google Safe Browsing API Configuration
const SAFE_BROWSING_API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
const SAFE_BROWSING_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

// Cache for URL checks (in-memory, resets on server restart)
const urlCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Check URL Safety Endpoint
app.post('/api/check-url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log('🔍 Checking URL:', url);

        // Check cache first
        const cached = urlCache.get(url);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log('📦 Cache hit for:', url);
            return res.json({ ...cached.result, cached: true });
        }

        // ALWAYS check heuristics first (for custom phishing domains)
        const heuristicResult = performHeuristicCheck(url);

        // If heuristics detected a threat, return immediately
        if (!heuristicResult.safe || heuristicResult.threat) {
            console.log('🚨 HEURISTIC THREAT DETECTED:', url);
            urlCache.set(url, { result: heuristicResult, timestamp: Date.now() });
            return res.json(heuristicResult);
        }

        // If no API key, return heuristic result (which is safe at this point)
        if (!SAFE_BROWSING_API_KEY) {
            console.log('⚠️ No Google Safe Browsing API key, using heuristics only');
            return res.json(heuristicResult);
        }

        // Query Google Safe Browsing API as additional check
        const response = await fetch(SAFE_BROWSING_URL + '?key=' + SAFE_BROWSING_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client: {
                    clientId: 'zerophish',
                    clientVersion: '1.0.0'
                },
                threatInfo: {
                    threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                    platformTypes: ['ANY_PLATFORM'],
                    threatEntryTypes: ['URL'],
                    threatEntries: [{ url: url }]
                }
            })
        });

        const data = await response.json();

        let result;
        if (data.matches && data.matches.length > 0) {
            // Threat found by Google!
            const threat = data.matches[0];
            result = {
                safe: false,
                threat: true,
                isPhishing: true,
                threatType: threat.threatType,
                platformType: threat.platformType,
                message: `This URL has been flagged as ${threat.threatType.replace(/_/g, ' ').toLowerCase()}`
            };
            console.log('🚨 GOOGLE API THREAT DETECTED:', url, threat.threatType);
        } else {
            result = {
                safe: true,
                threat: false,
                message: 'No threats detected'
            };
            console.log('✅ URL is safe:', url);
        }

        // Cache the result
        urlCache.set(url, { result, timestamp: Date.now() });

        res.json(result);
    } catch (error) {
        console.error('Error checking URL:', error);
        res.status(500).json({ error: 'Failed to check URL', message: error.message });
    }
});

// Heuristic check when API key is not available
function performHeuristicCheck(url) {
    const urlLower = url.toLowerCase();

    // 1. High Risk Patterns (Trigger Full Overlay)
    const highRiskPatterns = [
        /phishing/i,
        /malware/i,
        /fake-login/i,
        /testsafebrowsing\.appspot\.com/i,
        /[?&]phish=true/i,
        /adventure-nicaragua\.net/i,  // Known phishing domain
        /5movierulz\.dental/i  // Known phishing domain
    ];

    for (const pattern of highRiskPatterns) {
        if (pattern.test(url)) {
            return {
                safe: false,
                threat: true,
                isPhishing: true,
                threatType: 'PHISHING', // Triggers Overlay
                message: 'High-confidence phishing pattern detected',
                heuristic: true
            };
        }
    }

    // 2. Medium Risk / Suspicious Patterns (Trigger Banner)
    const mediumRiskPatterns = [
        /suspicious/i,
        /account-verify/i,
        /secure-update/i,
        /bank.*login/i,
        /paypal.*verify/i,
        /login/i, // Broad match - careful
        /verify/i
    ];

    for (const pattern of mediumRiskPatterns) {
        if (pattern.test(url)) {
            return {
                safe: false,
                threat: 'medium',
                suspicious: true,
                threatType: 'SUSPICIOUS', // Triggers Banner
                message: 'Suspicious URL pattern detected',
                heuristic: true
            };
        }
    }

    // Check for HTTP (not HTTPS) on sensitive domains
    if (url.startsWith('http://') && /login|bank|account|verify|secure/i.test(url)) {
        return {
            safe: false,
            threat: 'medium',
            suspicious: true,
            threatType: 'SUSPICIOUS', // Banner for HTTP/Sensitive
            message: 'Sensitive page without HTTPS encryption',
            heuristic: true
        };
    }

    return {
        safe: true,
        threat: false,
        message: 'No threats detected (heuristic check)',
        heuristic: true
    };
}

// 2. Health Check
app.get('/api/health', async (req, res) => {
    let supabaseStatus = 'disconnected';
    let storageType = 'Local';

    if (USE_SUPABASE) {
        try {
            const { error } = await supabase
                .from('phishing_reports')
                .select('id', { count: 'exact', head: true });

            if (error && error.code !== 'PGRST116') throw error;
            supabaseStatus = 'connected';
            storageType = 'Supabase';
        } catch (error) {
            console.warn('⚠️ Supabase health check failed:', error.message);
            // Fallback to local
        }
    }

    // Always check local DB too
    try {
        const db = readDB();
        res.json({
            status: 'healthy', // healthy because we have fallback
            storage: storageType,
            supabase_status: supabaseStatus,
            reports: db.reports.length,
            redirects: db.redirects.length,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(503).json({
            status: 'unhealthy',
            error: err.message
        });
    }
});

// 3. Statistics
app.get('/api/stats', async (req, res) => {
    try {
        let reportCount = 0, redirectCount = 0;
        let fetchedFromSupabase = false;

        if (USE_SUPABASE) {
            try {
                const { count: rCount } = await supabase
                    .from('phishing_reports')
                    .select('*', { count: 'exact', head: true });
                const { count: rdCount } = await supabase
                    .from('redirect_chains')
                    .select('*', { count: 'exact', head: true });
                reportCount = rCount || 0;
                redirectCount = rdCount || 0;
                fetchedFromSupabase = true;
            } catch (error) {
                console.warn('⚠️ Supabase stats fetch failed, falling back to local storage:', error.message);
            }
        }

        if (!fetchedFromSupabase) {
            const db = readDB();
            reportCount = db.reports.length;
            redirectCount = db.redirects.length;
        }

        const totalThreats = reportCount + redirectCount;
        res.json({
            reports: reportCount,
            redirects: redirectCount,
            total: totalThreats,
            risk: totalThreats > 10 ? 'High' : totalThreats > 5 ? 'Moderate' : 'Low',
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
    }
});

// 4. Activity Logs
app.get('/api/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        let allLogs = [];
        let fetchedFromSupabase = false;

        if (USE_SUPABASE) {
            try {
                const { data: reports } = await supabase
                    .from('phishing_reports')
                    .select('id, url, title, timestamp')
                    .order('timestamp', { ascending: false })
                    .limit(limit);
                const { data: redirects } = await supabase
                    .from('redirect_chains')
                    .select('id, chain, timestamp')
                    .order('timestamp', { ascending: false })
                    .limit(limit);

                allLogs = [
                    ...(reports || []).map(r => ({ ...r, type: 'Report' })),
                    ...(redirects || []).map(r => ({ ...r, type: 'Redirect' }))
                ];
                fetchedFromSupabase = true;
            } catch (error) {
                console.warn('⚠️ Supabase logs fetch failed, falling back to local storage:', error.message);
            }
        }

        if (!fetchedFromSupabase) {
            const db = readDB();
            allLogs = [
                ...db.reports.map(r => ({ ...r, type: 'Report' })),
                ...db.redirects.map(r => ({ ...r, type: 'Redirect' }))
            ];
        }

        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json({ logs: allLogs.slice(0, limit), count: allLogs.length, limit });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs', message: error.message });
    }
});

// 5. Receive Phishing Report
app.post('/api/report', async (req, res) => {
    const { url, title, htmlSnippet, screenshot, userAgent, timestamp, category, description, severity } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
    }

    console.log('⚠️  Received Phishing Report:', url);

    const newReport = {
        url: url,
        title: title || null,
        html_snippet: htmlSnippet || null,
        screenshot: screenshot || null,
        user_agent: userAgent || null,
        timestamp: timestamp || new Date().toISOString(),
        category: category || 'General',
        description: description || null,
        severity: severity || 'Medium'
    };

    // Try Supabase first (if configured)
    if (USE_SUPABASE) {
        try {
            const { data, error } = await supabase
                .from('phishing_reports')
                .insert([newReport])
                .select();

            if (error) throw error;
            console.log('✅ Report saved to Supabase');
            return res.json({
                success: true,
                message: 'Report saved to Supabase',
                id: data[0]?.id,
                timestamp: data[0]?.timestamp,
                report: data[0] // Return full report for UI update
            });
        } catch (error) {
            console.warn('⚠️ Supabase failed, falling back to local storage:', error.message);
            // Proceed to local storage fallback below
        }
    }

    // Local Storage Fallback
    try {
        const db = readDB();
        newReport.id = Date.now();
        db.reports.push(newReport);
        writeDB(db);
        console.log('✅ Report saved to db.json (fallback)');
        res.json({
            success: true,
            storage: 'local_fallback',
            message: 'Report saved locally (fallback)',
            id: newReport.id,
            timestamp: newReport.timestamp,
            report: newReport // Return full report for UI update
        });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ success: false, error: 'Failed to save report', message: error.message });
    }
});

// 6. Receive Redirect Warning
app.post('/api/redirect', async (req, res) => {
    const { chain } = req.body;

    if (!chain || !Array.isArray(chain) || chain.length === 0) {
        return res.status(400).json({ success: false, error: 'Valid redirect chain is required' });
    }

    console.log(`🔄 Received Suspicious Redirect Chain (${chain.length} hops)`);

    if (USE_SUPABASE) {
        try {
            const { data, error } = await supabase
                .from('redirect_chains')
                .insert([{ chain, timestamp: new Date().toISOString() }])
                .select();

            if (error) throw error;
            console.log('✅ Redirect saved to Supabase');
            return res.json({ success: true, id: data[0]?.id, chainLength: chain.length });
        } catch (error) {
            console.warn('⚠️ Supabase failed, falling back to local storage:', error.message);
        }
    }

    // Local Storage Fallback
    try {
        const db = readDB();
        const newRedirect = { id: Date.now(), chain, timestamp: new Date().toISOString() };
        db.redirects.push(newRedirect);
        writeDB(db);
        console.log('✅ Redirect saved to db.json (fallback)');
        res.json({ success: true, id: newRedirect.id, chainLength: chain.length });
    } catch (error) {
        console.error('Error saving redirect:', error);
        res.status(500).json({ success: false, error: 'Failed to log redirect chain', message: error.message });
    }
});

// 7. Get Reports
app.get('/api/reports', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        let reports = [];
        let fetchedFromSupabase = false;

        if (USE_SUPABASE) {
            try {
                const { data, error } = await supabase
                    .from('phishing_reports')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(limit);
                if (error) throw error;
                reports = data || [];
                fetchedFromSupabase = true;
            } catch (error) {
                console.warn('⚠️ Supabase fetch failed, falling back to local storage:', error.message);
                // Fallback will happen below
            }
        }

        if (!fetchedFromSupabase) {
            const db = readDB();
            reports = db.reports
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        }

        res.json({ reports, count: reports.length });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
    }
});

// 8. Get Redirects
app.get('/api/redirects', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        let redirects = [];
        let fetchedFromSupabase = false;

        if (USE_SUPABASE) {
            try {
                const { data, error } = await supabase
                    .from('redirect_chains')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(limit);
                if (error) throw error;
                redirects = data || [];
                fetchedFromSupabase = true;
            } catch (error) {
                console.warn('⚠️ Supabase fetch failed, falling back to local storage:', error.message);
            }
        }

        if (!fetchedFromSupabase) {
            const db = readDB();
            redirects = db.redirects
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        }

        res.json({ redirects, count: redirects.length });
    } catch (error) {
        console.error('Error fetching redirects:', error);
        res.status(500).json({ error: 'Failed to fetch redirects', message: error.message });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path, method: req.method });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start Server
if (require.main === module) {
    if (!fs.existsSync(DB_FILE)) {
        writeDB({ reports: [], redirects: [], logs: [] });
    }

    app.listen(PORT, () => {
        console.log(`\n🚀 Zero Phish Backend Server`);
        console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`   🌐 Server:        http://localhost:${PORT}`);
        console.log(`   🗄️  Storage:       ${USE_SUPABASE ? 'Supabase' : 'Local (db.json)'}`);
        console.log(`   🛡️  Status:        Ready\n`);
    });
}

module.exports = app;
