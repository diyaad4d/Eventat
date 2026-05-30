import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Eye, ShieldOff, ShieldCheck, 
  User, Briefcase, AlertTriangle, X, Calendar 
} from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import PageTransition from '../../components/shared/PageTransition';
import { toastWarning, toastSuccess } from '../../utils/toast';

// ─────────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────────

const MOCK_USERS = [
  // 1 Admin
  { id: 'u001', name: 'Tareq Admin', email: 'admin@eventat.com', role: 'admin', joinDate: '2022-01-10', lastActive: 'Just now', status: 'active', avatar: 'https://i.pravatar.cc/150?img=11', bookingsCount: 0, servicesCount: 0, city: 'Amman' },
  
  // 4 Vendors
  { id: 'u002', name: 'Khalid Al-Mansour', email: 'khalid@royalgardens.jo', role: 'vendor', joinDate: '2024-03-15', lastActive: 'Yesterday', status: 'active', avatar: 'https://i.pravatar.cc/150?img=12', bookingsCount: 0, servicesCount: 3, city: 'Amman' },
  { id: 'u003', name: 'Sarah Qasim', email: 'sarah.q@elitecatering.com', role: 'vendor', joinDate: '2024-05-20', lastActive: '2 hours ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=5', bookingsCount: 0, servicesCount: 8, city: 'Amman' },
  { id: 'u004', name: 'Tariq Haddad', email: 'tariq@goldenmoments.jo', role: 'vendor', joinDate: '2025-01-10', lastActive: '3 days ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=33', bookingsCount: 0, servicesCount: 4, city: 'Irbid' },
  { id: 'u005', name: 'Omar Ziad', email: 'omar.dj@ammanstars.com', role: 'vendor', joinDate: '2025-06-05', lastActive: 'Last week', status: 'active', avatar: 'https://i.pravatar.cc/150?img=15', bookingsCount: 0, servicesCount: 2, city: 'Amman' },

  // 14 Customers + 1 Banned Customer (Total 15 Customers)
  { id: 'u006', name: 'Ahmad Al-Rashid', email: 'ahmad@example.com', role: 'customer', joinDate: '2025-03-15', lastActive: 'Yesterday', status: 'active', avatar: 'https://i.pravatar.cc/150?img=8', bookingsCount: 7, servicesCount: 0, city: 'Amman' },
  { id: 'u007', name: 'Lina Yassin', email: 'lina@example.com', role: 'customer', joinDate: '2025-04-12', lastActive: '2 days ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=9', bookingsCount: 2, servicesCount: 0, city: 'Zarqa' },
  { id: 'u008', name: 'Yousef Nabeel', email: 'yousef@example.com', role: 'customer', joinDate: '2025-08-01', lastActive: 'Just now', status: 'active', avatar: 'https://i.pravatar.cc/150?img=13', bookingsCount: 1, servicesCount: 0, city: 'Amman' },
  { id: 'u009', name: 'Rania Haddad', email: 'rania.h@example.com', role: 'customer', joinDate: '2025-09-15', lastActive: '5 hours ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=20', bookingsCount: 4, servicesCount: 0, city: 'Salt' },
  { id: 'u010', name: 'Firas Jaber', email: 'firas@example.com', role: 'customer', joinDate: '2025-11-20', lastActive: '1 week ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=53', bookingsCount: 0, servicesCount: 0, city: 'Jerash' },
  { id: 'u011', name: 'Amal Saqer', email: 'amal.s@example.com', role: 'customer', joinDate: '2026-01-05', lastActive: 'Yesterday', status: 'active', avatar: 'https://i.pravatar.cc/150?img=49', bookingsCount: 3, servicesCount: 0, city: 'Amman' },
  { id: 'u012', name: 'Ibrahim Khawaja', email: 'ibrahim.k@example.com', role: 'customer', joinDate: '2026-02-14', lastActive: '2 weeks ago', status: 'banned', avatar: 'https://i.pravatar.cc/150?img=68', bookingsCount: 0, servicesCount: 0, city: 'Aqaba' },
  { id: 'u013', name: 'Mona Zeid', email: 'mona.z@example.com', role: 'customer', joinDate: '2026-03-01', lastActive: '1 month ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=44', bookingsCount: 1, servicesCount: 0, city: 'Irbid' },
  { id: 'u014', name: 'Kareem Ali', email: 'kareem@example.com', role: 'customer', joinDate: '2026-03-10', lastActive: 'Today', status: 'active', avatar: 'https://i.pravatar.cc/150?img=59', bookingsCount: 5, servicesCount: 0, city: 'Amman' },
  { id: 'u015', name: 'Nour Kareem', email: 'nour.k@example.com', role: 'customer', joinDate: '2026-03-15', lastActive: 'Yesterday', status: 'active', avatar: 'https://i.pravatar.cc/150?img=32', bookingsCount: 2, servicesCount: 0, city: 'Madaba' },
  { id: 'u016', name: 'Hassan Ali', email: 'hassan.ali@example.com', role: 'customer', joinDate: '2026-04-05', lastActive: '4 days ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=60', bookingsCount: 1, servicesCount: 0, city: 'Amman' },
  { id: 'u017', name: 'Zeina Mahmoud', email: 'zeina.m@example.com', role: 'customer', joinDate: '2026-04-20', lastActive: 'Yesterday', status: 'active', avatar: 'https://i.pravatar.cc/150?img=47', bookingsCount: 6, servicesCount: 0, city: 'Amman' },
  { id: 'u018', name: 'Majed Othman', email: 'majed.o@example.com', role: 'customer', joinDate: '2026-05-01', lastActive: 'Today', status: 'active', avatar: 'https://i.pravatar.cc/150?img=14', bookingsCount: 3, servicesCount: 0, city: 'Aqaba' },
  { id: 'u019', name: 'Rami Suleiman', email: 'rami.s@example.com', role: 'customer', joinDate: '2026-05-10', lastActive: '3 hours ago', status: 'active', avatar: 'https://i.pravatar.cc/150?img=3', bookingsCount: 0, servicesCount: 0, city: 'Amman' },
  { id: 'u020', name: 'Sami Daoud', email: 'sami.d@example.com', role: 'customer', joinDate: '2026-05-20', lastActive: 'Just now', status: 'active', avatar: 'https://i.pravatar.cc/150?img=7', bookingsCount: 2, servicesCount: 0, city: 'Irbid' },
];

