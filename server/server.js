require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'placeholder-key'
);

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for development
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
        endpoints: {
            stats: '/api/stats',
            logs: '/api/logs',
            report: '/api/report',
            redirect: '/api/redirect',
            health: '/api/health'
        }
    });
});

// 2. Health Check
app.get('/api/health', async (req, res) => {
    try {
        // Test Supabase connection
        const { error } = await supabase
            .from('phishing_reports')
            .select('id', { count: 'exact', head: true });

        if (error && error.code !== 'PGRST116') { // PGRST116 = empty table, which is fine
            throw error;
        }

        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// 3. Statistics (For Dashboard)
app.get('/api/stats', async (req, res) => {
    try {
        const { count: reportCount } = await supabase
            .from('phishing_reports')
            .select('*', { count: 'exact', head: true });

        const { count: redirectCount } = await supabase
            .from('redirect_chains')
            .select('*', { count: 'exact', head: true });

        const totalThreats = (reportCount || 0) + (redirectCount || 0);

        res.json({
            reports: reportCount || 0,
            redirects: redirectCount || 0,
            total: totalThreats,
            risk: totalThreats > 10 ? 'High' : totalThreats > 5 ? 'Moderate' : 'Low',
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

// 4. Activity Logs (For Dashboard)
app.get('/api/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const { data: reports, error: reportsError } = await supabase
            .from('phishing_reports')
            .select('id, url, title, timestamp')
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: redirects, error: redirectsError } = await supabase
            .from('redirect_chains')
            .select('id, chain, timestamp')
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);

        if (reportsError) throw reportsError;
        if (redirectsError) throw redirectsError;

        const allLogs = [
            ...(reports || []).map(r => ({ ...r, type: 'Report' })),
            ...(redirects || []).map(r => ({ ...r, type: 'Redirect' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        res.json({
            logs: allLogs,
            count: allLogs.length,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            error: 'Failed to fetch logs',
            message: error.message
        });
    }
});

// 5. Receive Phishing Report (From Extension)
app.post('/api/report', async (req, res) => {
    try {
        const { url, title, htmlSnippet, screenshot, userAgent } = req.body;

        // Validation
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        console.log('⚠️  Received Phishing Report:', url);

        const { data, error } = await supabase
            .from('phishing_reports')
            .insert([{
                url: url,
                title: title || null,
                html_snippet: htmlSnippet || null,
                screenshot: screenshot || null,
                user_agent: userAgent || null,
                timestamp: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Report saved successfully',
            id: data[0]?.id,
            timestamp: data[0]?.timestamp
        });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save report',
            message: error.message
        });
    }
});

// 6. Receive Redirect Warning (From Extension)
app.post('/api/redirect', async (req, res) => {
    try {
        const { chain } = req.body;

        // Validation
        if (!chain || !Array.isArray(chain) || chain.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid redirect chain is required'
            });
        }

        console.log(`🔄 Received Suspicious Redirect Chain (${chain.length} hops)`);

        const { data, error } = await supabase
            .from('redirect_chains')
            .insert([{
                chain: chain,
                timestamp: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Redirect chain logged successfully',
            id: data[0]?.id,
            chainLength: chain.length,
            timestamp: data[0]?.timestamp
        });
    } catch (error) {
        console.error('Error saving redirect:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log redirect chain',
            message: error.message
        });
    }
});

// 7. Get Recent Reports (with filtering)
app.get('/api/reports', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const { data, error } = await supabase
            .from('phishing_reports')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({
            reports: data || [],
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            error: 'Failed to fetch reports',
            message: error.message
        });
    }
});

// 8. Get Recent Redirects (with filtering)
app.get('/api/redirects', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const { data, error } = await supabase
            .from('redirect_chains')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({
            redirects: data || [],
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Error fetching redirects:', error);
        res.status(500).json({
            error: 'Failed to fetch redirects',
            message: error.message
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Zero Phish Backend Server`);
        console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`   🌐 Server:        http://localhost:${PORT}`);
        console.log(`   📊 Dashboard API: http://localhost:${PORT}/api/stats`);
        console.log(`   📝 Report API:    http://localhost:${PORT}/api/report`);
        console.log(`   🔄 Redirect API:  http://localhost:${PORT}/api/redirect`);
        console.log(`   ❤️  Health Check:  http://localhost:${PORT}/api/health`);
        console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`   🗄️  Database:      ${process.env.SUPABASE_URL ? '✓ Connected' : '✗ Not Configured'}`);
        console.log(`   🛡️  Status:        Ready\n`);
    });
}

// Export for serverless (Vercel, etc.)
module.exports = app;
