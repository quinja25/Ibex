'use strict';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');

jest.mock('../../services/openai', () => ({
    chatCompletion: jest.fn(),
}));

jest.mock('../../services/ragRetriever', () => ({
    retrieveContext: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../models', () => ({
    Questions: {
        count: jest.fn().mockResolvedValue(0),
        findAll: jest.fn().mockResolvedValue([]),
    },
    Answers: {
        findOne: jest.fn().mockResolvedValue(null),
    },
    WaitlistEntries: {
        count: jest.fn(),
        findOne: jest.fn(),
        findOrCreate: jest.fn(),
        increment: jest.fn(),
        update: jest.fn(),
    },
}));

const db = require('../../models');
const { WaitlistEntries } = db;
const publicRouter = require('../../routes/Public');

let ipCounter = 100;
const nextIp = () => `192.168.${Math.floor(ipCounter / 256) % 256}.${ipCounter++ % 256}`;

const buildApp = () => {
    const app = express();
    app.set('trust proxy', true);
    app.use(express.json());
    app.use('/public', publicRouter);
    return app;
};

beforeEach(() => {
    jest.clearAllMocks();
    WaitlistEntries.count.mockResolvedValue(0);
    WaitlistEntries.findOne.mockResolvedValue(null);
    WaitlistEntries.findOrCreate.mockResolvedValue([
        { id: 1, email: 'test@example.com', name: 'Test', referralCode: 'aabbccdd' },
        true,
    ]);
    WaitlistEntries.increment.mockResolvedValue([1, 1]);
    WaitlistEntries.update.mockResolvedValue([1]);
});

// ── POST /public/waitlist ─────────────────────────────────────────────────────

describe('POST /public/waitlist', () => {
    const validBody = {
        email: 'student@example.com',
        name: 'Alice',
        country: 'UK',
        role: 'student',
    };

    it('returns 201 and a referralCode on successful signup', async () => {
        WaitlistEntries.count.mockResolvedValue(42);
        WaitlistEntries.findOrCreate.mockResolvedValue([
            { id: 1, email: 'student@example.com', name: 'Alice', referralCode: 'aabbccdd' },
            true,
        ]);

        const res = await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send(validBody);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.referralCode).toBe('aabbccdd');
        expect(res.body.count).toBe(42);
    });

    it('returns 200 with alreadyRegistered when email already exists', async () => {
        WaitlistEntries.findOrCreate.mockResolvedValue([
            { id: 5, email: 'student@example.com', name: 'Alice', referralCode: 'aabbccdd' },
            false,
        ]);
        WaitlistEntries.count.mockResolvedValue(10);

        const res = await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send(validBody);

        expect(res.status).toBe(200);
        expect(res.body.alreadyRegistered).toBe(true);
        expect(res.body.referralCode).toBe('aabbccdd');
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send({ name: 'Alice', country: 'UK' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/email/i);
    });

    it('returns 400 when email is an invalid format', async () => {
        const res = await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send({ ...validBody, email: 'not-an-email' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/valid email/i);
    });

    it('returns 400 when name is missing', async () => {
        const res = await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send({ email: 'a@b.com', country: 'UK' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/name/i);
    });

    it('returns 400 when country is missing', async () => {
        const res = await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send({ email: 'a@b.com', name: 'Alice' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/country/i);
    });

    it('awards 25 credits to the referrer when a valid referral code is provided', async () => {
        const referrerCode = 'deadbeef';
        WaitlistEntries.findOne.mockResolvedValue({ id: 2, referralCode: referrerCode });
        WaitlistEntries.findOrCreate.mockResolvedValue([
            { id: 3, email: 'new@example.com', name: 'Bob', referralCode: 'cafebabe' },
            true,
        ]);
        WaitlistEntries.increment.mockResolvedValue([1, 1]);

        await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send({ ...validBody, email: 'new@example.com', referredBy: referrerCode });

        // Give the fire-and-forget microtask a tick to run
        await new Promise(r => setImmediate(r));

        expect(WaitlistEntries.increment).toHaveBeenCalledWith(
            'waitlistCredits',
            expect.objectContaining({ by: 25, where: { referralCode: referrerCode } })
        );
    });

    it('does not award referral credits when the referral code does not exist in the DB', async () => {
        WaitlistEntries.findOne.mockResolvedValue(null); // unknown referrer
        WaitlistEntries.findOrCreate.mockResolvedValue([
            { id: 4, email: 'another@example.com', name: 'Carol', referralCode: '11223344' },
            true,
        ]);

        await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send({ ...validBody, email: 'another@example.com', referredBy: 'deadbeef' });

        await new Promise(r => setImmediate(r));

        expect(WaitlistEntries.increment).not.toHaveBeenCalled();
    });

    it('normalises email to lowercase before storing', async () => {
        WaitlistEntries.findOrCreate.mockResolvedValue([
            { id: 5, email: 'upper@example.com', name: 'Dave', referralCode: '55667788' },
            true,
        ]);

        await request(buildApp())
            .post('/public/waitlist')
            .set('X-Forwarded-For', nextIp())
            .send({ ...validBody, email: 'UPPER@EXAMPLE.COM' });

        const callOpts = WaitlistEntries.findOrCreate.mock.calls[0][0];
        expect(callOpts.where.email).toBe('upper@example.com');
    });
});

// ── GET /public/waitlist/count ────────────────────────────────────────────────

describe('GET /public/waitlist/count', () => {
    it('returns a count of all waitlist entries', async () => {
        WaitlistEntries.count.mockResolvedValue(123);

        const res = await request(buildApp()).get('/public/waitlist/count');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(123);
    });

    it('returns count 0 when the table is empty', async () => {
        WaitlistEntries.count.mockResolvedValue(0);

        const res = await request(buildApp()).get('/public/waitlist/count');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(0);
    });

    it('returns count 0 gracefully when the DB call fails', async () => {
        WaitlistEntries.count.mockRejectedValue(new Error('db down'));

        const res = await request(buildApp()).get('/public/waitlist/count');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(0);
    });

    it('does not require authentication', async () => {
        WaitlistEntries.count.mockResolvedValue(5);
        const res = await request(buildApp()).get('/public/waitlist/count');
        expect(res.status).toBe(200);
    });
});

// ── GET /public/waitlist/ref/:code ────────────────────────────────────────────

describe('GET /public/waitlist/ref/:code', () => {
    it('returns referralCount and waitlistCredits for a valid code', async () => {
        WaitlistEntries.findOne.mockResolvedValue({
            id: 1,
            referralCode: 'aabbccdd',
            waitlistCredits: 75,
        });
        WaitlistEntries.count.mockResolvedValue(3);

        const res = await request(buildApp()).get('/public/waitlist/ref/aabbccdd');

        expect(res.status).toBe(200);
        expect(res.body.referralCount).toBe(3);
        expect(res.body.waitlistCredits).toBe(75);
    });

    it('returns 400 for a code shorter than 8 hex characters', async () => {
        const res = await request(buildApp()).get('/public/waitlist/ref/abc123');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid/i);
    });

    it('returns 400 for a code with non-hex characters', async () => {
        const res = await request(buildApp()).get('/public/waitlist/ref/zzzzzzzz');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid/i);
    });

    it('returns 400 for a code longer than 8 characters', async () => {
        const res = await request(buildApp()).get('/public/waitlist/ref/aabbccdd11');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid/i);
    });

    it('returns 404 when the code format is valid but not found in the DB', async () => {
        WaitlistEntries.findOne.mockResolvedValue(null);

        const res = await request(buildApp()).get('/public/waitlist/ref/aabbccdd');

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });
});

