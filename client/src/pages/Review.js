import React, { useState, useEffect, useCallback } from 'react';
import { NavBar } from '../components/NavBar';
import { ProGate } from '../components/ProGate';
import api from '../api';
import './Review.css';

const getIsPro = () => {
    try {
        return JSON.parse(localStorage.getItem('userData'))?.isPro === true;
    } catch { return false; }
};

export const Review = () => {
    const [cards, setCards] = useState([]);
    const [index, setIndex] = useState(0);
    const [reviewed, setReviewed] = useState(0);
    const [total, setTotal] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const isPro = getIsPro();

    const fetchDue = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/diary/due');
            setCards(res.data);
            setTotal(res.data.length);
            setIndex(0);
            setReviewed(0);
            setShowAnswer(false);
            setDone(res.data.length === 0);
        } catch (err) {
            setError('Failed to load cards. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isPro) fetchDue();
        else setLoading(false);
    }, [isPro, fetchDue]);

    const handleRate = async (quality) => {
        const card = cards[index];
        try {
            await api.put(`/diary/${card.id}/review`, { quality });
        } catch (err) {
            // non-fatal — move on regardless
        }
        const nextIndex = index + 1;
        setReviewed(r => r + 1);
        if (nextIndex >= cards.length) {
            setDone(true);
        } else {
            setIndex(nextIndex);
            setShowAnswer(false);
        }
    };

    if (!isPro) {
        return (
            <div className="review-page">
                <NavBar />
                <ProGate feature="Spaced Repetition" />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="review-page">
                <NavBar />
                <div className="review-container">
                    <p className="review-loading">Loading cards...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-page">
                <NavBar />
                <div className="review-container">
                    <p className="review-error">{error}</p>
                    <button className="review-btn-secondary" onClick={fetchDue}>Retry</button>
                </div>
            </div>
        );
    }

    if (done) {
        return (
            <div className="review-page">
                <NavBar />
                <div className="review-container">
                    <div className="review-done-card">
                        <div className="review-done-icon">&#10003;</div>
                        <h2 className="review-done-title">
                            {total === 0
                                ? 'Nothing due today — come back tomorrow!'
                                : `All ${total} card${total !== 1 ? 's' : ''} reviewed!`}
                        </h2>
                        {total > 0 && (
                            <p className="review-done-sub">Great work. Keep your streak going!</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const card = cards[index];

    return (
        <div className="review-page">
            <NavBar />
            <div className="review-container">
                <div className="review-progress">
                    {reviewed} of {total} cards reviewed
                    <div className="review-progress-bar">
                        <div
                            className="review-progress-fill"
                            style={{ width: `${(reviewed / total) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="review-card">
                    <p className="review-card-label">Topic</p>
                    <h2 className="review-card-topic">{card.topic}</h2>

                    {!showAnswer ? (
                        <button
                            className="review-btn-primary"
                            onClick={() => setShowAnswer(true)}
                        >
                            Show answer
                        </button>
                    ) : (
                        <div className="review-answer-section">
                            <p className="review-answer-prompt">Rate your recall:</p>
                            <div className="review-rating-buttons">
                                <button
                                    className="review-rating-btn review-rating-forgot"
                                    onClick={() => handleRate(0)}
                                >
                                    Forgot (0)
                                </button>
                                <button
                                    className="review-rating-btn review-rating-hard"
                                    onClick={() => handleRate(3)}
                                >
                                    Hard (3)
                                </button>
                                <button
                                    className="review-rating-btn review-rating-good"
                                    onClick={() => handleRate(4)}
                                >
                                    Good (4)
                                </button>
                                <button
                                    className="review-rating-btn review-rating-easy"
                                    onClick={() => handleRate(5)}
                                >
                                    Easy (5)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Review;
