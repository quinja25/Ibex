import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Logo from '../Logo1.svg';
import { TryAiWidget } from '../components/TryAiWidget';
import './Waitlist.css';

const COUNTRIES = [
    'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
    'Austria','Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin',
    'Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
    'Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chad','Chile','China',
    'Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
    'Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland',
    'France','Georgia','Germany','Ghana','Greece','Guatemala','Honduras','Hong Kong',
    'Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
    'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia',
    'Lebanon','Libya','Liechtenstein','Lithuania','Luxembourg','Macau','Malaysia','Maldives',
    'Malta','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique',
    'Myanmar','Nepal','Netherlands','New Zealand','Nicaragua','Nigeria','North Korea',
    'North Macedonia','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines',
    'Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal',
    'Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea',
    'South Sudan','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan',
    'Tajikistan','Tanzania','Thailand','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine',
    'United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
    'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];


const PRIMARY_FEATURES = [
    {
        num: '01',
        label: 'AI built for IB',
        desc: 'Not adapted from generic tools. Built around command terms, HL/SL depth, and mark scheme conventions. It knows what "evaluate" means in IB context — and why that matters.',
        Mockup: AiMockup,
    },
    {
        num: '02',
        label: 'Learn from your own notes',
        desc: 'Upload your textbooks, teacher notes, and past papers. The AI answers questions drawing directly from your materials, with source citations you can verify.',
        Mockup: NotesMockup,
    },
    {
        num: '03',
        label: 'Study rooms built for focus',
        desc: 'HD video, collaborative whiteboard, and a Pomodoro timer that keeps the whole room on the same session. No tab-switching. No distractions.',
        Mockup: RoomMockup,
    },
];

const FAQ_ITEMS = [
    {
        q: 'Is Ibex free?',
        a: 'Yes — the core platform is free. AI chat, community Q&A, study rooms, streaks, and the wiki are all included at no cost. A Pro tier will unlock unlimited AI queries, document uploads, and spaced repetition. Pricing will be confirmed at launch.',
    },
    {
        q: 'Which IB subjects does it cover?',
        a: 'All six IB subject groups: Studies in Language & Literature, Language Acquisition, Individuals & Societies, Sciences, Mathematics, and the Arts. Economics, Biology, Chemistry, Physics, and Maths are fully indexed at launch — more subjects are being added continuously.',
    },
    {
        q: 'How is Ibex different from other AIs?',
        a: 'Other AIs are general-purpose tools. Ibex is purpose-built for IB — it understands command terms, HL/SL distinctions, and mark scheme conventions. It can answer directly from your uploaded notes and cites the specific source for every answer.',
    },
    {
        q: 'Can I use it for other curriculums?',
        a: 'The platform is designed primarily for IB Diploma students, but students on other curriculums studying overlapping subjects (Chemistry, Biology, Physics, Maths) will find most of the AI responses directly useful. Curriculum-specific support is on the roadmap.',
    },
    {
        q: 'Can I upload my own notes?',
        a: 'Yes. You can upload PDFs — textbooks, teacher notes, past papers — and the AI will answer questions by drawing directly from your documents, with citations showing exactly which file and section it referenced.',
    },
    {
        q: 'How do study rooms work?',
        a: 'Study rooms are live video sessions with HD video, a collaborative whiteboard, and a shared Pomodoro timer. You can invite classmates via a link. Everyone in the room runs on the same focus timer, keeping the session on track.',
    },
    {
        q: 'Do I need to sign up to try the AI?',
        a: 'No. You can ask the AI up to 3 questions per day without creating an account — just use the "Try it now" section on this page. Creating a free account removes that limit and unlocks study rooms, Q&A, and document uploads.',
    },
    {
        q: 'When does it launch?',
        a: "We haven't locked in a public date yet. Waitlist members will be the first to know — you'll get an email when your access is ready, no need to keep checking.",
    },
    {
        q: 'How do referral credits work?',
        a: 'Every friend who joins the waitlist using your link earns you 25 credits. When they create an account at launch, you get an additional 100 XP — credited automatically to your profile.',
    },
    {
        q: 'Is my data safe?',
        a: 'Yes. Documents you upload are stored securely and only used to answer your own queries. We never share your data with third parties or use it to train external AI models.',
    },
];

const SECONDARY_FEATURES = [
    {
        num: '04',
        label: 'Alumni mentors',
        desc: 'Connect with students who already passed your exact exams. Ask questions, get endorsed answers from people who know the mark scheme firsthand.',
    },
    {
        num: '05',
        label: 'Streaks and XP',
        desc: 'Build a daily study habit. Your streak lives on your public profile — the kind of social stakes that make consistency easier to maintain.',
    },
    {
        num: '06',
        label: 'Knowledge base',
        desc: 'Wiki articles, answered Q&A, peer-reviewed resources — all AI-indexed and instantly searchable across your subjects.',
    },
];


const useScrollReveal = () => {
    useEffect(() => {
        const els = document.querySelectorAll('.wl-reveal');
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting) {
                    const delay = parseInt(e.target.dataset.delay || '0', 10);
                    setTimeout(() => {
                        e.target.classList.add('wl-revealed');
                    }, delay);
                    observer.unobserve(e.target);
                }
            }),
            { threshold: 0.07, rootMargin: '0px 0px -28px 0px' }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);
};

