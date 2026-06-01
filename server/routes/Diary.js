const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const { DiaryEntries, Users } = db;
const { validateToken } = require('../middlewares/AuthMiddleware');
const { sm2 } = require('../services/sm2');

// ──────────────────────────────────────────────
// POST /diary — create a diary entry (Pro only)
// ──────────────────────────────────────────────
router.post('/', validateToken, async (req, res) => {
    try {
        const user = await Users.findByPk(req.user.id);
        if (!user) return res.status(401).json({ error: 'User not found' });
        if (!user.isPro) return res.status(403).json({ error: 'Spaced Repetition requires Pro.', requiresPro: true });

        const { topic } = req.body;
        if (!topic || !topic.trim()) return res.status(400).json({ error: 'topic is required' });

        const entry = await DiaryEntries.create({
            userId: req.user.id,
            topic: topic.trim(),
        });

        res.status(201).json(entry);
    } catch (error) {
        console.error('POST /diary error:', error);
        res.status(500).json({ error: 'Failed to create diary entry' });
    }
});

// ──────────────────────────────────────────────
// GET /diary/due — entries due for review (Pro only)
// ──────────────────────────────────────────────
router.get('/due', validateToken, async (req, res) => {
    try {
        const user = await Users.findByPk(req.user.id);
        if (!user) return res.status(401).json({ error: 'User not found' });
        if (!user.isPro) return res.status(403).json({ error: 'Spaced Repetition requires Pro.', requiresPro: true });

        const entries = await DiaryEntries.findAll({
            where: {
                userId: req.user.id,
                due: { [Op.lte]: new Date() },
            },
            order: [['due', 'ASC']],
            limit: 20,
        });

        res.json(entries);
    } catch (error) {
        console.error('GET /diary/due error:', error);
        res.status(500).json({ error: 'Failed to fetch due entries' });
    }
});

// ──────────────────────────────────────────────
// PUT /diary/:id/review — run SM-2 and award XP (Pro only)
// ──────────────────────────────────────────────
router.put('/:id/review', validateToken, async (req, res) => {
    try {
        const user = await Users.findByPk(req.user.id);
        if (!user) return res.status(401).json({ error: 'User not found' });
        if (!user.isPro) return res.status(403).json({ error: 'Spaced Repetition requires Pro.', requiresPro: true });

        const entry = await DiaryEntries.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!entry) return res.status(404).json({ error: 'Diary entry not found' });

        const quality = parseInt(req.body.quality, 10);
        if (isNaN(quality) || quality < 0 || quality > 5) {
            return res.status(400).json({ error: 'quality must be an integer 0-5' });
        }

        const updated = sm2(entry, quality);
        await entry.update(updated);

        // Award +5 XP on pass
        if (quality >= 3) {
            try {
                const newXp = (user.xp || 0) + 5;
                await Users.update({ xp: newXp }, { where: { id: req.user.id } });
            } catch (xpErr) {
                // XP award failure is non-fatal
                console.error('XP award failed:', xpErr.message);
            }
        }

        res.json(entry);
    } catch (error) {
        console.error('PUT /diary/:id/review error:', error);
        res.status(500).json({ error: 'Failed to update diary entry' });
    }
});

module.exports = router;
