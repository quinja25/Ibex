const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const { Op, literal } = require('sequelize');
const db = require('../models');
const { Questions, Answers, WaitlistEntries } = db;
const { chatCompletion } = require('../services/openai');
const { retrieveContext } = require('../services/ragRetriever');

const IB_PROMPT_ADDON =
    `\n\nThis platform serves IB students. Follow IB assessment conventions:\n` +
    `- Command term awareness: Define, Describe, Explain, Discuss, Evaluate, Compare, Contrast, etc.\n` +
    `- Reference HL vs SL depth when relevant.\n` +
    `- Keep answers concise (under 180 words for this preview).\n` +
    `- Do not cite or reference sources in your answer — just answer directly.\n` +
    `- Write all math in plain text (e.g. K = 1/(1-MPC)) — do not use LaTeX delimiters like \\[...\\] or \\(...\\).`;

const getMailTransporter = () => {
    if (!process.env.SMTP_HOST) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
};

const generateReferralCode = () => crypto.randomBytes(4).toString('hex');

const WAITLIST_CREDITS_PER_REFERRAL = 25;

const sendWaitlistConfirmation = async (entry, position, clientUrl) => {
    const transporter = getMailTransporter();
    const serverUrl = (process.env.SERVER_URL || 'http://localhost:3001').replace(/\/$/, '');
    const referralLink = `${clientUrl}/?ref=${entry.referralCode}`;
    const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
            <h2 style="margin-bottom:4px">You're on the list, ${entry.name}.</h2>

            <div style="background:#f7f6ff;border-left:3px solid #6c63ff;padding:14px 18px;margin:24px 0;border-radius:0 8px 8px 0">
                <p style="margin:0 0 6px;font-weight:600;color:#1a1a2e">What happens next</p>
                <ul style="margin:0;padding-left:18px;color:#555;line-height:1.8;font-size:14px">
                    <li>We'll email you the moment your access is ready</li>
                    <li>Refer friends to move up the list and earn credits</li>
                    <li>Try the AI right now — no account needed</li>
                </ul>
            </div>

            <a href="${clientUrl}/#try-ai" style="display:inline-block;margin:0 0 24px;padding:12px 24px;background:#1a1a2e;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Try Ibex AI now →</a>

            <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
            <h3 style="margin-bottom:8px">Move up the list — invite a friend</h3>
            <p style="color:#555">Every friend who joins earns you <strong>${WAITLIST_CREDITS_PER_REFERRAL} credits</strong>. Refer 3 for 75 credits, 10 for 300 credits.</p>
            <a href="${referralLink}" style="display:inline-block;margin:12px 0;padding:12px 24px;background:#6c63ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Share your referral link →</a>

            <p style="color:#888;font-size:13px;margin:8px 0 0">Link not working? Share your code instead and ask them to enter it at signup:</p>
            <div style="margin:8px 0 0;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <span style="display:inline-block;padding:10px 20px;background:#f0eeff;border:1px dashed #6c63ff;border-radius:8px;font-family:monospace;font-size:18px;font-weight:700;letter-spacing:2px;color:#6c63ff">${entry.referralCode.toUpperCase()}</span>
                <a href="${serverUrl}/public/copy-code?code=${entry.referralCode}" style="display:inline-block;padding:8px 16px;background:#6c63ff;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Copy code →</a>
            </div>

            <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
            <p style="font-size:13px;color:#aaa">You're receiving this because you joined the Ibex waitlist.</p>
        </div>
    `;

    if (transporter) {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: entry.email,
            subject: `[Ibex] You're on the Waitlist!`,
            html,
        }).catch(err => console.error('[Email] Waitlist confirmation failed:', err));
    } else {
        console.log(`[DEV] Waitlist confirmation for ${entry.email} — referral link: ${referralLink}`);
    }
};

const aiTryLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    message: { error: 'Free preview limit reached — come back tomorrow or sign up for unlimited access.', rateLimited: true },
    standardHeaders: true,
    legacyHeaders: false,
});

const waitlistLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Too many signup attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/stats', async (req, res) => {
    try {
        const roomUsers = req.app.get('roomUsers');
        let activeRooms = 0;
        let studentsOnline = 0;
        if (roomUsers && typeof roomUsers.forEach === 'function') {
            roomUsers.forEach((members) => {
                if (members && members.size > 0) {
                    activeRooms += 1;
                    studentsOnline += members.size;
                }
            });
        }

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [questionsLast24h, unansweredQuestions, latestAnswer] = await Promise.all([
            Questions.count({ where: { createdAt: { [Op.gte]: since } } }).catch(() => 0),
            Questions.count({ where: { isAnswered: false } }).catch(() => 0),
            Answers.findOne({ order: [['createdAt', 'DESC']], attributes: ['createdAt'] }).catch(() => null),
        ]);

        let lastAnswerMinutesAgo = null;
        if (latestAnswer?.createdAt) {
            lastAnswerMinutesAgo = Math.max(
                0,
                Math.round((Date.now() - new Date(latestAnswer.createdAt).getTime()) / 60000)
            );
        }

        res.set('Cache-Control', 'public, max-age=30');
        res.json({
            studentsOnline,
            activeRooms,
            questionsLast24h,
            unansweredQuestions,
            lastAnswerMinutesAgo,
        });
    } catch (err) {
        console.error('Public stats error:', err);
        res.status(200).json({
            studentsOnline: 0,
            activeRooms: 0,
            questionsLast24h: 0,
            unansweredQuestions: 0,
            lastAnswerMinutesAgo: null,
        });
    }
});

