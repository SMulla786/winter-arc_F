import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Shield, ChevronRight } from 'lucide-react';
import { fetchAdminUsersList } from '../../services/api';

interface AdminUsersPageProps {
  onSelectUser: (user: any) => void;
}

export default function AdminUsersPage({ onSelectUser }: AdminUsersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PRO' | 'PREMIUM' | 'ACTIVE'>('ALL');
  const [users, setUsers] = useState<any[]>([
    { id: 'u1', name: 'Suhel Mulla', email: 'suhel@example.com', plan: 'Pro', status: 'ACTIVE', joined: '15 Aug 2026', scans: 42, aiChats: 118 },
    { id: 'u2', name: 'Rahul Sharma', email: 'rahul@example.com', plan: 'Free', status: 'ACTIVE', joined: '18 Aug 2026', scans: 8, aiChats: 22 },
    { id: 'u3', name: 'Amit Patel', email: 'amit@example.com', plan: 'Pro', status: 'ACTIVE', joined: '20 Aug 2026', scans: 34, aiChats: 89 },
    { id: 'u4', name: 'Sara Khan', email: 'sara@example.com', plan: 'Premium', status: 'ACTIVE', joined: '01 Sep 2026', scans: 78, aiChats: 210 },
  ]);

  useEffect(() => {
    fetchAdminUsersList()
      .then((res) => {
        const list = res.data?.users || res.users;
        if (list && list.length > 0) {
          setUsers(
            list.map((u: any) => ({
              id: u.id,
              name: u.name || 'User',
              email: u.email,
              plan: u.subscriptions?.[0]?.plan?.name || 'Free',
              status: u.isActive ? 'ACTIVE' : 'INACTIVE',
              joined: new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
              scans: 12,
              aiChats: 45,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return u.status === 'ACTIVE';
    return u.plan.toUpperCase() === filter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">REGISTERED USER DIRECTORY</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Manage user accounts, subscriptions, and AI scan usage limits</p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 uppercase">
          {users.length} Total Users
        </span>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121216] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#121216] p-1 rounded-xl border border-zinc-800">
          {(['ALL', 'FREE', 'PRO', 'PREMIUM', 'ACTIVE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                filter === f
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 overflow-x-auto shadow-md">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 text-[11px] font-black uppercase text-zinc-500">
            <tr>
              <th className="pb-3 px-2">Name</th>
              <th className="pb-3 px-2">Email</th>
              <th className="pb-3 px-2">Plan</th>
              <th className="pb-3 px-2">Status</th>
              <th className="pb-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                onClick={() => onSelectUser(u)}
                className="hover:bg-zinc-800/50 cursor-pointer transition"
              >
                <td className="py-3 px-2 font-extrabold text-white">{u.name}</td>
                <td className="py-3 px-2 text-zinc-400">{u.email}</td>
                <td className="py-3 px-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      u.plan === 'Premium'
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                        : u.plan === 'Pro'
                        ? 'bg-red-950/60 text-red-300 border border-red-500/40'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {u.plan}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-amber-400 font-bold">
                  Details →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
