import { useState } from 'react';
import api from '../api';
import './TryAiWidget.css';

const SUBJECTS = [
    {
        label: 'Economics',
        emoji: '📈',
        samples: [
            'Explain why demand for cigarettes is price inelastic and the tax implications.',
            'Evaluate expansionary fiscal policy during a recession.',
            'What is the Keynesian multiplier? Give an IB example.',
        ],
    },
    {
        label: 'Biology',
        emoji: '🧬',
        samples: [
            'Compare oxidation and reduction in the electron transport chain (HL).',
            'Explain how enzymes lower activation energy with a diagram.',
            'What is the difference between mitosis and meiosis?',
        ],
    },
    {
        label: 'Chemistry',
        emoji: '⚗️',
        samples: [
            'Explain the difference between SN1 and SN2 reactions.',
            'What is Le Chatelier\'s principle? Give an industrial example.',
            'How do you calculate pH for a weak acid buffer?',
        ],
    },
];

const MAX_CHARS = 200;

export const TryAiWidget = () => {
    const [activeSubject, setActiveSubject] = useState(0);
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rateLimited, setRateLimited] = useState(false);

    const submit = async (text) => {
        const message = (text ?? prompt).trim();
        if (!message || loading || rateLimited) return;

        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            const { data } = await api.post('/public/ai-try', { message });
            setAnswer(data.answer);
        } catch (err) {
            const status = err.response?.status;
            if (status === 429) {
                setRateLimited(true);
                setError(err.response?.data?.error || 'Free preview limit reached — come back tomorrow or sign up for unlimited access.');
            } else {
                setError(err.response?.data?.error || 'Something went wrong. Try again in a moment.');
            }
        } finally {
            setLoading(false);
        }
    };

    const onChip = (text) => {
        setPrompt(text);
        submit(text);
    };

    const onTabChange = (i) => {
        setActiveSubject(i);
        setPrompt('');
        setAnswer(null);
        setError(null);
    };

    const subject = SUBJECTS[activeSubject];

    return (
        <section className="try-ai" id="try-ai">
            <div className="try-ai-inner">
                <div className="try-ai-header">
                    <span className="try-ai-eyebrow">Try it now — no signup needed</span>
                    <h2 className="try-ai-title">
                        Ask <span className="gradient-text">Ibex</span> — the IB-specialized AI.
                    </h2>
                    <p className="try-ai-sub">
                        A curriculum-aware AI tutor built end-to-end for IB. Answers grounded in
                        mark scheme conventions and curriculum content — with sources cited.
                    </p>
                </div>

                <div className="try-ai-box">
                    {/* Subject tabs */}
                    <div className="try-ai-tabs">
                        {SUBJECTS.map((s, i) => (
                            <button
                                key={s.label}
                                className={`try-ai-tab ${i === activeSubject ? 'active' : ''}`}
                                onClick={() => onTabChange(i)}
                                type="button"
                            >
                                <span>{s.emoji}</span> {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Sample chips */}
                    <div className="try-ai-samples">
                        {subject.samples.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                className="try-ai-chip"
                                onClick={() => onChip(s)}
                                disabled={loading || rateLimited}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form className="try-ai-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
                            placeholder={`Ask an IB ${subject.label} question…`}
                            rows={2}
                            disabled={loading || rateLimited}
                            className="try-ai-input"
                        />
                        <div className="try-ai-row">
                            <span className="try-ai-count">{prompt.length}/{MAX_CHARS}</span>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading || rateLimited || !prompt.trim()}
                            >
                                {loading
                                    ? <><span className="try-ai-spinner" /> Thinking…</>
                                    : 'Ask Ibex →'
                                }
                            </button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && (
                        <div className={`try-ai-error ${rateLimited ? 'rate-limited' : ''}`}>
                            <span>{error}</span>
                            {rateLimited && (
                                <a href="#signup" className="btn-primary btn-sm">
                                    Sign up free →
                                </a>
                            )}
                        </div>
                    )}

                    {/* Answer */}
                    {answer && !error && (
                        <div className="try-ai-answer">
                            <div className="try-ai-answer-label">
                                <span className="try-ai-answer-dot" />
                                Answer
                            </div>
                            <div className="try-ai-answer-body">{answer}</div>


                            <div className="try-ai-followup">
                                Want unlimited questions, your own notes, study rooms & alumni Q&A?{' '}
                                <a href="#signup" className="try-ai-signup-link">
                                    Sign up free →
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <p className="try-ai-limit-note">3 free questions per day · No credit card needed</p>
            </div>
        </section>
    );
};

export default TryAiWidget;