// ── PUT /public/waitlist/subjects ─────────────────────────────────────────────

describe('PUT /public/waitlist/subjects', () => {
    it('saves valid subjects as a JSON-stringified array', async () => {
        WaitlistEntries.update.mockResolvedValue([1]);

        const res = await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({ referralCode: 'aabbccdd', subjects: ['Economics', 'Biology'] });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(WaitlistEntries.update).toHaveBeenCalledWith(
            { subjects: JSON.stringify(['Economics', 'Biology']) },
            { where: { referralCode: 'aabbccdd' } }
        );
    });

    it('filters out subjects that are not in the allowed list', async () => {
        WaitlistEntries.update.mockResolvedValue([1]);

        await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({ referralCode: 'aabbccdd', subjects: ['Economics', 'Hacking', 'Biology'] });

        const savedSubjects = JSON.parse(
            WaitlistEntries.update.mock.calls[0][0].subjects
        );
        expect(savedSubjects).toEqual(['Economics', 'Biology']);
        expect(savedSubjects).not.toContain('Hacking');
    });

    it('saves an empty array when all provided subjects are invalid', async () => {
        WaitlistEntries.update.mockResolvedValue([0]);

        await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({ referralCode: 'aabbccdd', subjects: ['NotASubject', 'FakeClass'] });

        const savedSubjects = JSON.parse(
            WaitlistEntries.update.mock.calls[0][0].subjects
        );
        expect(savedSubjects).toEqual([]);
    });

    it('accepts all six valid subject values', async () => {
        const all = ['Economics', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Other'];
        WaitlistEntries.update.mockResolvedValue([1]);

        const res = await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({ referralCode: 'aabbccdd', subjects: all });

        expect(res.status).toBe(200);
        const saved = JSON.parse(WaitlistEntries.update.mock.calls[0][0].subjects);
        expect(saved).toEqual(all);
    });

    it('returns 400 when referralCode is missing', async () => {
        const res = await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({ subjects: ['Economics'] });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid/i);
    });

    it('returns 400 when subjects is not an array', async () => {
        const res = await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({ referralCode: 'aabbccdd', subjects: 'Economics' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid/i);
    });

    it('returns 400 when the request body is empty', async () => {
        const res = await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({});

        expect(res.status).toBe(400);
    });

    it('returns 200 silently when referralCode is valid format but not in the DB', async () => {
        // The route calls update() unconditionally — no 404 on unmatched code
        WaitlistEntries.update.mockResolvedValue([0]);

        const res = await request(buildApp())
            .put('/public/waitlist/subjects')
            .send({ referralCode: 'deadbeef', subjects: ['Physics'] });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
