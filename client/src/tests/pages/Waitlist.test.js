import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { server } from '../../mocks/server';

jest.mock('../../Logo1.svg', () => 'mock-logo');

jest.mock('../../components/TryAiWidget', () => ({
    TryAiWidget: () => <div data-testid="try-ai-widget" />,
}));

jest.mock('react-helmet-async', () => ({
    Helmet: ({ children }) => <>{children}</>,
    HelmetProvider: ({ children }) => <>{children}</>,
}));

const { Waitlist } = require('../../pages/Waitlist');

const renderWaitlist = () => render(<Waitlist />);

// The submit button text is "Join the waitlist" — the CTA button at the bottom
// has aria-label "Scroll to top to join the waitlist" which also matches /join/i
const getSubmitButton = () => screen.getByRole('button', { name: 'Join the waitlist' });

beforeEach(() => {
    delete window.location;
    window.location = { search: '', origin: 'http://localhost', href: 'http://localhost/' };
});

describe('Waitlist page — rendering', () => {
    test('renders name input', () => {
        renderWaitlist();
        expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    });

    test('renders email input', () => {
        renderWaitlist();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    test('renders country input', () => {
        renderWaitlist();
        expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
    });

    test('renders role select with Student and Other options', () => {
        renderWaitlist();
        expect(screen.getByRole('option', { name: 'Student' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
    });

    test('renders referral code input by default', () => {
        renderWaitlist();
        expect(screen.getByPlaceholderText(/referral code/i)).toBeInTheDocument();
    });

    test('renders join waitlist submit button', () => {
        renderWaitlist();
        expect(getSubmitButton()).toBeInTheDocument();
    });

    test('fetches and displays waitlist count on mount', async () => {
        renderWaitlist();
        // CountUp animates over ~1200ms — wait up to 2500ms
        await waitFor(() => {
            expect(screen.getAllByText('42').length).toBeGreaterThan(0);
        }, { timeout: 2500 });
    });
});

describe('Waitlist page — submit button state', () => {
    test('submit button is disabled when all fields are empty', () => {
        renderWaitlist();
        expect(getSubmitButton()).toBeDisabled();
    });

    test('submit button remains disabled when only name is filled', () => {
        renderWaitlist();
        fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Alice' } });
        expect(getSubmitButton()).toBeDisabled();
    });

    test('submit button enabled when name, valid email, and country are filled', async () => {
        renderWaitlist();
        fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'alice@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'South Korea' } });
        await waitFor(() => {
            expect(getSubmitButton()).not.toBeDisabled();
        });
    });
});

describe('Waitlist page — inline validation', () => {
    test('shows email error on blur with invalid format', async () => {
        renderWaitlist();
        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'notanemail' } });
        fireEvent.blur(emailInput);
        await waitFor(() => {
            expect(screen.getByText(/valid email/i)).toBeInTheDocument();
        });
    });

    test('clears email error when valid email entered after invalid', async () => {
        renderWaitlist();
        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'bad' } });
        fireEvent.blur(emailInput);
        await waitFor(() => expect(screen.getByText(/valid email/i)).toBeInTheDocument());
        fireEvent.change(emailInput, { target: { value: 'good@test.com' } });
        fireEvent.blur(emailInput);
        await waitFor(() => {
            expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
        });
    });

    test('shows name required error on blur when empty', async () => {
        renderWaitlist();
        const nameInput = screen.getByPlaceholderText('Your name');
        fireEvent.focus(nameInput);
        fireEvent.blur(nameInput);
        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        });
    });

    test('shows country required error on blur when empty', async () => {
        renderWaitlist();
        const countryInput = screen.getByPlaceholderText('Country');
        fireEvent.focus(countryInput);
        fireEvent.blur(countryInput);
        await waitFor(() => {
            expect(screen.getByText(/country is required/i)).toBeInTheDocument();
        });
    });

    test('shows English-only error for non-English country input', async () => {
        renderWaitlist();
        const countryInput = screen.getByPlaceholderText('Country');
        fireEvent.change(countryInput, { target: { value: '한국' } });
        fireEvent.blur(countryInput);
        await waitFor(() => {
            expect(screen.getByText(/english/i)).toBeInTheDocument();
        });
    });

    test('submit button disabled when email error is present', async () => {
        renderWaitlist();
        fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Alice' } });
        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'bad' } });
        fireEvent.blur(emailInput);
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'South Korea' } });
        await waitFor(() => {
            expect(getSubmitButton()).toBeDisabled();
        });
    });
});

