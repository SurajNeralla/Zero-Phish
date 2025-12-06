import React, { useEffect, useRef, useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import './AdvancedUI.css';

// Glowing Border Card Component
export const GlowCard = ({ children, className = '', ...props }) => {
    return (
        <Card className={`glow-border ${className}`} {...props}>
            {children}
        </Card>
    );
};

// Animated Card Stack Component
export const CardStack = ({ cards = [] }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const defaultCards = [
        {
            title: 'Active Protection',
            description: 'Real-time threat monitoring',
            icon: <Shield size={32} className="text-primary" />,
            badge: 'Live'
        },
        {
            title: 'Threat Analysis',
            description: 'AI-powered detection',
            icon: <Activity size={32} className="text-warning" />,
            badge: 'Processing'
        },
        {
            title: 'Security Reports',
            description: 'Comprehensive insights',
            icon: <TrendingUp size={32} className="text-success" />,
            badge: 'Updated'
        }
    ];

    const displayCards = cards.length > 0 ? cards : defaultCards;

    return (
        <div className="card-stack" style={{ minHeight: '250px' }}>
            {displayCards.map((card, index) => (
                <Card
                    key={index}
                    className="card-stack-item shadow-sm"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            {card.icon}
                            <Badge bg="primary">{card.badge}</Badge>
                        </div>
                        <Card.Title className="h5">{card.title}</Card.Title>
                        <Card.Text className="text-muted">{card.description}</Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

// Scroll Reveal Component
export const ScrollReveal = ({ children, className = '' }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${isVisible ? 'revealed' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

// Timeline Component
export const Timeline = ({ events = [] }) => {
    const defaultEvents = [
        {
            title: 'System Initialized',
            description: 'Zero Phish protection activated',
            time: '2 hours ago',
            icon: <CheckCircle size={20} />,
            color: 'success'
        },
        {
            title: 'Threat Detected',
            description: 'Suspicious redirect chain blocked',
            time: '1 hour ago',
            icon: <AlertTriangle size={20} />,
            color: 'warning'
        },
        {
            title: 'Report Submitted',
            description: 'Phishing attempt logged',
            time: '30 minutes ago',
            icon: <Shield size={20} />,
            color: 'danger'
        },
        {
            title: 'Analysis Complete',
            description: 'Security scan finished',
            time: '10 minutes ago',
            icon: <Activity size={20} />,
            color: 'info'
        },
        {
            title: 'All Clear',
            description: 'No active threats detected',
            time: 'Just now',
            icon: <CheckCircle size={20} />,
            color: 'success'
        }
    ];

    const displayEvents = events.length > 0 ? events : defaultEvents;

    return (
        <div className="timeline">
            {displayEvents.map((event, index) => (
                <div key={index} className="timeline-item">
                    <div className={`timeline-icon bg-${event.color} bg-opacity-25 border border-${event.color}`}>
                        {event.icon}
                    </div>
                    <div className="timeline-content">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">{event.title}</h6>
                            <small className="text-muted">{event.time}</small>
                        </div>
                        <p className="text-muted small mb-0">{event.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Gradient Border Card
export const GradientCard = ({ children, className = '', ...props }) => {
    return (
        <div className={`gradient-border p-4 ${className}`} {...props}>
            {children}
        </div>
    );
};

// Floating Animation Wrapper
export const FloatingElement = ({ children, className = '' }) => {
    return (
        <div className={`float-animation ${className}`}>
            {children}
        </div>
    );
};

// Shimmer Loading Effect
export const ShimmerCard = ({ className = '' }) => {
    return (
        <Card className={`${className}`}>
            <Card.Body>
                <div className="shimmer" style={{ height: '20px', borderRadius: '4px', marginBottom: '10px' }}></div>
                <div className="shimmer" style={{ height: '60px', borderRadius: '4px' }}></div>
            </Card.Body>
        </Card>
    );
};

// Perspective Card with 3D Effect
export const PerspectiveCard = ({ children, className = '', ...props }) => {
    const [transform, setTransform] = useState('');

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };

    const handleMouseLeave = () => {
        setTransform('');
    };

    return (
        <Card
            className={`perspective-card ${className}`}
            style={{ transform }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </Card>
    );
};

export default {
    GlowCard,
    CardStack,
    ScrollReveal,
    Timeline,
    GradientCard,
    FloatingElement,
    ShimmerCard,
    PerspectiveCard
};
