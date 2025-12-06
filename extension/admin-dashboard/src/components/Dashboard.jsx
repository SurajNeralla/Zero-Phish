import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, LogOut, ShieldAlert, Activity, FileText,
    CheckCircle, Shield, AlertTriangle, TrendingUp,
    Moon, Sun, Bell, Settings, Search, ExternalLink,
    Eye, Clock, Zap
} from 'lucide-react';
import AuroraBackground from './AuroraBackground';

const Dashboard = ({ onLogout, session }) => {
    const [stats, setStats] = useState({ reports: 0, redirects: 0, risk: 'Low' });
    const [logs, setLogs] = useState([]);
    const [isDark, setIsDark] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark', !isDark);
    };

    useEffect(() => {
        document.documentElement.classList.add('dark');
        const loadData = async () => {
            try {
                const statsRes = await fetch('http://localhost:3000/api/stats');
                const statsData = await statsRes.json();
                setStats(statsData);

                const logsRes = await fetch('http://localhost:3000/api/logs');
                const logsData = await logsRes.json();
                setLogs(logsData.logs || logsData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setStats({ reports: 0, redirects: 0, risk: 'Offline' });
            }
        };

        loadData();
        const interval = setInterval(loadData, 5000);
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
        </div>
    );
};

export default Dashboard;
