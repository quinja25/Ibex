import React, { useState } from 'react';
import { startCheckout } from '../utils/billing';
import './ProGate.css';

const getIsPro = () => {
    try {
        return JSON.parse(localStorage.getItem('userData'))?.isPro === true;
    } catch { return false; }
};

export const ProGate = ({ feature, children, fallback }) => {
    const [loading, setLoading] = useState(false);

    if (getIsPro()) return children;
    if (fallback) return fallback;

    const handleUpgrade = async () => {
        setLoading(true);
        await startCheckout('monthly');
        setLoading(false);
    };

    return (
        <div className="progate-overlay">
            <div className="progate-card">
                <div className="progate-badge">Pro</div>
                <h3 className="progate-title">{feature || 'Pro Feature'}</h3>
                <p className="progate-desc">
                    This feature is available on StudySphere Pro. Upgrade for unlimited AI queries,
                    document uploads, Spaced Repetition, and more.
                </p>
                <button
                    className="progate-btn"
                    onClick={handleUpgrade}
                    disabled={loading}
                >
                    {loading ? 'Redirecting…' : 'Upgrade to Pro — $7/mo'}
                </button>
                <p className="progate-note">Cancel anytime · $59/yr saves 30%</p>
            </div>
        </div>
    );
};

export default ProGate;