describe('Waitlist page — form submission', () => {
    const fillForm = () => {
        fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Alice Park' } });
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'alice@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'South Korea' } });
    };

    test('successful submission shows personalised success message', async () => {
        renderWaitlist();
        fillForm();
        fireEvent.click(getSubmitButton());
        await waitFor(() => {
            expect(screen.getByText(/Alice/)).toBeInTheDocument();
        });
    });

    test('successful submission shows referral code', async () => {
        renderWaitlist();
        fillForm();
        fireEvent.click(getSubmitButton());
        await waitFor(() => {
            expect(screen.getByText(/bbbb2222/i)).toBeInTheDocument();
        });
    });

    test('duplicate email shows already-registered message', async () => {
        renderWaitlist();
        fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Bob' } });
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'existing@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'United Kingdom' } });
        fireEvent.click(getSubmitButton());
        await waitFor(() => {
            expect(screen.getByText('Already registered.')).toBeInTheDocument();
        });
    });

    test('server error shows error message', async () => {
        server.use(
            rest.post('http://localhost/public/waitlist', (req, res, ctx) =>
                res(ctx.status(500), ctx.json({ error: 'Failed to join waitlist. Please try again.' }))
            )
        );
        renderWaitlist();
        fillForm();
        fireEvent.click(getSubmitButton());
        await waitFor(() => {
            expect(screen.getByText(/failed|try again/i)).toBeInTheDocument();
        });
    });
});

describe('Waitlist page — referral code via URL', () => {
    test('hides referral code input when ref param is in URL', () => {
        window.location = { search: '?ref=abc12345', origin: 'http://localhost', href: 'http://localhost/?ref=abc12345' };
        renderWaitlist();
        expect(screen.queryByPlaceholderText(/referral code/i)).not.toBeInTheDocument();
    });
});