router.get('/open-questions', async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 3, 1), 6);
        const rows = await Questions.findAll({
            where: { isAnswered: false },
            order: [['createdAt', 'DESC']],
            limit,
            attributes: ['id', 'title', 'subject', 'createdAt'],
        });
        res.set('Cache-Control', 'public, max-age=30');
        res.json({
            questions: rows.map(r => ({
                id: r.id,
                title: r.title,
                subject: r.subject,
                createdAt: r.createdAt,
            })),
        });
    } catch (err) {
        console.error('Public open-questions error:', err);
        res.status(200).json({ questions: [] });
    }
});

router.post('/ai-try', aiTryLimiter, async (req, res) => {
    try {
        const { message } = req.body || {};
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ error: 'message is required' });
        }
        if (message.length > 200) {
            return res.status(400).json({ error: 'Preview is limited to 200 characters. Sign up for unlimited.' });
        }

        const SUBJECT_MAP = [
            { key: 'Economics', terms: ['econom', 'gdp', 'inflation', 'supply', 'demand', 'market', 'fiscal', 'monetary', 'trade', 'tariff'] },
            { key: 'Biology',   terms: ['bio', 'cell', 'dna', 'enzyme', 'evolution', 'genetics', 'photosynthesis', 'respiration', 'ecology'] },
            { key: 'Chemistry', terms: ['chem', 'bond', 'reaction', 'acid', 'base', 'mole', 'oxidation', 'reduction', 'organic', 'titrat'] },
            { key: 'Physics',   terms: ['physics', 'force', 'momentum', 'wave', 'electric', 'magnetic', 'nuclear', 'quantum', 'circuit', 'thermodynamic'] },
        ];
        const lc = message.toLowerCase();
        const detectedSubject = SUBJECT_MAP.find(s => s.terms.some(t => lc.includes(t)))?.key || null;

        const ragChunks = await retrieveContext(message, {
            subject: detectedSubject,
            maxChunks: 3,
            isPro: false,
        }).catch(() => []);

        const systemPrompt =
            `You are the Ibex AI study assistant — a preview demo on the public landing page. ` +
            `You specialise in the International Baccalaureate (IB) curriculum. ` +
            `Answer the student's question clearly and concisely. ` +
            `If relevant knowledge-base content is provided, cite it. ` +
            `End with a one-line nudge to sign up if they want full access.` +
            IB_PROMPT_ADDON;

        const messages = [{ role: 'system', content: systemPrompt }];
        if (ragChunks.length > 0) {
            const ctx = ragChunks
                .map((c, i) => `[Source ${i + 1} — ${c.source}: "${c.title}"]\n${c.content}`)
                .join('\n\n');
            messages.push({ role: 'system', content: `Knowledge base:\n\n${ctx}` });
        }
        messages.push({ role: 'user', content: message });

        const aiResponse = await chatCompletion(messages, { max_tokens: 320 });

        const remaining = Math.max(
            0,
            parseInt(res.getHeader('RateLimit-Remaining') || '0', 10)
        );

        res.json({
            answer: aiResponse.content,
            sources: ragChunks.map(c => ({
                title: c.title,
                source: c.source,
                preview: (c.content || '').slice(0, 160),
            })),
            remainingToday: remaining,
        });
    } catch (err) {
        console.error('Public ai-try error:', err);
        if (err.status === 401 || err.code === 'invalid_api_key') {
            return res.status(503).json({ error: 'AI preview is temporarily unavailable.' });
        }
        res.status(500).json({ error: 'Failed to get answer. Please try again.' });
    }
});