const CountUp = ({ target }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        if (target <= 0) return;
        const duration = 1200;
        const steps = 40;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
        }, duration / steps);
        return () => clearInterval(timer);
    }, [target]);
    return <span ref={ref}>{count.toLocaleString()}</span>;
};

function AiMockup() {
    return (
        <div className="wl-feat-mockup">
            <div className="wl-mock-bar">
                <span className="wl-mock-dot" />
                <span className="wl-mock-dot" />
                <span className="wl-mock-dot" />
                <span className="wl-mock-title">Ibex AI</span>
            </div>
            <div className="wl-mock-body">
                <div className="wl-mock-q">
                    Explain Newton's Law of Gravitation for HL, using mark scheme language.
                </div>
                <div className="wl-mock-a">
                    <div className="wl-mock-a-text">
                        For <strong>HL</strong>, candidates must state the inverse-square law and derive{' '}
                        <em>g = GM/r²</em> from first principles. Mark scheme awards{' '}
                        <strong>[2]</strong> for correct substitution with units shown…
                    </div>
                    <div className="wl-mock-citation">
                        <span style={{ fontSize: '0.85rem' }}>📄</span>
                        IB Physics HL · Past Paper May 2023 · TZ1
                    </div>
                </div>
            </div>
        </div>
    );
}

function NotesMockup() {
    const files = [
        { name: 'Chemistry_Notes_SL.pdf',          size: '2.4 MB', status: 'indexed' },
        { name: 'Physics_Past_Papers_2019-24.pdf',  size: '8.1 MB', status: 'indexed' },
        { name: 'Biology_HL_Teacher_Notes.pdf',     size: '3.7 MB', status: 'indexing' },
    ];
    return (
        <div className="wl-feat-mockup">
            <div className="wl-mock-bar">
                <span className="wl-mock-dot" />
                <span className="wl-mock-dot" />
                <span className="wl-mock-dot" />
                <span className="wl-mock-title">My Documents</span>
            </div>
            <div className="wl-mock-body">
                {files.map(f => (
                    <div key={f.name} className="wl-mock-file">
                        <span className="wl-mock-file-icon">📄</span>
                        <div className="wl-mock-file-info">
                            <span className="wl-mock-file-name">{f.name}</span>
                            <span className="wl-mock-file-size">{f.size}</span>
                        </div>
                        <span className={`wl-mock-file-status wl-mock-file-status--${f.status}`}>
                            {f.status === 'indexed' ? '✓ Indexed' : 'Indexing…'}
                        </span>
                    </div>
                ))}
                <div className="wl-mock-upload-btn">+ Upload document</div>
            </div>
        </div>
    );
}

