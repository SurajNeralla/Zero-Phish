import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BeamsBackground } from './BeamsBackground';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [activeTab, setActiveTab] = useState(isSupabaseConfigured() ? 'email' : 'pin');

    const handleSupabaseAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setError('Check your email for the confirmation link!');
                setIsSignUp(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onLogin(data.session);
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePinAuth = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (pin === '2007') {
                onLogin({ user: { email: 'admin@zerophish.local' }, access_token: 'pin-auth' });
            } else {
                setError('Invalid PIN');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <BeamsBackground intensity="strong">
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <motion.div
                    className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Logo Section */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <ShieldCheck size={32} strokeWidth={1.5} className="text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-1">Zero Phish</h1>
                        <p className="text-neutral-400 text-sm">Admin Dashboard</p>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className={`mb-4 p-3 rounded-xl text-sm ${error.includes('email')
                                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                    }`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tab Switcher */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                        {isSupabaseConfigured() && (
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'email'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => setActiveTab('email')}
                            >
                                <Mail size={16} />
                                <span>Email</span>
                            </button>
                        )}
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'pin'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                            onClick={() => setActiveTab('pin')}
                        >
                            <Lock size={16} />
                            <span>PIN</span>
                        </button>
                    </div>

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'email' && isSupabaseConfigured() && (
                            <motion.form
                                key="email-form"
                                onSubmit={handleSupabaseAuth}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            placeholder="admin@zerophish.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>

                                <button
                                    type="button"
                                    className="w-full text-neutral-400 hover:text-blue-400 text-sm transition-colors"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    disabled={loading}
                                >
                                    {isSignUp ? 'Already have an account?' : 'Need an account?'}
                                </button>
                            </motion.form>
                        )}

                        {activeTab === 'pin' && (
                            <motion.form
                                key="pin-form"
                                onSubmit={handlePinAuth}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Security PIN</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-center text-2xl tracking-[0.5em]"
                                            placeholder="••••"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            maxLength={4}
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Unlock Dashboard</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <motion.div
                        className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/5 text-neutral-500 text-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <ShieldCheck size={12} />
                        <span>{isSupabaseConfigured() ? 'Secured by Supabase' : 'Development Mode'}</span>
                    </motion.div>
                </motion.div>
            </div>
        </BeamsBackground>
    );
};

export default Login;
