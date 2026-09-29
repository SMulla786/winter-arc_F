import React, { useState } from 'react';
import { CreditCard, Search, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED'>('ALL');
  const [payments, setPayments] = useState<any[]>([]);

  const filtered = payments.filter((p) => (filter === 'ALL' ? true : p.status === filter));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">SUBSCRIPTIONS & PAYMENT LOGS</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Razorpay transaction verification and plan subscription records</p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
          Total Revenue: ₹84,500
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121216] rounded-xl border border-zinc-800 w-max">
        {(['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
              filter === f
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 overflow-x-auto shadow-md">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 text-[11px] font-black uppercase text-zinc-500">
            <tr>
              <th className="pb-3 px-2">Payment ID</th>
              <th className="pb-3 px-2">User</th>
              <th className="pb-3 px-2">Plan</th>
              <th className="pb-3 px-2">Amount</th>
              <th className="pb-3 px-2">Date</th>
              <th className="pb-3 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No subscription payment records found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/50 transition">
                  <td className="py-3 px-2 font-mono text-zinc-400">{p.id}</td>
                  <td className="py-3 px-2 font-extrabold text-white">{p.user}</td>
                  <td className="py-3 px-2 font-bold text-amber-400">{p.plan}</td>
                  <td className="py-3 px-2 font-black text-white">₹{p.amount}</td>
                  <td className="py-3 px-2 text-zinc-400">{p.date}</td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                        p.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'FAILED'
                          ? 'bg-red-950 text-red-400 border border-red-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {p.status === 'SUCCESS' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                      {p.status === 'FAILED' && <XCircle className="h-3 w-3 text-red-400" />}
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
