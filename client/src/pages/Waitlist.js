import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Logo from '../Logo1.svg';
import { TryAiWidget } from '../components/TryAiWidget';
import './Waitlist.css';


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
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref && /^[a-f0-9]{8}$/.test(ref)) setReferredBy(ref);

        fetch('/public/waitlist/count')
            .then(r => r.json())
            .then(d => setCount(d.count || 0))
            .catch(() => {});

        fetch('/public/waitlist/countries')
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
            const res = await fetch('/public/waitlist', {
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
            setCount(data.count || count + 1);
            if (data.referralCode) {
                setReferralCode(data.referralCode);
                window.gtag?.('event', 'waitlist_signup', { referred_by: referredBy || null, position: data.count });
            }
            setStatus(data.alreadyRegistered ? 'duplicate' : 'success');
            if (data.referralCode && !data.alreadyRegistered) {
                fetch(`/public/waitlist/ref/${data.referralCode}`)
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
                        <a href="#try-ai">Try the AI</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div className="wl-nav-actions">
                        <Link to="/login" className="wl-btn-ghost">Log in</Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="wl-hero" aria-labelledby="hero-headline">
                <div className="wl-hero-glow wl-glow-1" aria-hidden="true" />
                <div className="wl-hero-glow wl-glow-2" aria-hidden="true" />

                <div className="wl-hero-inner">
                    <div className="wl-hero-copy">
                        <div className="wl-badge wl-reveal">
                            <span className="wl-badge-dot" aria-hidden="true" />
                            Coming soon · We'll email you when access opens
                        </div>

                        <h1 id="hero-headline" className="wl-headline wl-reveal">
                            The AI study platform<br />
                            <span className="wl-headline-accent">built for IB students.</span>
                        </h1>

                        <p className="wl-sub wl-reveal">
                            Upload your notes. Study with classmates. Ask the AI that actually
                            knows what command terms mean. Get mentored by alumni who passed
                            your exact exams.
                        </p>

                        {count > 0 && (
                            <p className="wl-count-line wl-reveal">
                                <span className="wl-count-arrow" aria-hidden="true">→</span>
                                <strong><CountUp target={count} /></strong>
                                <span>students already on the list</span>
                            </p>
                        )}
                    </div>

                    {/* ── Signup card ── */}
                    <div className="wl-card wl-reveal">
                        {status === 'success' ? (
                            <div className="wl-success" role="status">
                                <div className="wl-success-mark" aria-hidden="true">✓</div>
                                <h3>You're on the list.</h3>
                                <p>You're <strong>#{count.toLocaleString()}</strong> in line. Check your email for confirmation.</p>
                                {referralLink && (
                                    <div className="wl-referral-box">
                                        <p className="wl-referral-label">Invite friends — earn <strong>25 credits</strong> per signup, <strong>100 XP</strong> when they join</p>
                                        <div className="wl-referral-link-row">
                                            <span className="wl-referral-link-text">{referralLink}</span>
                                            <button className="wl-referral-copy" onClick={handleCopy} aria-label="Copy referral link">
                                                {copied ? '✓ Copied' : 'Copy'}
                                            </button>
                                        </div>
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
                                    Try the AI now
                                </a>
                            </div>
                        ) : status === 'duplicate' ? (
                            <div className="wl-success" role="status">
                                <div className="wl-success-mark" aria-hidden="true">✓</div>
                                <h3>Already registered.</h3>
                                <p>You're already on the waitlist. We'll let you know when access opens.</p>
                                <a href="#try-ai" className="wl-btn-primary wl-btn-full">
                                    Try the AI now
                                </a>
                            </div>
                        ) : (
                            <>
                                <div className="wl-card-header">
                                    <h2>Get early access</h2>
                                    <p>Be first when we open. No spam, ever.</p>
                                </div>
                                <form className="wl-form" onSubmit={handleSubmit} noValidate>
                                    <input
                                        className="wl-input"
                                        type="text"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        disabled={status === 'loading'}
                                        aria-label="Full name"
                                        autoComplete="name"
                                    />
                                    <input
                                        className="wl-input"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        disabled={status === 'loading'}
                                        aria-label="Email address"
                                        autoComplete="email"
                                    />
                                    <div className="wl-form-row">
                                        <input
                                            className="wl-input"
                                            type="text"
                                            placeholder="Country"
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                            required
                                            disabled={status === 'loading'}
                                            aria-label="Country"
                                            autoComplete="country-name"
                                        />
                                        <select
                                            className="wl-select"
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                            disabled={status === 'loading'}
                                            aria-label="I am a"
                                        >
                                            <option value="student">Student</option>
                                            <option value="alumni">Alumni / Mentor</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    {status === 'error' && (
                                        <p className="wl-form-error" role="alert">{errorMsg}</p>
                                    )}
                                    <button
                                        type="submit"
                                        className="wl-btn-primary wl-btn-full"
                                        disabled={status === 'loading' || !email.trim() || !name.trim() || !country.trim()}
                                    >
                                        {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
                                    </button>
                                </form>
                                <p className="wl-card-note">
                                    Already have an account? <Link to="/login">Log in</Link>
                                </p>
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
                                className={`wl-feature-row wl-reveal${i % 2 === 1 ? ' wl-feature-row--flip' : ''}`}
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
                        Ask the IB AI anything.
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
                        {[
                            {
                                q: 'Is Ibex free?',
                                a: 'Yes — the core platform is free. AI chat, community Q&A, study rooms, streaks, and the wiki are all included at no cost. A Pro tier will unlock unlimited AI queries, document uploads, and spaced repetition. Pricing will be confirmed at launch.',
                            },
                            {
                                q: 'Which IB subjects does it cover?',
                                a: 'All six IB subject groups: Studies in Language & Literature, Language Acquisition, Individuals & Societies, Sciences, Mathematics, and the Arts. Economics, Biology, Chemistry, Physics, and Maths are fully indexed at launch — more subjects are being added continuously.',
                            },
                            {
                                q: 'How is Ibex different from ChatGPT?',
                                a: 'ChatGPT is a general-purpose tool. Ibex is purpose-built for IB — it understands command terms, HL/SL distinctions, and mark scheme conventions. It can answer directly from your uploaded notes and cites the specific source for every answer.',
                            },
                            {
                                q: 'Can I use it for A-Level?',
                                a: 'The platform is designed primarily for IB Diploma students, but A-Level students studying overlapping subjects (Chemistry, Biology, Physics, Maths) will find most of the AI responses directly useful. A-Level-specific support is on the roadmap.',
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
                                a: 'We haven\'t locked in a public date yet. Waitlist members will be the first to know — you\'ll get an email when your access is ready, no need to keep checking.',
                            },
                            {
                                q: 'How do referral credits work?',
                                a: 'Every friend who joins the waitlist using your link earns you 25 credits. When they create an account at launch, you get an additional 100 XP — credited automatically to your profile.',
                            },
                            {
                                q: 'Is my data safe?',
                                a: 'Yes. Documents you upload are stored securely and only used to answer your own queries. We never share your data with third parties or use it to train external AI models.',
                            },
                        ].map(({ q, a }) => (
                            <details key={q} className="wl-faq-item">
                                <summary className="wl-faq-q">{q}</summary>
                                <p className="wl-faq-a">{a}</p>
                            </details>
                        ))}
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
                    <a
                        href="#"
                        className="wl-btn-primary wl-btn-xl"
                        onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        aria-label="Scroll to top to join the waitlist"
                    >
                        Get early access
                    </a>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="wl-footer">
                <div className="wl-footer-inner">
                    <img src={Logo} alt="" style={{ height: 26, width: 26, objectFit: 'none', objectPosition: 'left center', opacity: 0.45 }} />
                    <span className="wl-logo-name" style={{ opacity: 0.45, fontSize: '0.95rem' }}>Ibex</span>
                    <div className="wl-footer-links">
                        <a href="#features">Features</a>
                        <Link to="/login">Log In</Link>
                    </div>
                    <div className="wl-footer-copy">© {new Date().getFullYear()} Ibex</div>
                </div>
            </footer>
        </div>
    );
};

export default Waitlist;
