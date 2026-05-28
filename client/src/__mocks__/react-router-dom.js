const React = require('react');

const navigateFn = jest.fn();

module.exports = {
    Link: ({ children, to, className, style }) =>
        React.createElement('a', { href: to, className, style }, children),
    NavLink: ({ children, to, className }) =>
        React.createElement('a', { href: to, className }, children),
    useNavigate: () => navigateFn,
    useParams: () => ({}),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
    MemoryRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => React.createElement(React.Fragment, null, children),
    Route: ({ element }) => element || null,
    Outlet: () => null,
    Navigate: () => null,
};
