import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from 'react-bootstrap';
import { cn } from '../lib/utils';

export function ServerManagementTable({ logs = [], isDark = true }) {
    const [selectedLog, setSelectedLog] = useState(null);

    const openLogModal = (log) => {
        setSelectedLog(log);
    };

    const closeLogModal = () => {
        setSelectedLog(null);
    };

    const getTypeIcon = (type) => {
        return type === 'Report' ? (
            <div className="d-flex align-items-center justify-center p-2 rounded-circle" style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                width: '32px',
                height: '32px'
            }}>
                <AlertTriangle size={18} className="text-white" />
            </div>
        ) : (
            <div className="d-flex align-items-center justify-center p-2 rounded-circle" style={{
                background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                width: '32px',
                height: '32px'
            }}>
                <Shield size={18} className="text-white" />
            </div>
        );
    };

    const getStatusBadge = (type) => {
        return type === 'Report' ? (
            <Badge bg="danger" className="px-3 py-2">
                <span className="text-white">Phishing</span>
            </Badge>
        ) : (
            <Badge bg="warning" className="px-3 py-2">
                <span className="text-white">Redirect</span>
            </Badge>
        );
    };

    const getStatusGradient = (type) => {
        return type === 'Report'
            ? 'linear-gradient(90deg, rgba(220, 53, 69, 0.1) 0%, transparent 100%)'
            : 'linear-gradient(90deg, rgba(255, 193, 7, 0.1) 0%, transparent 100%)';
    };

    return (
        <div className="w-100">
            <div className="position-relative border rounded-3 p-4" style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-card)'
            }}>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px', animation: 'pulse 2s infinite' }} />
                            <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Recent Activity Logs</h5>
                        </div>
                        <small style={{ color: 'var(--text-secondary)' }}>
                            {logs.filter(l => l.type === 'Report').length} Reports • {logs.filter(l => l.type === 'Redirect').length} Redirects
                        </small>
                    </div>
                </div>

                {/* Table */}
                <motion.div
                    className="d-flex flex-column gap-2"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.08,
                                delayChildren: 0.1,
                            }
                        }
                    }}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Headers */}
                    <div className="row g-3 px-3 py-2 text-uppercase small fw-medium" style={{ color: 'var(--text-secondary)' }}>
                        <div className="col-1">No</div>
                        <div className="col-2">Type</div>
                        <div className="col-4">Details</div>
                        <div className="col-2">Time</div>
                        <div className="col-2">Status</div>
                        <div className="col-1"></div>
                    </div>

                    {/* Log Rows */}
                    {logs.length > 0 ? logs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    x: -25,
                                    scale: 0.95,
                                    filter: "blur(4px)"
                                },
                                visible: {
                                    opacity: 1,
                                    x: 0,
                                    scale: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 28,
                                        mass: 0.6,
                                    },
                                },
                            }}
                            className="position-relative"
                            style={{ cursor: 'pointer' }}
                            onClick={() => openLogModal(log)}
                        >
                            <motion.div
                                className="position-relative rounded-3 p-3 overflow-hidden"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)'
                                }}
                                whileHover={{
                                    y: -1,
                                    transition: { type: "spring", stiffness: 400, damping: 25 }
                                }}
                            >
                                {/* Status gradient overlay */}
                                <div
                                    className="position-absolute top-0 end-0 bottom-0"
                                    style={{
                                        background: getStatusGradient(log.type),
                                        width: '30%',
                                        pointerEvents: 'none'
                                    }}
                                />

                                {/* Grid Content */}
                                <div className="position-relative row g-3 align-items-center">
                                    {/* Number */}
                                    <div className="col-1">
                                        <span className="fs-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Type */}
                                    <div className="col-2 d-flex align-items-center gap-2">
                                        {getTypeIcon(log.type)}
                                        <span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{log.type}</span>
                                    </div>

                                    {/* Details */}
                                    <div className="col-4">
                                        <span className="text-truncate d-block small font-monospace" style={{ color: 'var(--text-primary)' }}>
                                            {log.type === 'Report' ? log.url : `Chain of ${log.chain?.length || 0} redirects`}
                                        </span>
                                    </div>

                                    {/* Time */}
                                    <div className="col-2">
                                        <span className="small" style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className="col-2">
                                        {getStatusBadge(log.type)}
                                    </div>

                                    {/* Action */}
                                    <div className="col-1 text-end">
                                        <CheckCircle size={16} className="text-success" />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-5 text-muted">
                            <Shield size={48} className="mb-3 opacity-50" />
                            <p>No activity recorded yet.</p>
                        </div>
                    )}
                </motion.div>

                {/* Log Details Modal */}
                <AnimatePresence>
                    {selectedLog && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column rounded-3 overflow-hidden"
                            style={{
                                background: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(10px)',
                                zIndex: 10
                            }}
                        >
                            {/* Header */}
                            <div className="p-4 border-bottom d-flex align-items-center justify-content-between" style={{
                                background: 'linear-gradient(90deg, var(--bg-surface) 0%, transparent 100%)',
                                borderColor: 'var(--border-color)'
                            }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="fs-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>
                                        {String(logs.indexOf(selectedLog) + 1).padStart(2, '0')}
                                    </div>
                                    {getTypeIcon(selectedLog.type)}
                                    <div>
                                        <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{selectedLog.type} Details</h5>
                                        <small style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(selectedLog.timestamp).toLocaleString()}
                                        </small>
                                    </div>
                                </div>

                                <motion.button
                                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)'
                                    }}
                                    onClick={closeLogModal}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <X size={16} />
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="flex-grow-1 p-4 overflow-auto">
                                <div className="row g-3">
                                    {/* URL/Details */}
                                    <div className="col-12">
                                        <div className="p-3 rounded-3" style={{
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <label className="small fw-medium text-uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                {selectedLog.type === 'Report' ? 'Reported URL' : 'Redirect Chain'}
                                            </label>
                                            <div className="small font-monospace" style={{ color: 'var(--text-primary)' }}>
                                                {selectedLog.type === 'Report' ? (
                                                    <div className="text-break">{selectedLog.url}</div>
                                                ) : (
                                                    <div>
                                                        {selectedLog.chain?.map((url, i) => (
                                                            <div key={i} className="mb-1">
                                                                <span className="me-2" style={{ color: 'var(--text-secondary)' }}>{i + 1}.</span>
                                                                <span className="text-break">{url}</span>
                                                            </div>
                                                        )) || 'No chain data'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <label className="small fw-medium text-muted text-uppercase mb-2">
                                                Timestamp
                                            </label>
                                            <div className="small">
                                                {new Date(selectedLog.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <label className="small fw-medium text-muted text-uppercase mb-2">
                                                Status
                                            </label>
                                            <div className="mt-1">
                                                {getStatusBadge(selectedLog.type)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
