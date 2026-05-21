import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, ShoppingCart, Bell, User,
  Briefcase, ClipboardList, BarChart2, Store,
  LogOut, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';

import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import Navbar from './Navbar';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';





/*   to understand the arc of dashboard :

<DashboardLayout>  (Main Component - Full Screen)
   │
   ├── <Navbar />  (Top Navigation Bar)
   │
   ├── <Sidebar>   (Outer Framework of the Sidebar Menu)
   │    │
   │    └── <SidebarContent>  (Sidebar Content / Menu Items)
   │         │
   │         ├── <SidebarLink /> (Link 1: Overview / Dashboard)
   │         ├── <SidebarLink /> (Link 2: My Bookings / Requests)
   │         └── Logout Button
   │
   └── {children}  (Page content appears here, e.g., Bookings Table / Analytics)


*/

// ─────────────────────────────────────────────────────────────
//  Sidebar configuration per role
// ─────────────────────────────────────────────────────────────

const CUSTOMER_NAV = [
  { to: '/customer/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/customer/events', icon: <Calendar size={18} />, label: 'My Events' },
  { to: '/customer/bookings', icon: <ClipboardList size={18} />, label: 'My Bookings' },
  { to: '/customer/cart', icon: <ShoppingCart size={18} />, label: 'Cart', badge: 'cart' },
  { to: '/customer/notifications', icon: <Bell size={18} />, label: 'Notifications' },
  { to: '/customer/profile', icon: <User size={18} />, label: 'My Profile' },
];

const VENDOR_NAV = [
  { to: '/vendor/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/vendor/services', icon: <Briefcase size={18} />, label: 'My Services' },
  { to: '/vendor/bookings', icon: <ClipboardList size={18} />, label: 'Booking Requests' },
  { to: '/vendor/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
  { to: '/vendor/profile', icon: <Store size={18} />, label: 'My Store' },
  { to: '/vendor/notifications', icon: <Bell size={18} />, label: 'Notifications' },
];

// ─────────────────────────────────────────────────────────────
//  Sidebar
// ─────────────────────────────────────────────────────────────

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const cartCount = getItemCount();

  const navItems = user?.role === 'vendor' ? VENDOR_NAV : CUSTOMER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── Link renderer ─────────────────────────────────────────
  const SidebarLink = ({ item }) => {
    const badgeCount = item.badge === 'cart' ? cartCount : 0;

    return (
      <NavLink
        to={item.to}
        onClick={onMobileClose}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          [
            'flex items-center gap-3 rounded-xl transition-all duration-150 group relative',
            collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
            isActive
              ? 'bg-[var(--color-gold)]/12 text-[var(--color-gold)]'
              : 'text-gray-500 hover:bg-[var(--color-surface)] hover:text-[var(--color-dark)]',
          ].join(' ')
        }
      >
        {({ isActive }) => (
          <>
            <span className={['shrink-0 transition-colors', isActive ? 'text-[var(--color-gold)]' : ''].join(' ')}>
              {item.icon}
            </span>

            {!collapsed && (
              <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
            )}

            {/* Badge */}
            {badgeCount > 0 && !collapsed && (
              <Badge variant="gold" size="sm">{badgeCount}</Badge>
            )}
            {badgeCount > 0 && collapsed && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-gold)]" />
            )}

            {/* Tooltip on collapsed */}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[var(--color-dark)] text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                {item.label}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  // ── Sidebar content ───────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className={['p-4 border-b border-gray-100', collapsed ? 'flex justify-center' : ''].join(' ')}>
        {collapsed ? (
          <Avatar src={user?.avatar_url} name={user?.full_name ?? user?.username} size="sm" />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar_url} name={user?.full_name ?? user?.username} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-dark)] truncate">
                {user?.full_name ?? user?.username}
              </p>
              <Badge variant="gold" size="sm" className="mt-0.5 capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      {/* Divider + Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={[
            'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
            'text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside
        className={[
          'hidden lg:flex flex-col bg-white border-r border-gray-100 shrink-0',
          'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'sticky top-16 self-start',
          collapsed ? 'w-[72px]' : 'w-64',
        ].join(' ')}
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-6 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] shadow-sm transition-colors"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <SidebarContent />
      </aside>

      {/* ── Mobile overlay sidebar ─────────────────────────── */}
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[calc(var(--z-overlay)-1)] lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
        <aside
          className={[
            'fixed top-0 left-0 h-full w-72 bg-white shadow-[var(--shadow-modal)] z-[var(--z-overlay)] flex flex-col',
            'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          {/* Mobile close */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <Link to="/" className="text-lg font-extrabold tracking-tight text-[var(--color-dark)]">
              EVEN<span className="text-[var(--color-gold)]">TAT</span>
            </Link>
            <button
              onClick={onMobileClose}
              aria-label="Close sidebar"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
          <SidebarContent />
        </aside>
      </>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  DashboardLayout
// ─────────────────────────────────────────────────────────────

function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      {/* Top Navbar — shared */}
      <Navbar />

      {/* Body row: sidebar + content */}
      <div className="flex flex-1">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile sidebar trigger */}
          <div className="lg:hidden flex items-center px-4 pt-4 pb-0">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-[var(--color-dark-soft)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
            >
              <Menu size={16} />
              <span className="font-medium">Menu</span>
            </button>
          </div>

          {/* Page content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
