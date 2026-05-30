import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Bell, Menu, X, ChevronDown,
  LayoutDashboard, User, Calendar, LogOut,
  Home, Briefcase, Users,
} from 'lucide-react';

import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import Avatar from '../ui/Avatar';
import Badge  from '../ui/Badge';

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/Home',     label: 'Home',      icon: <Home size={16} /> },
  { to: '/Services', label: 'Services',  icon: <Briefcase size={16} /> },
  { to: '/suppliers',label: 'Suppliers', icon: <Users size={16} /> },
];

const navLinkClass = ({ isActive }) =>
  [
    'flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 px-1 py-0.5',
    'relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:transition-all after:duration-200',
    isActive
      ? 'text-[var(--color-gold)] after:w-full after:bg-[var(--color-gold)]'
      : 'text-[var(--color-dark-soft)] hover:text-[var(--color-gold)] after:w-0 hover:after:w-full after:bg-[var(--color-gold)]',
  ].join(' ');

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

/** Icon button with optional numeric badge */
function IconButton({ icon, badge, label, onClick, to }) {
  const inner = (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-xl text-[var(--color-dark-soft)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors duration-150"
    >
      {icon}
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-gold)] text-white text-[10px] font-bold leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
}

/** User dropdown menu */
function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const customerItems = [
    { icon: <LayoutDashboard size={15} />, label: 'Dashboard',  to: '/customer/dashboard' },
    { icon: <Calendar size={15} />,        label: 'My Events',  to: '/customer/events' },
    { icon: <User size={15} />,            label: 'Profile',    to: '/customer/profile' },
  ];
  const vendorItems = [
    { icon: <LayoutDashboard size={15} />, label: 'Dashboard', to: '/vendor/dashboard' },
    { icon: <Briefcase size={15} />,       label: 'Services',  to: '/vendor/services' },
    { icon: <User size={15} />,            label: 'Profile',   to: '/vendor/profile' },
  ];
  const adminItems = [
    { icon: <LayoutDashboard size={15} />, label: 'Admin Panel', to: '/admin/dashboard' },
  ];

  const items = user?.role === 'admin' ? adminItems : user?.role === 'vendor' ? vendorItems : customerItems;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-xl px-2 py-1 min-h-[44px] md:min-h-0 hover:bg-[var(--color-gold)]/10 transition-colors duration-150"
      >
        <Avatar src={user?.avatar_url} name={user?.full_name ?? user?.username} size="sm" />
        <span className="hidden lg:block text-sm font-medium text-[var(--color-dark)] max-w-[100px] truncate">
          {user?.full_name?.split(' ')[0] ?? user?.username}
        </span>
        <ChevronDown
          size={14}
          className={['text-gray-400 transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-[var(--shadow-modal)] border border-gray-100 py-2 z-[var(--z-dropdown)] animate-[scaleIn_150ms_ease_forwards] origin-top-right">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-[var(--color-dark)] truncate">
              {user?.full_name ?? user?.username}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <Badge variant="gold" size="sm" className="mt-1 capitalize">
              {user?.role}
            </Badge>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-dark-soft)] hover:bg-[var(--color-surface)] hover:text-[var(--color-gold)] transition-colors duration-100"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="pt-1 border-t border-gray-100">
            <button
              onClick={() => { setOpen(false); onLogout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-100"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile drawer */
function MobileDrawer({ isOpen, onClose, user, cartCount, onLogout }) {
  const navigate = useNavigate();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[calc(var(--z-overlay)-1)]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out panel */}
      <div
        className={[
          'fixed top-0 right-0 h-full w-72 bg-white shadow-[var(--shadow-modal)] z-[var(--z-overlay)]',
          'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-lg tracking-tight text-[var(--color-dark)]">
            EVEN<span className="text-[var(--color-gold)]">TAT</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center justify-center w-11 h-11 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                    : 'text-[var(--color-dark-soft)] hover:bg-[var(--color-surface)] hover:text-[var(--color-gold)]',
                ].join(' ')
              }
            >
              <span className="opacity-60">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-gray-100" />

          {user ? (
            <>
              {/* Role-specific links */}
              {user.role === 'customer' && (
                <>
                  <NavLink to="/customer/dashboard" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'text-[var(--color-dark-soft)] hover:bg-[var(--color-surface)]'}`}>
                    <LayoutDashboard size={16} className="opacity-60" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/customer/cart"      onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'text-[var(--color-dark-soft)] hover:bg-[var(--color-surface)]'}`}>
                    <ShoppingCart size={16} className="opacity-60" />
                    Cart
                    {cartCount > 0 && <Badge variant="gold" size="sm">{cartCount}</Badge>}
                  </NavLink>
                </>
              )}
              {user.role === 'vendor' && (
                <NavLink to="/vendor/dashboard" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'text-[var(--color-dark-soft)] hover:bg-[var(--color-surface)]'}`}>
                  <LayoutDashboard size={16} className="opacity-60" />
                  Vendor Dashboard
                </NavLink>
              )}
              {user.role === 'admin' && (
                <NavLink to="/admin/dashboard" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-red-500/10 text-red-500' : 'text-[var(--color-dark-soft)] hover:bg-[var(--color-surface)]'}`}>
                  <LayoutDashboard size={16} className="opacity-60" />
                  Admin Dashboard
                </NavLink>
              )}

              <div className="my-3 border-t border-gray-100" />

              {/* Logout */}
              <button
                onClick={() => { onClose(); onLogout(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/Login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 mx-2 px-5 py-2.5 rounded-xl border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-semibold hover:bg-[var(--color-gold)]/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="flex items-center justify-center gap-2 mx-2 mt-2 px-5 py-2.5 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:bg-[var(--color-gold-dark)] transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  Navbar
// ─────────────────────────────────────────────────────────────

function Navbar() {
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [scrolled,   setScrolled]     = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount }                  = useCartStore();
  const cartCount = getItemCount();

  // Detect scroll for shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-[var(--z-sticky)] bg-white/95 backdrop-blur-md',
          'transition-shadow duration-200',
          scrolled ? 'shadow-[var(--shadow-card)]' : 'border-b border-gray-100',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ─────────────────────────────────────── */}
            <Link
              to="/home"
              className="shrink-0 text-xl font-extrabold tracking-tight text-[var(--color-dark)] hover:opacity-80 transition-opacity"
            >
              EVEN<span className="text-[var(--color-gold)]">TAT</span>
            </Link>

            {/* ── Center nav links (desktop) ───────────────── */}
            <nav className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* ── Right actions ────────────────────────────── */}
            <div className="flex items-center gap-2">

              {isAuthenticated && user ? (
                <>
                  {/* Cart (customers only) */}
                  {user.role === 'customer' && (
                    <IconButton
                      to="/customer/cart"
                      icon={<ShoppingCart size={19} />}
                      badge={cartCount}
                      label="Shopping cart"
                    />
                  )}

                  {/* Notification bell (all authenticated) */}
                  <IconButton
                    to={user.role === 'customer' ? '/customer/notifications' : '/vendor/notifications'}
                    icon={<Bell size={19} />}
                    label="Notifications"
                  />

                  {/* Vendor dashboard shortcut */}
                  {user.role === 'vendor' && (
                    <Link
                      to="/vendor/dashboard"
                      className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[var(--color-gold)]/40 text-[var(--color-gold)] text-sm font-medium hover:bg-[var(--color-gold)]/10 transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                  )}

                  {/* Admin dashboard shortcut */}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-500/40 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Admin Panel
                    </Link>
                  )}

                  {/* User dropdown */}
                  <UserDropdown user={user} onLogout={logout} />
                </>
              ) : (
                /* Guest actions */
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/Login"
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[var(--color-dark-soft)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-white text-sm font-semibold hover:bg-[var(--color-gold-dark)] transition-colors shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl text-[var(--color-dark-soft)] hover:bg-[var(--color-surface)] transition-colors"
              >
                <Menu size={20} />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        cartCount={cartCount}
        onLogout={logout}
      />

      {/* Spacer so content starts below the fixed navbar */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}

export default Navbar;