function RoomMockup() {
    const users = [
        { initials: 'AK', name: 'Aryan K.' },
        { initials: 'SL', name: 'Sofia L.' },
        { initials: 'JM', name: 'James M.' },
    ];
    return (
        <div className="wl-feat-mockup">
            <div className="wl-mock-bar">
                <span className="wl-mock-dot" />
                <span className="wl-mock-dot" />
                <span className="wl-mock-dot" />
                <span className="wl-mock-title">Physics Study Room · 3 online</span>
            </div>
            <div className="wl-mock-body">
                <div className="wl-mock-grid">
                    {users.map(u => (
                        <div key={u.initials} className="wl-mock-tile">
                            <div className="wl-mock-avatar">{u.initials}</div>
                            <div className="wl-mock-name">{u.name}</div>
                        </div>
                    ))}
                </div>
                <div className="wl-mock-controls">
                    <span className="wl-mock-ctrl wl-mock-ctrl--red">●</span>
                    <span className="wl-mock-ctrl">🎤</span>
                    <span className="wl-mock-ctrl">📹</span>
                    <span className="wl-mock-timer">25:00</span>
                </div>
            </div>
        </div>
    );
}

export const Waitlist = () => {
    useScrollReveal();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [openFaq, setOpenFaq]     = useState(null);
    const [email, setEmail]         = useState('');
    const [name, setName]           = useState('');
    const [country, setCountry]     = useState('');
    const [role, setRole]           = useState('student');
    const [status, setStatus]       = useState('idle'); // idle | loading | success | duplicate | error
    const [errorMsg, setErrorMsg]   = useState('');
    const [count, setCount]         = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [referredBy, setReferredBy]     = useState('');
    const [refStats, setRefStats]         = useState({ referralCount: 0, waitlistCredits: 0 });
    const [countries, setCountries]       = useState([]);
    const [copied, setCopied]             = useState(false);
    const [hasUrlRef, setHasUrlRef]       = useState(false);
    const [emailError, setEmailError]     = useState('');
    const [nameError, setNameError]       = useState('');
    const [countryError, setCountryError] = useState('');

    const DRAFT_KEY = 'ibex_waitlist_v1';

    // Persist draft on every field change
    useEffect(() => {
        if (status !== 'idle' && status !== 'loading') return;
        const draft = { name, email, country, role, referredBy };
        const isEmpty = !name && !email && !country;
        if (isEmpty) { localStorage.removeItem(DRAFT_KEY); return; }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, [name, email, country, role, referredBy, status]);

    const [draftBanner, setDraftBanner] = useState(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const restoreDraft = () => {
        if (!draftBanner) return;
        setName(draftBanner.name || '');
        setEmail(draftBanner.email || '');
        setCountry(draftBanner.country || '');
        setRole(draftBanner.role || 'student');
        if (!hasUrlRef && draftBanner.referredBy) setReferredBy(draftBanner.referredBy);
        setDraftBanner(null);
    };

    const dismissDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraftBanner(null);
    };

    const validateCountry = (val) => {
        if (!val.trim()) return 'Country is required.';
        if (!/^[a-zA-Z\s\-'.()]+$/.test(val.trim())) return 'Please enter country name in English.';
        return '';
    };

    const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'proton.me', 'naver.com', 'kakao.com'];

    const validateEmail = (val) => {
        if (!val.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Please enter a valid email address.';
        return '';
    };

    const localPart = email.includes('@') ? email.split('@')[0] : email;
    const emailSuggestions = localPart.length > 0
        ? EMAIL_DOMAINS.map(d => `${localPart}@${d}`)
        : [];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref && /^[a-f0-9]{8}$/.test(ref)) {
            setReferredBy(ref);
            setHasUrlRef(true);
        }

        const apiBase = process.env.REACT_APP_API_URL || '';
        fetch(`${apiBase}/public/waitlist/count`)
            .then(r => r.json())
            .then(d => setCount(d.count || 0))
            .catch(() => {});

        fetch(`${apiBase}/public/waitlist/countries`)
            .then(r => r.json())
            .then(d => setCountries(d.countries || []))
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || status === 'loading') return;
        setStatus('loading');
        setErrorMsg('');
        try {
            const apiBase = process.env.REACT_APP_API_URL || '';
            const res = await fetch(`${apiBase}/public/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), name: name.trim(), country: country.trim(), role, referredBy: referredBy || undefined }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || 'Something went wrong.');
                setStatus('error');
                return;
            }
            localStorage.removeItem(DRAFT_KEY);
            setDraftBanner(null);
            setCount(data.count || count + 1);
            if (data.referralCode) {
                setReferralCode(data.referralCode);
                window.gtag?.('event', 'waitlist_signup', { referred_by: referredBy || null, position: data.count });
            }
            setStatus(data.alreadyRegistered ? 'duplicate' : 'success');
            if (data.referralCode) {
                fetch(`${apiBase}/public/waitlist/ref/${data.referralCode}`)
                    .then(r => r.json())
                    .then(d => setRefStats({ referralCount: d.referralCount || 0, waitlistCredits: d.waitlistCredits || 0 }))
                    .catch(() => {});
            }
        } catch {
            setErrorMsg('Network error. Please try again.');
            setStatus('error');
        }
    };

    const referralLink = referralCode ? `${window.location.origin}/?ref=${referralCode}` : '';

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const shareOnX = () => {
        const text = encodeURIComponent(`Just joined the Ibex waitlist — AI built end-to-end for IB students 🎓 Join me:`);
        window.open(`https://x.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank', 'noopener');
    };

    const shareOnWhatsApp = () => {
        const text = encodeURIComponent(`I just joined Ibex — AI built for IB students. Join me: ${referralLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
    };

    const title = 'Ibex — Early Access · IB Study Platform';
    const desc  = 'The only AI study platform built end-to-end for IB. Join the waitlist for early access.';

    return (
        <div className="wl-page">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={desc} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={desc} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={desc} />
            </Helmet>

            {/* ── Nav ── */}
            <nav className="wl-nav" aria-label="Main navigation">
                <div className="wl-nav-inner">
                    <Link to="/" className="wl-logo">
                        <img src={Logo} alt="" className="wl-logo-img" />
                        <span className="wl-logo-name">Ibex</span>
                    </Link>
                    <div className="wl-nav-links">
                        <a href="#features">Features</a>
                        <a href="#try-ai">Ask Ibex</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <button
                        className={`wl-hamburger${mobileNavOpen ? ' wl-hamburger--open' : ''}`}
                        onClick={() => setMobileNavOpen(o => !o)}
                        aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileNavOpen}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
                {mobileNavOpen && (
                    <div className="wl-mobile-nav" role="navigation" aria-label="Mobile menu">
                        <a href="#features" onClick={() => setMobileNavOpen(false)}>Features</a>
                        <a href="#try-ai" onClick={() => setMobileNavOpen(false)}>Ask Ibex</a>
                        <a href="#faq" onClick={() => setMobileNavOpen(false)}>FAQ</a>
                    </div>
                )}
            </nav>

            {/* ── Hero ── */}
            <section className="wl-hero" aria-labelledby="hero-headline">
                <div className="wl-hero-glow wl-glow-1" aria-hidden="true" />
                <div className="wl-hero-glow wl-glow-2" aria-hidden="true" />

                <div className="wl-hero-inner">
                    <div className="wl-hero-copy">
                        <div className="wl-badge wl-reveal" data-delay="0">
                            <span className="wl-badge-dot" aria-hidden="true" />
                            Coming soon · We'll email you when access opens
                        </div>

                        <h1 id="hero-headline" className="wl-headline wl-reveal" data-delay="100">
                            The AI study platform<br />
                            <span className="wl-headline-accent">built for IB students.</span>
                        </h1>

                        <p className="wl-sub wl-reveal" data-delay="220">
                            Upload your notes. Study with classmates. Ask the AI that actually
                            knows what command terms mean. Get mentored by alumni who passed
                            your exact exams.
                        </p>

                        {count > 0 && (
                            <p className="wl-count-line wl-reveal" data-delay="340">
                                <span className="wl-count-arrow" aria-hidden="true">→</span>
                                <strong><CountUp target={count} /></strong>
                                <span>students already on the list</span>
                            </p>
                        )}
                    </div>

                    {/* ── Signup card ── */}
                    <div className="wl-card wl-reveal" data-delay="180">
                        {status === 'success' ? (
                            <div className="wl-success" role="status">
                                <div className="wl-success-mark" aria-hidden="true">✓</div>
                                <h3>You're in{name ? `, ${name.split(' ')[0]}` : ''}.</h3>
                                <p>We'll email you the moment access opens — no need to check back.</p>
                                {referralLink && (
                                    <div className="wl-referral-box">
                                        <div className="wl-referral-headline">
                                            <span className="wl-referral-icon" aria-hidden="true">🎁</span>
                                            <div>
                                                <p className="wl-referral-title">Move up the list. Earn rewards.</p>
                                                <p className="wl-referral-sub">Every friend who joins earns you <strong>25 credits</strong> + <strong>100 XP</strong> at launch — credited automatically.</p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        {refStats.referralCount >= 0 && (
                                            <div className="wl-referral-progress-wrap">
                                                <div className="wl-referral-progress-bar">
                                                    <div
                                                        className="wl-referral-progress-fill"
                                                        style={{ width: `${Math.min((refStats.referralCount / 5) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="wl-referral-progress-label">
                                                    {refStats.referralCount === 0
                                                        ? 'Refer 1 friend to unlock early access priority'
                                                        : refStats.referralCount < 5
                                                        ? `${refStats.referralCount}/5 friends referred · ${5 - refStats.referralCount} more for Pro trial`
                                                        : `${refStats.referralCount} friends referred 🎉 Pro trial unlocked`}
                                                </p>
                                            </div>
                                        )}

                                        {/* Milestones */}
                                        <div className="wl-referral-milestones">
                                            <div className={`wl-referral-milestone${refStats.referralCount >= 1 ? ' wl-referral-milestone--done' : ''}`}>
                                                <span className="wl-milestone-check">{refStats.referralCount >= 1 ? '✓' : '○'}</span>
                                                <span>1 friend → early access priority</span>
                                            </div>
                                            <div className={`wl-referral-milestone${refStats.referralCount >= 3 ? ' wl-referral-milestone--done' : ''}`}>
                                                <span className="wl-milestone-check">{refStats.referralCount >= 3 ? '✓' : '○'}</span>
                                                <span>3 friends → 75 credits + priority access</span>
                                            </div>
                                            <div className={`wl-referral-milestone${refStats.referralCount >= 5 ? ' wl-referral-milestone--done' : ''}`}>
                                                <span className="wl-milestone-check">{refStats.referralCount >= 5 ? '✓' : '○'}</span>
                                                <span>5 friends → 125 credits + 1 month Pro at launch</span>
                                            </div>
                                        </div>

                                        {/* Referral link */}
                                        <div className="wl-referral-link-row">
                                            <span className="wl-referral-link-text">{referralLink}</span>
                                            <button className="wl-referral-copy" onClick={handleCopy} aria-label="Copy referral link">
                                                {copied ? '✓ Copied' : 'Copy link'}
                                            </button>
                                        </div>

                                        {/* Share buttons */}
                                        <div className="wl-share-row">
                                            <button className="wl-share-btn wl-share-x" onClick={shareOnX} aria-label="Share on X">Share on X</button>
                                            <button className="wl-share-btn wl-share-wa" onClick={shareOnWhatsApp} aria-label="Share on WhatsApp">WhatsApp</button>
                                        </div>

                                        {refStats.referralCount > 0 && (
                                            <p className="wl-referral-stats">{refStats.referralCount} friend{refStats.referralCount !== 1 ? 's' : ''} referred · {refStats.waitlistCredits} credits earned</p>
                                        )}
                                    </div>
                                )}
                                <a href="#try-ai" className="wl-btn-primary wl-btn-full" style={{ marginTop: '1rem' }}>
                                    Ask Ibex while you wait →
                                </a>
                            </div>
                        ) : status === 'duplicate' ? (
                            <div className="wl-success" role="status">
                                <div className="wl-success-mark" aria-hidden="true">✓</div>
                                <h3>Already registered.</h3>
                                <p>You're already on the waitlist. We'll let you know when access opens.</p>
                                {referralLink && (
                                    <div className="wl-referral-box">
                                        <div className="wl-referral-headline">
                                            <span className="wl-referral-icon" aria-hidden="true">🎁</span>
                                            <div>
                                                <p className="wl-referral-title">Move up the list. Earn rewards.</p>
                                                <p className="wl-referral-sub">Every friend who joins earns you <strong>25 credits</strong> + <strong>100 XP</strong> at launch — credited automatically.</p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        {refStats.referralCount >= 0 && (
                                            <div className="wl-referral-progress-wrap">
                                                <div className="wl-referral-progress-bar">
                                                    <div
                                                        className="wl-referral-progress-fill"
                                                        style={{ width: `${Math.min((refStats.referralCount / 5) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="wl-referral-progress-label">
                                                    {refStats.referralCount === 0
                                                        ? 'Refer 1 friend to unlock early access priority'
                                                        : refStats.referralCount < 5
                                                        ? `${refStats.referralCount}/5 friends referred · ${5 - refStats.referralCount} more for Pro trial`
                                                        : `${refStats.referralCount} friends referred 🎉 Pro trial unlocked`}
                                                </p>
                                            </div>
                                        )}

                                        {/* Milestones */}
                                        <div className="wl-referral-milestones">
                                            <div className={`wl-referral-milestone${refStats.referralCount >= 1 ? ' wl-referral-milestone--done' : ''}`}>
                                                <span className="wl-milestone-check">{refStats.referralCount >= 1 ? '✓' : '○'}</span>
                                                <span>1 friend → early access priority</span>
                                            </div>
                                            <div className={`wl-referral-milestone${refStats.referralCount >= 3 ? ' wl-referral-milestone--done' : ''}`}>
                                                <span className="wl-milestone-check">{refStats.referralCount >= 3 ? '✓' : '○'}</span>
                                                <span>3 friends → 75 credits + priority access</span>
                                            </div>
                                            <div className={`wl-referral-milestone${refStats.referralCount >= 5 ? ' wl-referral-milestone--done' : ''}`}>
                                                <span className="wl-milestone-check">{refStats.referralCount >= 5 ? '✓' : '○'}</span>
                                                <span>5 friends → 125 credits + 1 month Pro at launch</span>
                                            </div>
                                        </div>

                                        {/* Referral link */}
                                        <div className="wl-referral-link-row">
                                            <span className="wl-referral-link-text">{referralLink}</span>
                                            <button className="wl-referral-copy" onClick={handleCopy} aria-label="Copy referral link">
                                                {copied ? '✓ Copied' : 'Copy link'}
                                            </button>
                                        </div>

                                        {/* Share buttons */}
                                        <div className="wl-share-row">
                                            <button className="wl-share-btn wl-share-x" onClick={shareOnX} aria-label="Share on X">Share on X</button>
                                            <button className="wl-share-btn wl-share-wa" onClick={shareOnWhatsApp} aria-label="Share on WhatsApp">WhatsApp</button>
                                        </div>

                                        {refStats.referralCount > 0 && (
                                            <p className="wl-referral-stats">{refStats.referralCount} friend{refStats.referralCount !== 1 ? 's' : ''} referred · {refStats.waitlistCredits} credits earned</p>
                                        )}
                                    </div>
                                )}
                                <a href="#try-ai" className="wl-btn-primary wl-btn-full">
                                    Ask Ibex now
                                </a>
                            </div>
                        ) : (
                            <>
                                {draftBanner && (
                                    <div className="wl-draft-banner" role="status">
                                        <p>Continue where you left off?</p>
                                        <div className="wl-draft-banner-actions">
                                            <button className="wl-draft-restore" onClick={restoreDraft}>Restore</button>
                                            <button className="wl-draft-dismiss" onClick={dismissDraft}>Dismiss</button>
                                        </div>
                                    </div>
                                )}
                                <div className="wl-card-header">
                                    <h2>Get early access</h2>
                                    <p>Be first when we open. No spam, ever.</p>
                                </div>
                                <form className="wl-form" onSubmit={handleSubmit} noValidate>
                                    <input
                                        className={`wl-input${nameError ? ' wl-input--error' : ''}`}
                                        type="text"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={e => { setName(e.target.value); if (nameError && e.target.value.trim()) setNameError(''); }}
                                        onBlur={e => setNameError(e.target.value.trim() ? '' : 'Name is required.')}
                                        required
                                        disabled={status === 'loading'}
                                        aria-label="Full name"
                                        autoComplete="name"
                                    />
                                    {nameError && (
                                        <p className="wl-field-error" role="alert">{nameError}</p>
                                    )}
                                    <input
                                        className={`wl-input${emailError ? ' wl-input--error' : ''}`}
                                        type="email"
                                        id="wl-email"
                                        list="email-suggestions"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                                        onBlur={e => setEmailError(validateEmail(e.target.value))}
                                        required
                                        disabled={status === 'loading'}
                                        aria-label="Email address"
                                        aria-describedby={emailError ? 'wl-email-error' : undefined}
                                        autoComplete="email"
                                    />
                                    <datalist id="email-suggestions">
                                        {emailSuggestions.map(s => <option key={s} value={s} />)}
                                    </datalist>
                                    {emailError && (
                                        <p id="wl-email-error" className="wl-field-error" role="alert">{emailError}</p>
                                    )}
                                    <input
                                        className={`wl-input${countryError ? ' wl-input--error' : ''}`}
                                        type="text"
                                        list="country-list"
                                        placeholder="Country"
                                        value={country}
                                        onChange={e => { setCountry(e.target.value); if (countryError) setCountryError(validateCountry(e.target.value)); }}
                                        onBlur={e => setCountryError(validateCountry(e.target.value))}
                                        required
                                        disabled={status === 'loading'}
                                        aria-label="Country"
                                        autoComplete="off"
                                    />
                                    <datalist id="country-list">
                                        {COUNTRIES.filter(c => c.toLowerCase().includes(country.toLowerCase()) && country.length > 0).map(c => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                    {countryError && (
                                        <p className="wl-field-error" role="alert">{countryError}</p>
                                    )}
                                    <select
                                        className="wl-select"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        disabled={status === 'loading'}
                                        aria-label="I am a"
                                    >
                                        <option value="student">Student</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {!hasUrlRef && (
                                        <input
                                            className="wl-input"
                                            type="text"
                                            placeholder="Referral code (optional)"
                                            value={referredBy}
                                            onChange={e => setReferredBy(e.target.value.trim().toLowerCase())}
                                            disabled={status === 'loading'}
                                            aria-label="Referral code"
                                            autoComplete="off"
                                            maxLength={8}
                                        />
                                    )}
                                    {status === 'error' && (
                                        <p className="wl-form-error" role="alert">{errorMsg}</p>
                                    )}
                                    <button
                                        type="submit"
                                        className="wl-btn-primary wl-btn-full"
                                        disabled={status === 'loading' || !email.trim() || !name.trim() || !country.trim() || !!emailError || !!nameError || !!countryError}
                                    >
                                        {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Signup count strip ── */}
            {count > 0 && (
                <div className="wl-stats-wrap">
                    <div className="wl-count-strip">
                        <div className="wl-count-strip-item">
                            <span className="wl-count-strip-val"><CountUp target={count} /></span>
                            <span className="wl-count-strip-label">students on the waitlist</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Country strip ── */}
            {countries.length > 0 && (
                <div className="wl-countries wl-reveal">
                    <span className="wl-countries-label">Students from</span>
                    <div className="wl-countries-list">
                        {countries.map(({ country: c, count: n }) => (
                            <span key={c} className="wl-country-chip">{c} <span className="wl-country-count">{n}</span></span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Features ── */}
            <section className="wl-features" id="features" aria-labelledby="features-title">
                <div className="wl-section-inner">
                    <span className="wl-section-tag wl-reveal">What you get</span>
                    <h2 id="features-title" className="wl-section-title wl-reveal">
                        Everything IB students need.<br />Nothing they don't.
                    </h2>

                    {/* Primary features — alternating rows */}
                    <div className="wl-feature-rows">
                        {PRIMARY_FEATURES.map((f, i) => (
                            <div
                                key={f.num}
                                className={`wl-feature-row wl-reveal${i % 2 === 1 ? ' wl-feature-row--flip wl-reveal--from-right' : ' wl-reveal--from-left'}`}
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <div className="wl-feature-row-text">
                                    <span className="wl-feature-row-num">{f.num}</span>
                                    <h3 className="wl-feature-row-title">{f.label}</h3>
                                    <p className="wl-feature-row-desc">{f.desc}</p>
                                </div>
                                <div className="wl-feature-row-visual" aria-hidden="true">
                                    <f.Mockup />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Secondary features — numbered grid */}
                    <div className="wl-features-secondary wl-reveal">
                        {SECONDARY_FEATURES.map(f => (
                            <div key={f.num} className="wl-features-secondary-item">
                                <span className="wl-feat-sec-num">{f.num}</span>
                                <div className="wl-feat-sec-title">{f.label}</div>
                                <p className="wl-feat-sec-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Try AI ── */}
            <div id="try-ai" className="wl-ai-wrap">
                <div className="wl-section-inner">
                    <span className="wl-section-tag wl-reveal">Try it now</span>
                    <h2 className="wl-section-title wl-reveal" style={{ marginBottom: '2rem' }}>
                        Ask Ibex anything.
                    </h2>
                </div>
                <TryAiWidget />
            </div>

            {/* ── FAQ ── */}
            <section className="wl-faq wl-reveal" id="faq" aria-labelledby="faq-title">
                <div className="wl-section-inner">
                    <span className="wl-section-tag">FAQ</span>
                    <h2 id="faq-title" className="wl-section-title">Common questions.</h2>
                    <div className="wl-faq-grid">
                        {FAQ_ITEMS.map(({ q, a }, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <div key={q} className={`wl-faq-item${isOpen ? ' wl-faq-item--open' : ''}`}>
                                    <button
                                        className="wl-faq-q"
                                        onClick={() => setOpenFaq(isOpen ? null : i)}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${i}`}
                                    >
                                        {q}
                                        <span className="wl-faq-chevron" aria-hidden="true">›</span>
                                    </button>
                                    <div
                                        className="wl-faq-answer-wrap"
                                        id={`faq-answer-${i}`}
                                        role="region"
                                        aria-labelledby={`faq-btn-${i}`}
                                    >
                                        <div className="wl-faq-answer-inner">
                                            <p className="wl-faq-a">{a}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="wl-cta wl-reveal">
                <div className="wl-cta-inner">
                    <h2 className="wl-cta-title">Your exams aren't waiting.<br />Your spot is.</h2>
                    <p className="wl-cta-sub">
                        Join {count > 0 ? count.toLocaleString() : 'hundreds of'} students already on the list.
                    </p>
                    <button
                        className="wl-btn-primary wl-btn-xl"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        aria-label="Scroll to top to join the waitlist"
                    >
                        Get early access
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="wl-footer">
                <div className="wl-footer-inner">
                    <img src={Logo} alt="" style={{ height: 26, width: 26, objectFit: 'none', objectPosition: 'left center', opacity: 0.45 }} />
                    <span className="wl-logo-name" style={{ opacity: 0.45, fontSize: '0.95rem' }}>Ibex</span>
                    <div className="wl-footer-links">
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms</a>
                    </div>
                    <div className="wl-footer-copy">© {new Date().getFullYear()} Ibex</div>
                </div>
            </footer>
        </div>
    );
};

export default Waitlist;
