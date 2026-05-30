import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, Tag,
  BarChart2, LogOut, ChevronLeft, ChevronRight,
  Shield, Bell,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const ADMIN_NAV = [
  { to: '/admin/dashboard',   icon: <LayoutDashboard size={18}/>, label: 'Overview'    },
  { to: '/admin/vendors',     icon: <Briefcase size={18}/>,       label: 'Vendors',    badge: 4 },
  { to: '/admin/users',       icon: <Users size={18}/>,           label: 'Users'       },
  { to: '/admin/categories',  icon: <Tag size={18}/>,             label: 'Categories'  },
  { to: '/admin/analytics',   icon: <BarChart2 size={18}/>,       label: 'Analytics'   },
  { to: '/admin/notifications', icon: <Bell size={18}/>,          label: 'Notifications', badge: 3 },
];

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#0F1117] font-sans">

      {/* ══ SIDEBAR ══ */}
      <aside className={[
        'flex flex-col bg-[#1A1D27] border-r border-[#2A2D3A]',
        'sticky top-0 h-screen shrink-0',
        'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'w-[72px]' : 'w-64',
      ].join(' ')}>

        {/* Logo */}
        <div className={[
          'flex items-center gap-3 p-5 border-b border-[#2A2D3A]',
          collapsed ? 'justify-center px-2' : '',
        ].join(' ')}>
          {!collapsed && (
            <Link to="/admin/dashboard"
              className="text-xl font-extrabold tracking-tight text-white">
              EVEN<span className="text-[var(--color-gold)]">TAT</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)] 
              flex items-center justify-center">
              <Shield size={16} className="text-[#0F1117]" />
            </div>
          )}
        </div>

        {/* Admin badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-[#2A2D3A]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/20 
                flex items-center justify-center shrink-0">
                <Shield size={15} className="text-[var(--color-gold)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.full_name ?? user?.username ?? 'Admin'}
                </p>
                <p className="text-[10px] font-bold text-[var(--color-gold)] 
                  uppercase tracking-wider">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => [
                'flex items-center gap-3 rounded-xl transition-all relative group',
                collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
                isActive
                  ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]'
                  : 'text-[#8B8FA8] hover:bg-[#22253A] hover:text-white',
              ].join(' ')}
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-[var(--color-gold)]' : ''}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 text-sm font-semibold">
                      {item.label}
                    </span>
                  )}
                  {/* Badge (e.g. pending vendors count) */}
                  {item.badge && !collapsed && (
                    <span className="min-w-[20px] h-5 flex items-center 
                      justify-center rounded-full bg-amber-500 text-[#0F1117] 
                      text-[10px] font-black px-1.5">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && collapsed && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 
                      rounded-full bg-amber-500" />
                  )}
                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 
                      rounded-lg bg-[var(--color-dark)] text-white text-xs 
                      font-medium whitespace-nowrap opacity-0 
                      pointer-events-none group-hover:opacity-100 
                      transition-opacity z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle + Logout */}
        <div className="p-3 border-t border-[#2A2D3A] space-y-1">
          <button
            onClick={() => setCollapsed(v => !v)}
            className={[
              'w-full flex items-center gap-3 rounded-xl px-4 py-3',
              'text-[#8B8FA8] hover:bg-[#22253A] hover:text-white',
              'transition-colors text-sm font-semibold',
              collapsed ? 'justify-center px-2' : '',
            ].join(' ')}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={18} />
              : <><ChevronLeft size={18} /> <span>Collapse</span></>
            }
          </button>
          <button
            onClick={handleLogout}
            className={[
              'w-full flex items-center gap-3 rounded-xl px-4 py-3',
              'text-red-400 hover:bg-red-500/10 hover:text-red-300',
              'transition-colors text-sm font-semibold',
              collapsed ? 'justify-center px-2' : '',
            ].join(' ')}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center 
          justify-between px-6 py-4 bg-[#1A1D27] border-b 
          border-[#2A2D3A]">
          <div>
            <p className="text-[11px] font-bold text-[var(--color-gold)] 
              uppercase tracking-[0.18em]">
              Admin Panel
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <Link to="/admin/notifications" className="relative w-9 h-9 rounded-xl bg-[#0F1117] 
              border border-[#2A2D3A] flex items-center justify-center 
              text-[#8B8FA8] hover:text-white hover:border-[var(--color-gold)] 
              transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 
                rounded-full bg-red-500" />
            </Link>
            {/* Back to site */}
            <Link to="/home"
              className="hidden sm:flex items-center gap-2 px-4 py-2 
                bg-[#0F1117] border border-[#2A2D3A] text-[#8B8FA8] 
                text-sm font-bold rounded-xl hover:border-[var(--color-gold)] 
                hover:text-[var(--color-gold)] transition-colors">
              ← View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
          <Outlet context={{ isSidebarOpen: !collapsed }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
