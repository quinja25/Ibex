import React, { useState, useEffect } from 'react';
import api from '../api';

// Module-level cache — avoids repeated fetches across component remounts
let _cachedStatus = null;

export const useProStatus = () => {
    const [state, setState] = useState({
        isPro: _cachedStatus?.isPro ?? false,
        proExpiresAt: _cachedStatus?.proExpiresAt ?? null,
        loading: _cachedStatus === null,
    });

    useEffect(() => {
        if (_cachedStatus !== null) return; // already fetched

        const userData = localStorage.getItem('userData');
        if (!userData) {
            setState({ isPro: false, proExpiresAt: null, loading: false });
            return;
        }

        api.get('/billing/status')
            .then(res => {
                _cachedStatus = res.data;
                setState({ isPro: res.data.isPro, proExpiresAt: res.data.proExpiresAt, loading: false });
            })
            .catch(() => {
                _cachedStatus = { isPro: false, proExpiresAt: null };
                setState({ isPro: false, proExpiresAt: null, loading: false });
            });
    }, []);

    return state;
};

export const ProBadge = ({ style }) => (
    <span style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
        color: '#fff',
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: '20px',
        verticalAlign: 'middle',
        ...style,
    }}>Pro</span>
);

export default ProBadge;
