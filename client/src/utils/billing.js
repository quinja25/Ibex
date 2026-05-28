const getToken = () => {
    try {
        return JSON.parse(localStorage.getItem('userData'))?.token || null;
    } catch { return null; }
};

export const startCheckout = async (plan = 'monthly', currency = 'usd') => {
    const token = getToken();
    if (!token) { window.location.href = '/login'; return; }
    try {
        const res = await fetch('/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ plan, currency }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
        else console.error('Checkout failed:', data.error);
    } catch (err) {
        console.error('Checkout error:', err);
    }
};

export const openPortal = async () => {
    const token = getToken();
    if (!token) { window.location.href = '/login'; return; }
    try {
        const res = await fetch('/billing/portal', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
        else console.error('Portal failed:', data.error);
    } catch (err) {
        console.error('Portal error:', err);
    }
};