describe('Waitlist page — hamburger nav', () => {
    test('hamburger button is present in the DOM', () => {
        renderWaitlist();
        expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    test('hamburger button has aria-expanded=false by default', () => {
        renderWaitlist();
        expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false');
    });

    test('mobile nav is not rendered by default', () => {
        renderWaitlist();
        expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument();
    });

    test('clicking hamburger shows mobile nav', () => {
        renderWaitlist();
        fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
        expect(screen.getByRole('navigation', { name: /mobile menu/i })).toBeInTheDocument();
    });

    test('clicking hamburger sets aria-expanded=true', () => {
        renderWaitlist();
        const btn = screen.getByRole('button', { name: /open menu/i });
        fireEvent.click(btn);
        expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
    });

    test('clicking hamburger again closes mobile nav', () => {
        renderWaitlist();
        const btn = screen.getByRole('button', { name: /open menu/i });
        fireEvent.click(btn);
        expect(screen.getByRole('navigation', { name: /mobile menu/i })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
        expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument();
    });

    test('mobile nav contains Features, Try the AI, and FAQ links', () => {
        renderWaitlist();
        fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
        const mobileNav = screen.getByRole('navigation', { name: /mobile menu/i });
        expect(mobileNav).toHaveTextContent('Features');
        expect(mobileNav).toHaveTextContent('Try the AI');
        expect(mobileNav).toHaveTextContent('FAQ');
    });

    test('clicking a mobile nav link closes the nav', () => {
        renderWaitlist();
        fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
        const mobileNav = screen.getByRole('navigation', { name: /mobile menu/i });
        fireEvent.click(mobileNav.querySelector('a[href="#features"]'));
        expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument();
    });
});

describe('Waitlist page — scroll reveal classes', () => {
    test('wl-reveal elements do not have wl-revealed class on initial render', () => {
        renderWaitlist();
        const revealEls = document.querySelectorAll('.wl-reveal');
        expect(revealEls.length).toBeGreaterThan(0);
        revealEls.forEach(el => {
            expect(el).not.toHaveClass('wl-revealed');
        });
    });

    test('feature rows have directional reveal classes', () => {
        renderWaitlist();
        const rows = document.querySelectorAll('.wl-feature-row');
        expect(rows.length).toBeGreaterThan(0);
        // Even-index rows slide from left, odd-index rows slide from right
        expect(rows[0]).toHaveClass('wl-reveal--from-left');
        if (rows.length > 1) {
            expect(rows[1]).toHaveClass('wl-reveal--from-right');
        }
    });

    test('hero elements have data-delay attributes for staggered reveal', () => {
        renderWaitlist();
        const badge = document.querySelector('.wl-badge');
        const headline = document.querySelector('.wl-headline');
        expect(badge).toHaveAttribute('data-delay', '0');
        expect(headline).toHaveAttribute('data-delay', '100');
    });
});

describe('Waitlist page — FAQ accordion', () => {
    test('renders all FAQ questions', () => {
        renderWaitlist();
        expect(screen.getByText('Is Ibex free?')).toBeInTheDocument();
        expect(screen.getByText('Which IB subjects does it cover?')).toBeInTheDocument();
        expect(screen.getByText('How is Ibex different from ChatGPT?')).toBeInTheDocument();
        expect(screen.getByText('When does it launch?')).toBeInTheDocument();
    });

    test('FAQ items are collapsed by default (no open class)', () => {
        renderWaitlist();
        const items = document.querySelectorAll('.wl-faq-item');
        items.forEach(item => {
            expect(item).not.toHaveClass('wl-faq-item--open');
        });
    });

    test('clicking a question reveals its answer', async () => {
        renderWaitlist();
        fireEvent.click(screen.getByRole('button', { name: /Is Ibex free/i }));
        await waitFor(() => {
            expect(screen.getByText(/core platform is free/i)).toBeVisible();
        });
    });

    test('FAQ button has aria-expanded=false by default', () => {
        renderWaitlist();
        const btn = screen.getByRole('button', { name: /Is Ibex free/i });
        expect(btn).toHaveAttribute('aria-expanded', 'false');
    });

    test('FAQ button has aria-expanded=true when open', async () => {
        renderWaitlist();
        const btn = screen.getByRole('button', { name: /Is Ibex free/i });
        fireEvent.click(btn);
        await waitFor(() => {
            expect(btn).toHaveAttribute('aria-expanded', 'true');
        });
    });

    test('clicking an open question closes it', async () => {
        renderWaitlist();
        const btn = screen.getByRole('button', { name: /Is Ibex free/i });
        fireEvent.click(btn);
        await waitFor(() => expect(btn).toHaveAttribute('aria-expanded', 'true'));
        fireEvent.click(btn);
        await waitFor(() => {
            expect(btn).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test('opening one question closes the previously open one', async () => {
        renderWaitlist();
        const btn1 = screen.getByRole('button', { name: /Is Ibex free/i });
        const btn2 = screen.getByRole('button', { name: /Which IB subjects/i });
        fireEvent.click(btn1);
        await waitFor(() => expect(btn1).toHaveAttribute('aria-expanded', 'true'));
        fireEvent.click(btn2);
        await waitFor(() => {
            expect(btn2).toHaveAttribute('aria-expanded', 'true');
            expect(btn1).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test('FAQ answer region is linked to its button via aria-controls', () => {
        renderWaitlist();
        const btn = screen.getByRole('button', { name: /Is Ibex free/i });
        const controlsId = btn.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();
        expect(document.getElementById(controlsId)).toBeInTheDocument();
    });
});
