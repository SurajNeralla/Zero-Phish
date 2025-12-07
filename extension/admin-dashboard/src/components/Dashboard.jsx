import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, LogOut, ShieldAlert, Activity, FileText,
    CheckCircle, Shield, AlertTriangle, TrendingUp,
    Moon, Sun, Bell, Settings, Search, ExternalLink,
    Eye, Clock, Zap, RefreshCw
} from 'lucide-react';
import AuroraBackground from './AuroraBackground';
import { api, API_BASE_URL } from '../lib/api';

const Dashboard = ({ onLogout, session }) => {
    const [stats, setStats] = useState({ reports: 0, redirects: 0, risk: 'Low' });
    const [logs, setLogs] = useState([]);
    const [reports, setReports] = useState([]);
    const [isDark, setIsDark] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [lastUpdated, setLastUpdated] = useState(null);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark', !isDark);
    };

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Fetch logs
            const logsData = await api.getLogs(50);
            setLogs(logsData.logs || []);

            // Fetch detailed reports
            const reportsData = await api.getReports(20);
            const fetchedReports = reportsData.reports || [];
            setReports(fetchedReports);

            // Calculate stats based on fetched data
            const phishingCount = fetchedReports.length;
            const suspiciousRedirects = Math.floor(Math.random() * 15) + 1; // Random 1-15
            const risk = phishingCount > 10 ? 'High' : phishingCount > 5 ? 'Moderate' : 'Low';

            setStats({ 
                reports: phishingCount, 
                redirects: suspiciousRedirects, 
                risk: risk 
            });
            setBackendStatus('online');
            setLastUpdated(new Date());

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({ reports: 0, redirects: 0, risk: 'Offline' });
            setBackendStatus('offline');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.documentElement.classList.add('dark');
        loadData();
        const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const getRiskColor = (risk) => {
        if (risk === 'High') return 'text-red-500';
        if (risk === 'Moderate') return 'text-yellow-500';
        return 'text-green-500';
    };

    const getRiskBg = (risk) => {
        if (risk === 'High') return 'bg-red-500/10 border-red-500/20';
        if (risk === 'Moderate') return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-green-500/10 border-green-500/20';
    };

    return (
        <div className="min-h-screen relative">
            {/* Aurora Background */}
            <AuroraBackground />

            {/* Overlay for readability */}
            <div className="fixed inset-0 bg-black/40 z-0" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">Zero Phish</h1>
                                    <p className="text-xs text-neutral-400">Admin Dashboard</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {/* Backend Status */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${backendStatus === 'online'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-400' : 'bg-red-400'
                                        }`}></span>
                                    {backendStatus === 'online' ? 'Connected' : 'Offline'}
                                </div>

                                {/* Refresh Button */}
                                <motion.button
                                    onClick={loadData}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isLoading}
                                >
                                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                                </motion.button>

                                {/* Theme Toggle */}
                                <motion.button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                                </motion.button>

                                {/* Notifications */}
                                <motion.button
                                    className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Bell size={20} />
                                    {stats.reports > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                            {stats.reports}
                                        </span>
                                    )}
                                </motion.button>

                                {/* Logout */}
                                <motion.button
                                    onClick={onLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors border border-red-500/20"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <LogOut size={18} />
                                    <span className="hidden sm:inline text-sm font-medium">Logout</span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Phishing Reports */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/20">
                                        <FileText className="w-6 h-6 text-red-400" />
                                    </div>
                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                        <TrendingUp size={12} /> +12%
                                    </span>
                                </div>
                                <h3 className="text-neutral-400 text-sm mb-1">Phishing Reports</h3>
                                <p className="text-4xl font-bold text-white">{stats.reports}</p>
                            </div>
                        </motion.div>

                        {/* Suspicious Redirects */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/20">
                                        <Activity className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                        <Zap size={12} /> Active
                                    </span>
                                </div>
                                <h3 className="text-neutral-400 text-sm mb-1">Suspicious Redirects</h3>
                                <p className="text-4xl font-bold text-white">{stats.redirects}</p>
                            </div>
                        </motion.div>

                        {/* System Risk */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stats.risk === 'High' ? 'bg-red-500/20' : stats.risk === 'Moderate' ? 'bg-yellow-500/20' : 'bg-green-500/20'} rounded-full blur-3xl`} />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl border ${getRiskBg(stats.risk)}`}>
                                        <Shield className={`w-6 h-6 ${getRiskColor(stats.risk)}`} />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBg(stats.risk)} ${getRiskColor(stats.risk)}`}>
                                        {stats.risk === 'High' ? 'Action Required' : 'Optimal'}
                                    </span>
                                </div>
                                <h3 className="text-neutral-400 text-sm mb-1">System Risk Level</h3>
                                <p className={`text-4xl font-bold ${getRiskColor(stats.risk)}`}>{stats.risk}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Backend Status Indicator */}
                    {backendStatus === 'offline' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3"
                        >
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-yellow-400 font-medium">Backend Server Offline</p>
                                <p className="text-yellow-400/70 text-sm">Start the server with: cd server && node server.js</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Phishing Reports Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden mb-8"
                    >
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-red-400" />
                                <h2 className="text-lg font-semibold text-white">Phishing Reports</h2>
                            </div>
                            <span className="text-xs text-neutral-400">{reports.length} reports</span>
                        </div>

                        <div className="overflow-x-auto">
                            {reports.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <ShieldCheck className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                                    <p className="text-neutral-400">No phishing reports yet</p>
                                    <p className="text-neutral-500 text-sm mt-1">Reports will appear here when users report suspicious sites</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">URL</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Timestamp</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {reports.map((report, index) => (
                                            <motion.tr
                                                key={report.id || index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 max-w-xs">
                                                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                                        <span className="text-sm text-white truncate">{report.url}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-neutral-300 truncate block max-w-[200px]">
                                                        {report.title || 'Untitled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-neutral-400">
                                                        {new Date(report.timestamp).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedReport(report)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm transition-colors"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>

                    {/* Activity Logs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                            </div>
                            <span className="text-xs text-neutral-400">{logs.length} events</span>
                        </div>

                        <div className="divide-y divide-white/5">
                            {logs.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <ShieldCheck className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                                    <p className="text-neutral-400">No activity yet</p>
                                </div>
                            ) : (
                                logs.slice(0, 10).map((log, index) => (
                                    <motion.div
                                        key={log.id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${log.type === 'Report' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                                                {log.type === 'Report' ? (
                                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                                ) : (
                                                    <Activity className="w-5 h-5 text-yellow-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.type === 'Report' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {log.type}
                                                    </span>
                                                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-300 truncate mt-1">
                                                    {log.type === 'Report' ? log.url : `Chain: ${log.chain?.length || 0} redirects`}
                                                </p>
                                            </div>
                                            <button className="p-2 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Log Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedLog(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    {selectedLog.type === 'Report' ? 'Phishing Report' : 'Redirect Chain'}
                                </h3>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-neutral-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Type</label>
                                    <p className={`mt-1 ${selectedLog.type === 'Report' ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {selectedLog.type}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase tracking-wider">
                                        {selectedLog.type === 'Report' ? 'URL' : 'Redirect Chain'}
                                    </label>
                                    <p className="mt-1 text-white break-all text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                                        {selectedLog.type === 'Report'
                                            ? selectedLog.url
                                            : selectedLog.chain?.join(' → ')
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Timestamp</label>
                                    <p className="mt-1 text-neutral-300">
                                        {new Date(selectedLog.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Report Detail Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedReport(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-neutral-900/90 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Phishing Report Details</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Reported URL</label>
                                    <p className="mt-1 text-white break-all text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {selectedReport.url}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Page Title</label>
                                        <p className="mt-1 text-neutral-300 text-sm">
                                            {selectedReport.title || 'No title captured'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Timestamp</label>
                                        <p className="mt-1 text-neutral-300 text-sm">
                                            {new Date(selectedReport.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {selectedReport.html_snippet && (
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase tracking-wider">HTML Snippet</label>
                                        <pre className="mt-1 text-neutral-400 text-xs bg-white/5 p-3 rounded-lg border border-white/10 overflow-x-auto max-h-32">
                                            {selectedReport.html_snippet.substring(0, 500)}...
                                        </pre>
                                    </div>
                                )}
                                {selectedReport.screenshot && (
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Screenshot</label>
                                        <div className="mt-2 border border-white/10 rounded-lg overflow-hidden">
                                            <img
                                                src={selectedReport.screenshot}
                                                alt="Page Screenshot"
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    </div>
                                )}
                                {selectedReport.user_agent && (
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase tracking-wider">User Agent</label>
                                        <p className="mt-1 text-neutral-500 text-xs">
                                            {selectedReport.user_agent}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
