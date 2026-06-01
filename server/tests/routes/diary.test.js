'use strict';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const { generateAccessToken } = require('../helpers/authHelpers');

// ── Mock db ──────────────────────────────────────────────────────────────────
jest.mock('../../models', () => {
    const { Op } = require('sequelize');
    const mockDiary = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
    };
    const mockUsers = {
        findByPk: jest.fn(),
        update: jest.fn(),
    };
    return { DiaryEntries: mockDiary, Users: mockUsers, Op };
});

const db = require('../../models');
const router = require('../../routes/Diary');

const app = express();
app.use(express.json());
app.use('/diary', router);

// ── Helpers ──────────────────────────────────────────────────────────────────
const proUser    = { id: 42, isPro: true,  xp: 100 };
const freeUser   = { id: 99, isPro: false, xp: 0   };

const mockEntry = {
    id: 1,
    userId: 42,
    topic: 'Supply and Demand',
    ease: 2.5,
    interval: 1,
    reps: 0,
    due: new Date(),
    update: jest.fn(),
};

beforeEach(() => {
    jest.clearAllMocks();
    db.Users.findByPk.mockResolvedValue(proUser);
    db.DiaryEntries.create.mockResolvedValue(mockEntry);
    db.DiaryEntries.findAll.mockResolvedValue([mockEntry]);
    db.DiaryEntries.findOne.mockResolvedValue({ ...mockEntry, update: jest.fn().mockResolvedValue() });
    db.Users.update.mockResolvedValue([1]);
});

// ── POST /diary ──────────────────────────────────────────────────────────────

describe('POST /diary', () => {
    it('returns 401 without auth token', async () => {
        const res = await request(app).post('/diary').send({ topic: 'Calculus' });
        expect(res.status).toBe(401);
    });

    it('returns 403 for non-Pro user', async () => {
        db.Users.findByPk.mockResolvedValue(freeUser);
        const token = generateAccessToken(99);
        const res = await request(app)
            .post('/diary')
            .set('Authorization', `Bearer ${token}`)
            .send({ topic: 'Calculus' });
        expect(res.status).toBe(403);
        expect(res.body.requiresPro).toBe(true);
    });

    it('returns 400 when topic is missing', async () => {
        const token = generateAccessToken(42);
        const res = await request(app)
            .post('/diary')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/topic/i);
    });

    it('creates entry for Pro user (201)', async () => {
        const token = generateAccessToken(42);
        const res = await request(app)
            .post('/diary')
            .set('Authorization', `Bearer ${token}`)
            .send({ topic: 'Supply and Demand' });
        expect(res.status).toBe(201);
        expect(db.DiaryEntries.create).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 42, topic: 'Supply and Demand' })
        );
    });
});

// ── GET /diary/due ───────────────────────────────────────────────────────────

describe('GET /diary/due', () => {
    it('returns 401 without auth token', async () => {
        const res = await request(app).get('/diary/due');
        expect(res.status).toBe(401);
    });

    it('returns 403 for non-Pro user', async () => {
        db.Users.findByPk.mockResolvedValue(freeUser);
        const token = generateAccessToken(99);
        const res = await request(app)
            .get('/diary/due')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('returns only due entries (200)', async () => {
        const token = generateAccessToken(42);
        db.DiaryEntries.findAll.mockResolvedValue([mockEntry]);
        const res = await request(app)
            .get('/diary/due')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        // Verify the query filters by userId and due <= now
        const callArg = db.DiaryEntries.findAll.mock.calls[0][0];
        expect(callArg.where).toHaveProperty('userId', 42);
        expect(callArg.order).toEqual([['due', 'ASC']]);
        expect(callArg.limit).toBe(20);
    });

    it('returns empty array when nothing is due', async () => {
        db.DiaryEntries.findAll.mockResolvedValue([]);
        const token = generateAccessToken(42);
        const res = await request(app)
            .get('/diary/due')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

// ── PUT /diary/:id/review ────────────────────────────────────────────────────

describe('PUT /diary/:id/review', () => {
    it('returns 401 without auth token', async () => {
        const res = await request(app).put('/diary/1/review').send({ quality: 4 });
        expect(res.status).toBe(401);
    });

    it('returns 403 for non-Pro user', async () => {
        db.Users.findByPk.mockResolvedValue(freeUser);
        const token = generateAccessToken(99);
        const res = await request(app)
            .put('/diary/1/review')
            .set('Authorization', `Bearer ${token}`)
            .send({ quality: 4 });
        expect(res.status).toBe(403);
    });

    it('returns 404 when entry not found', async () => {
        db.DiaryEntries.findOne.mockResolvedValue(null);
        const token = generateAccessToken(42);
        const res = await request(app)
            .put('/diary/999/review')
            .set('Authorization', `Bearer ${token}`)
            .send({ quality: 4 });
        expect(res.status).toBe(404);
    });

    it('returns 400 for invalid quality', async () => {
        const token = generateAccessToken(42);
        const res = await request(app)
            .put('/diary/1/review')
            .set('Authorization', `Bearer ${token}`)
            .send({ quality: 7 });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/quality/i);
    });

    it('updates SM-2 fields on review (200)', async () => {
        const updateMock = jest.fn().mockResolvedValue();
        db.DiaryEntries.findOne.mockResolvedValue({ ...mockEntry, update: updateMock });
        const token = generateAccessToken(42);
        const res = await request(app)
            .put('/diary/1/review')
            .set('Authorization', `Bearer ${token}`)
            .send({ quality: 4 });
        expect(res.status).toBe(200);
        expect(updateMock).toHaveBeenCalledWith(
            expect.objectContaining({ ease: expect.any(Number), interval: expect.any(Number), reps: expect.any(Number), due: expect.any(Date) })
        );
    });

    it('awards XP when quality >= 3 (pass)', async () => {
        const updateMock = jest.fn().mockResolvedValue();
        db.DiaryEntries.findOne.mockResolvedValue({ ...mockEntry, update: updateMock });
        const token = generateAccessToken(42);
        await request(app)
            .put('/diary/1/review')
            .set('Authorization', `Bearer ${token}`)
            .send({ quality: 4 });
        expect(db.Users.update).toHaveBeenCalledWith(
            expect.objectContaining({ xp: 105 }),
            expect.objectContaining({ where: { id: 42 } })
        );
    });

    it('does not award XP when quality < 3 (fail)', async () => {
        const updateMock = jest.fn().mockResolvedValue();
        db.DiaryEntries.findOne.mockResolvedValue({ ...mockEntry, update: updateMock });
        const token = generateAccessToken(42);
        await request(app)
            .put('/diary/1/review')
            .set('Authorization', `Bearer ${token}`)
            .send({ quality: 1 });
        expect(db.Users.update).not.toHaveBeenCalled();
    });
});
