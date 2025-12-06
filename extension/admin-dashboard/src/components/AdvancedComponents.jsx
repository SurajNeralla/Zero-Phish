import React from 'react';
import { Moon, Sun } from 'lucide-react';
import './AdvancedUI.css';

// Text Shimmer Component (Adapted for Bootstrap/CSS)
export const TextShimmer = ({ children, className = '', duration = 2 }) => {
    return (
        <span
            className={`text-shimmer shimmer-dark ${className}`}
            style={{ animationDuration: `${duration}s` }}
        >
            {children}
        </span>
    );
};

// Theme Toggle Component (Adapted for Bootstrap/CSS)
export const ThemeToggle = ({ isDark, toggleTheme, className = '' }) => {
    return (
        <div
            className={`theme-toggle ${isDark ? 'dark' : 'light'} ${className}`}
            onClick={toggleTheme}
            role="button"
            tabIndex={0}
        >
            <div className="toggle-handle">
                {isDark ? (
                    <Moon size={16} className="text-white" />
                ) : (
                    <Sun size={16} className="text-secondary" />
                )}
            </div>
            {/* Background Icons for visual flair */}
            <div className="d-flex w-100 justify-content-between px-2" style={{ pointerEvents: 'none' }}>
                <span style={{ opacity: isDark ? 0 : 1 }}><Moon size={14} className="text-dark" /></span>
                <span style={{ opacity: isDark ? 1 : 0 }}><Sun size={14} className="text-secondary" /></span>
            </div>
        </div>
    );
};
