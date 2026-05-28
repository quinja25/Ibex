import { rest } from 'msw';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const handlers = [
    rest.get(`${BASE}/public/waitlist/count`, (req, res, ctx) =>
        res(ctx.json({ count: 42 }))
    ),

    rest.get(`${BASE}/public/waitlist/countries`, (req, res, ctx) =>
        res(ctx.json({
            countries: [
                { country: 'South Korea', count: 10 },
                { country: 'United Kingdom', count: 7 },
            ],
        }))
    ),

    rest.post(`${BASE}/public/waitlist`, async (req, res, ctx) => {
        const { email } = await req.json();
        if (email === 'existing@test.com') {
            return res(ctx.status(200), ctx.json({
                alreadyRegistered: true,
                count: 42,
                referralCode: 'aaaa1111',
            }));
        }
        return res(ctx.status(201), ctx.json({
            success: true,
            count: 43,
            referralCode: 'bbbb2222',
        }));
    }),

    rest.get(`${BASE}/public/waitlist/ref/:code`, (req, res, ctx) =>
        res(ctx.json({ referralCount: 2, waitlistCredits: 50 }))
    ),
];