// Helper to format join date
function formatJoinDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);
  const [confirmBanId, setConfirmBanId] = useState(null);

  const ITEMS_PER_PAGE = 8;

  const customersCount = users.filter(u => u.role === 'customer').length;
  const vendorsCount = users.filter(u => u.role === 'vendor').length;
  const bannedCount = users.filter(u => u.status === 'banned').length;

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = 
        roleFilter === 'All Roles' || 
        u.role.toLowerCase() === roleFilter.toLowerCase();
      
      const matchesStatus = 
        statusFilter === 'All Status' || 
        u.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // If page is out of bounds after filtering, reset to 1
  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredUsers, page, totalPages]);

  const handleToggleBan = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'active' ? 'banned' : 'active';
        if (newStatus === 'banned') toastWarning("User has been banned from the platform.");
        else toastSuccess("User access restored.");
        return { ...u, status: newStatus };
      }
      return u;
    }));
    setConfirmBanId(null);
  };

  return (
    <PageTransition className="min-h-screen bg-[#0F1117] p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* ══ SECTION 1: PAGE HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              User Management
            </h1>
            <p className="text-sm text-[#8B8FA8] mt-1">
              Manage all registered users across the platform.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-4 py-2 shadow-sm min-w-[90px]">
              <span className="text-xl font-black text-indigo-400">{customersCount}</span>
              <span className="text-[10px] font-bold text-[#8B8FA8] uppercase tracking-wider">Customers</span>
            </div>
            <div className="flex flex-col items-center bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-4 py-2 shadow-sm min-w-[90px]">
              <span className="text-xl font-black text-[var(--color-gold)]">{vendorsCount}</span>
              <span className="text-[10px] font-bold text-[#8B8FA8] uppercase tracking-wider">Vendors</span>
            </div>
            <div className="flex flex-col items-center bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-4 py-2 shadow-sm min-w-[90px]">
              <span className="text-xl font-black text-red-400">{bannedCount}</span>
              <span className="text-[10px] font-bold text-[#8B8FA8] uppercase tracking-wider">Banned</span>
            </div>
          </div>
        </div>

        {/* ══ SECTION 2: SEARCH + FILTER ROW ══ */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-[#1A1D27] p-4 rounded-2xl border border-[#2A2D3A]">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8FA8]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 min-h-[44px] bg-[#0F1117] border border-[#2A2D3A] text-white rounded-lg outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] text-sm transition-all placeholder-[#8B8FA8]"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full md:w-auto px-4 py-2 min-h-[44px] bg-[#0F1117] border border-[#2A2D3A] text-white rounded-lg outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] text-sm transition-all cursor-pointer"
            >
              <option>All Roles</option>
              <option>Customer</option>
              <option>Vendor</option>
              <option>Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full md:w-auto px-4 py-2 min-h-[44px] bg-[#0F1117] border border-[#2A2D3A] text-white rounded-lg outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] text-sm transition-all cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Banned</option>
            </select>
          </div>
        </div>

        {/* ══ SECTION 3: USERS DATA TABLE ══ */}
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-[#2A2D3A] text-xs font-bold uppercase tracking-wider text-[#8B8FA8] bg-[#0F1117]/50">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Join Date</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Activity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2D3A]">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-16 bg-[#0F1117]">
                      {/* ══ SECTION 5: EMPTY STATE ══ */}
                      <EmptyState 
                        variant="no-results" 
                        title="No users found"
                        subtitle="Try adjusting your search filters."
                        onAction={() => { setSearchTerm(''); setRoleFilter('All Roles'); setStatusFilter('All Status'); }}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    // Render Ban Confirmation inline
                    if (confirmBanId === user.id) {
                      const isBanAction = user.status === 'active';
                      return (
                        <tr key={`confirm-${user.id}`} className="bg-red-500/10 border-l-4 border-red-500">
                          <td colSpan={8} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-red-400">
                                <AlertTriangle size={18} />
                                <span className="text-sm font-bold">
                                  {isBanAction ? `Ban "${user.name}"? This will block all access.` : `Unban "${user.name}"? This restores access.`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setConfirmBanId(null)}
                                  className="px-4 py-1.5 min-h-[44px] bg-[#2A2D3A] hover:bg-[#3b3f54] text-white text-xs font-bold rounded-md transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleToggleBan(user.id)}
                                  className={`px-4 py-1.5 min-h-[44px] text-white text-xs font-bold rounded-md transition-colors ${
                                    isBanAction ? 'bg-red-500 hover:bg-red-400' : 'bg-emerald-500 hover:bg-emerald-400'
                                  }`}
                                >
                                  {isBanAction ? 'Confirm Ban' : 'Confirm Unban'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // Render Standard Row
                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-[#22253A] transition-colors group ${user.role === 'admin' ? 'border-l-4 border-l-[var(--color-gold)]' : 'border-l-4 border-l-transparent'}`}
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#2A2D3A]" />
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-[var(--color-gold)] transition-colors">
                                {user.name}
                              </p>
                              <p className="text-xs text-[#8B8FA8]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            user.role === 'customer' ? 'bg-indigo-500/10 text-indigo-400' :
                            user.role === 'vendor' ? 'bg-[#C9A24D]/10 text-[var(--color-gold)]' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[#8B8FA8]">{formatJoinDate(user.joinDate)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[#8B8FA8]">{user.lastActive}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[#8B8FA8]">{user.city}</span>
                        </td>
                        <td className="p-4">
                          {user.role === 'customer' ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                              <Calendar size={14} className="text-[#8B8FA8]" /> {user.bookingsCount}
                            </div>
                          ) : user.role === 'vendor' ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                              <Briefcase size={14} className="text-[#8B8FA8]" /> {user.servicesCount}
                            </div>
                          ) : (
                            <span className="text-sm text-[#8B8FA8]">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${
                            user.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className="capitalize">{user.status}</span>
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => console.log('Navigate to /users/' + user.id)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8B8FA8] hover:text-[var(--color-gold)] hover:bg-[#2A2D3A] rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Eye size={16} />
                            </button>
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => setConfirmBanId(user.id)}
                                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors ${
                                  user.status === 'active' 
                                    ? 'text-[#8B8FA8] hover:text-red-400 hover:bg-red-500/10' 
                                    : 'text-[#8B8FA8] hover:text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                                title={user.status === 'active' ? "Ban User" : "Unban User"}
                              >
                                {user.status === 'active' ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* ══ SECTION 4: TABLE FOOTER + PAGINATION ══ */}
          {filteredUsers.length > 0 && (
            <div className="p-4 border-t border-[#2A2D3A] bg-[#0F1117]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-sm text-[#8B8FA8]">
                Showing <span className="font-bold text-white">{startIndex + 1}</span> to <span className="font-bold text-white">{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className="font-bold text-white">{filteredUsers.length}</span> users
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 min-h-[44px] text-sm font-medium text-[#8B8FA8] hover:text-white disabled:opacity-50 disabled:hover:text-[#8B8FA8] transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      page === i + 1 
                        ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/50' 
                        : 'text-[#8B8FA8] hover:bg-[#2A2D3A] hover:text-white border border-transparent'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 min-h-[44px] text-sm font-medium text-[#8B8FA8] hover:text-white disabled:opacity-50 disabled:hover:text-[#8B8FA8] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
