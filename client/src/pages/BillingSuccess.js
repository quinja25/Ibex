import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './BillingSuccess.css';

export const BillingSuccess = () => {
    const navigate = useNavigate();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        api.get('/billing/status')
            .then(res => {
                if (res.data.isPro) {
                    try {
                        const raw = localStorage.getItem('userData');
                        if (raw) {
                            const u = JSON.parse(raw);
                            localStorage.setItem('userData', JSON.stringify({ ...u, isPro: true }));
                        }
                    } catch {}
                }
                setVerified(true);
            })
            .catch(() => setVerified(true));
    }, []);

    const FEATURES = [
        'Unlimited AI queries per day',
        'Unlimited document uploads',
        'Conversational AI memory',
        'Spaced Repetition deck',
        'Weekly progress email',
    ];

    return (
        <div className="bs-page">
            <div className="bs-card">
                <div className={`bs-check ${verified ? 'bs-check--visible' : ''}`} aria-hidden="true">
                    <svg viewBox="0 0 52 52" className="bs-checkmark">
                        <circle className="bs-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                        <path className="bs-checkmark-check" fill="none" d="M14 27l8 8 16-16" />
                    </svg>
                </div>
                <h1 className="bs-title">You're now Pro!</h1>
                <p className="bs-sub">Welcome to StudySphere Pro. Everything is unlocked.</p>
                <ul className="bs-features">
                    {FEATURES.map(f => (
                        <li key={f} className="bs-feature">
                            <span className="bs-feature-check">✓</span>
                            {f}
                        </li>
                    ))}
                </ul>
                <button className="bs-btn" onClick={() => navigate('/dashboard?tab=pro')}>
                    Go to Dashboard →
                </button>
            </div>
        </div>
    );
};

export default BillingSuccess;
