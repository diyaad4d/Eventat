import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Eye, ShieldOff, ShieldCheck, 
  User, Briefcase, AlertTriangle, X, Calendar 
} from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import PageTransition from '../../components/shared/PageTransition';
import { toastWarning, toastSuccess } from '../../utils/toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, toggleUserBan } from '../../services/admin.service';

// Helper to format join date
function formatJoinDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);
  const [confirmBanId, setConfirmBanId] = useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const ITEMS_PER_PAGE = 8;

  const roleParam = roleFilter === 'All Roles' ? undefined : roleFilter.toLowerCase();
  const statusParam = statusFilter === 'All Status' ? undefined : statusFilter.toLowerCase();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleParam, statusParam, debouncedSearch, page],
    queryFn: () => getUsers({
      role: roleParam,
      status: statusParam,
      search: debouncedSearch || undefined,
      page,
      limit: ITEMS_PER_PAGE
    }),
  });

  const users = data?.data?.users || [];
  const counts = data?.data?.counts || { customers: 0, vendors: 0, banned: 0 };
  const pagination = data?.data?.pagination || { totalPages: 1, total: 0 };

  const customersCount = counts.customers || 0;
  const vendorsCount = counts.vendors || 0;
  const bannedCount = counts.banned || 0;

  const totalPages = pagination.totalPages;
  const totalUsers = pagination.total;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  const toggleBanMutation = useMutation({
    mutationFn: (id) => toggleUserBan(id),
    onSuccess: (res) => {
      const isNowActive = res.data.user.is_active;
      if (!isNowActive) toastWarning("User has been banned from the platform.");
      else toastSuccess("User access restored.");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setConfirmBanId(null);
    },
    onError: () => {
      toastWarning("Failed to update user status.");
    }
  });

  const handleToggleBan = (id) => {
    toggleBanMutation.mutate(id);
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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#8B8FA8]">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
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
                  users.map((user) => {
                    // Render Ban Confirmation inline
                    if (confirmBanId === user.user_id) {
                      const isBanAction = user.status === 'active';
                      return (
                        <tr key={`confirm-${user.user_id}`} className="bg-red-500/10 border-l-4 border-red-500">
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
                                  onClick={() => handleToggleBan(user.user_id)}
                                  disabled={toggleBanMutation.isPending}
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
                        key={user.user_id} 
                        className={`hover:bg-[#22253A] transition-colors group ${user.role === 'admin' ? 'border-l-4 border-l-[var(--color-gold)]' : 'border-l-4 border-l-transparent'}`}
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar || 'https://i.pravatar.cc/150'} alt="" className="w-10 h-10 rounded-full object-cover border border-[#2A2D3A]" />
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
                          <span className="text-sm text-[#8B8FA8]">{user.lastActive || 'N/A'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[#8B8FA8]">{user.city || 'N/A'}</span>
                        </td>
                        <td className="p-4">
                          {user.role === 'customer' ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                              <Calendar size={14} className="text-[#8B8FA8]" /> {user.bookingsCount || 0}
                            </div>
                          ) : user.role === 'vendor' ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                              <Briefcase size={14} className="text-[#8B8FA8]" /> {user.servicesCount || 0}
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
                              onClick={() => console.log('Navigate to /users/' + user.user_id)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8B8FA8] hover:text-[var(--color-gold)] hover:bg-[#2A2D3A] rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Eye size={16} />
                            </button>
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => setConfirmBanId(user.user_id)}
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
          {totalUsers > 0 && (
            <div className="p-4 border-t border-[#2A2D3A] bg-[#0F1117]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-sm text-[#8B8FA8]">
                Showing <span className="font-bold text-white">{startIndex + 1}</span> to <span className="font-bold text-white">{Math.min(startIndex + ITEMS_PER_PAGE, totalUsers)}</span> of <span className="font-bold text-white">{totalUsers}</span> users
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