router.get('/copy-code', (req, res) => {
    const code = (req.query.code || '').replace(/[^a-f0-9]/gi, '').toUpperCase();
    if (!code) return res.status(400).send('Invalid code.');
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Copy code</title></head><body style="font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f7f6ff">
<div style="text-align:center;padding:32px;background:#fff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.08);max-width:320px">
<p style="color:#555;margin:0 0 12px;font-size:14px">Your referral code</p>
<div id="code" style="font-family:monospace;font-size:28px;font-weight:700;letter-spacing:4px;color:#6c63ff;background:#f0eeff;border:1px dashed #6c63ff;border-radius:8px;padding:12px 24px;margin-bottom:16px">${code}</div>
<button onclick="navigator.clipboard.writeText('${code}').then(()=>{this.textContent='✓ Copied!';this.style.background='#22c55e';})" style="padding:10px 24px;background:#6c63ff;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer">Copy code</button>
<p style="color:#aaa;font-size:12px;margin:16px 0 0">Enter this code at signup on <a href="/" style="color:#6c63ff">ibex.study</a></p>
</div>
<script>navigator.clipboard.writeText('${code}').catch(()=>{});</script>
</body></html>`);
});

router.get('/waitlist/count', async (req, res) => {
    try {
        const count = await WaitlistEntries.count();
        res.set('Cache-Control', 'public, max-age=60');
        res.json({ count });
    } catch {
        res.json({ count: 0 });
    }
});

router.get('/waitlist/countries', async (req, res) => {
    try {
        const rows = await WaitlistEntries.findAll({
            attributes: ['country', [literal('COUNT(*)'), 'count']],
            group: ['country'],
            order: [[literal('COUNT(*)'), 'DESC']],
            limit: 10,
            raw: true,
        });
        res.set('Cache-Control', 'public, max-age=120');
        res.json({ countries: rows.map(r => ({ country: r.country, count: parseInt(r.count, 10) })) });
    } catch (err) {
        console.error('Waitlist countries error:', err);
        res.json({ countries: [] });
    }
});

router.get('/waitlist/ref/:code', async (req, res) => {
    try {
        const { code } = req.params;
        if (!code || !/^[a-f0-9]{8}$/.test(code)) {
            return res.status(400).json({ error: 'Invalid referral code.' });
        }
        const referrer = await WaitlistEntries.findOne({ where: { referralCode: code } });
        if (!referrer) return res.status(404).json({ error: 'Referral code not found.' });

        const referralCount = await WaitlistEntries.count({ where: { referredBy: code } });
        res.json({
            referralCount,
            waitlistCredits: referrer.waitlistCredits,
        });
    } catch (err) {
        console.error('Waitlist ref stats error:', err);
        res.status(500).json({ error: 'Failed to fetch referral stats.' });
    }
});

router.put('/waitlist/subjects', async (req, res) => {
    try {
        const { referralCode, subjects } = req.body || {};
        if (!referralCode || !Array.isArray(subjects)) {
            return res.status(400).json({ error: 'Invalid request.' });
        }
        const VALID = ['Economics', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Other'];
        const clean = subjects.filter(s => VALID.includes(s));
        await WaitlistEntries.update(
            { subjects: JSON.stringify(clean) },
            { where: { referralCode } }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Waitlist subjects error:', err);
        res.status(500).json({ error: 'Failed to save subjects.' });
    }
});

router.post('/waitlist', waitlistLimiter, async (req, res) => {
    try {
        const { email, name, country, role, referredBy } = req.body || {};
        if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        const clean = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Name is required.' });
        }
        if (!country || typeof country !== 'string' || !country.trim()) {
            return res.status(400).json({ error: 'Country is required.' });
        }
        const validRoles = ['student', 'alumni', 'other'];
        const cleanRole = validRoles.includes(role) ? role : 'student';

        // Validate referral code if provided — must exist in DB
        let validRef = null;
        const rawRef = typeof referredBy === 'string' ? referredBy.trim() : '';
        if (/^[a-f0-9]{8}$/.test(rawRef)) {
            const referrer = await WaitlistEntries.findOne({ where: { referralCode: rawRef } });
            if (referrer) validRef = rawRef;
        }

        const referralCode = generateReferralCode();

        const [entry, created] = await WaitlistEntries.findOrCreate({
            where: { email: clean },
            defaults: {
                email: clean,
                name: name.trim().slice(0, 100),
                country: country.trim().slice(0, 100),
                role: cleanRole,
                referralCode,
                referredBy: validRef,
            },
        });

        const count = await WaitlistEntries.count();

        if (!created) {
            return res.status(200).json({
                alreadyRegistered: true,
                count,
                referralCode: entry.referralCode,
            });
        }

        // Award credits to referrer (fire-and-forget)
        if (validRef) {
            WaitlistEntries.increment('waitlistCredits', {
                by: WAITLIST_CREDITS_PER_REFERRAL,
                where: { referralCode: validRef },
            }).catch(err => console.error('[Waitlist] Credit increment failed:', err));
        }

        // Send confirmation email (fire-and-forget)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        sendWaitlistConfirmation(entry, count, clientUrl).catch(err => console.error('[Waitlist] Confirmation email failed:', err));

        res.status(201).json({
            success: true,
            count,
            referralCode: entry.referralCode,
        });
    } catch (err) {
        console.error('Waitlist error:', err);
        res.status(500).json({ error: 'Failed to join waitlist. Please try again.' });
    }
});

module.exports = router;
