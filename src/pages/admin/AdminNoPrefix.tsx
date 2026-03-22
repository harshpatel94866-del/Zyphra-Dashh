import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { Zap, Users, Server, Loader2, Search, Trash2, Plus, Clock, Timer } from 'lucide-react';

interface NoPrefixEntry {
    user_id: string;
    guild_id: string | null;
    added_by: string | null;
    username: string | null;
    avatar: string | null;
    guild_name: string | null;
    added_by_name: string | null;
}

interface TrialEntry {
    user_id: string;
    guild_id: string;
    expires_at: number;
    username: string | null;
    guild_name: string | null;
}

const AdminNoPrefix: React.FC = () => {
    const [tab, setTab] = useState<'active' | 'trials'>('active');
    const [entries, setEntries] = useState<NoPrefixEntry[]>([]);
    const [trials, setTrials] = useState<TrialEntry[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [loadingTrials, setLoadingTrials] = useState(true);
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Add form
    const [newUserId, setNewUserId] = useState('');
    const [newGuildId, setNewGuildId] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchEntries = async (silent = false) => {
        if (!silent) setLoadingEntries(true);
        try {
            const res = await api.get('/admin/noprefix');
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
        finally { setLoadingEntries(false); }
    };

    const fetchTrials = async (silent = false) => {
        if (!silent) setLoadingTrials(true);
        try {
            const res = await api.get('/admin/noprefix/trials');
            setTrials(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
        finally { setLoadingTrials(false); }
    };

    const fetchAll = async (silent = false) => {
        await Promise.all([fetchEntries(silent), fetchTrials(silent)]);
        setLastUpdated(new Date());
    };

    useEffect(() => {
        fetchAll();
        intervalRef.current = setInterval(() => fetchAll(true), 30000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserId || !newGuildId) return;
        setAdding(true);
        try {
            await api.post('/admin/noprefix', {
                user_id: newUserId,
                guild_id: newGuildId,
            });
            setNewUserId(''); setNewGuildId('');
            await fetchEntries();
        } catch (e) { console.error(e); }
        finally { setAdding(false); }
    };

    const handleRemove = async (userId: string, guildId: string) => {
        if (!window.confirm(`Remove NP for user ${userId} in guild ${guildId}?`)) return;
        try { await api.delete(`/admin/noprefix/${userId}/${guildId}`); await fetchEntries(); }
        catch (e) { console.error(e); }
    };

    const formatTimeLeft = (expiresAt: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = expiresAt - now;
        if (diff <= 0) return 'Expired';
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        return `${m}m ${s}s left`;
    };

    const filteredEntries = entries.filter(e =>
        (e.username || '').toLowerCase().includes(search.toLowerCase()) ||
        e.user_id.includes(search) ||
        (e.guild_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.guild_id || '').includes(search)
    );

    const filteredTrials = trials.filter(t =>
        (t.username || '').toLowerCase().includes(search.toLowerCase()) ||
        t.user_id.includes(search) ||
        (t.guild_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-500 bg-clip-text text-transparent">
                        ⚡ No Prefix Manager
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Manage global no-prefix entries — reads from <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded">db/noprefix.db</code></p>
                </div>
                {lastUpdated && (
                    <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-gray-400">Live • {lastUpdated.toLocaleTimeString()}</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('active')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${tab === 'active' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'}`}>
                    <Zap className="w-4 h-4" /> Active NP ({entries.length})
                </button>
                <button onClick={() => setTab('trials')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${tab === 'trials' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'}`}>
                    <Timer className="w-4 h-4" /> Trials ({trials.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form (only for active tab) */}
                <div className="lg:col-span-1">
                    {tab === 'active' ? (
                        <form onSubmit={handleAdd} className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 shadow-2xl">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-cyan-400" /> Grant No Prefix</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">User ID *</label>
                                    <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="e.g. 1070619082..." className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Guild ID *</label>
                                    <input type="text" value={newGuildId} onChange={e => setNewGuildId(e.target.value)} placeholder="e.g. 11234567890..." className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                                </div>
                                <button type="submit" disabled={adding || !newUserId || !newGuildId} className="w-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 text-cyan-400 border border-cyan-500/30 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Grant NP
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 shadow-2xl">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3"><Timer className="w-4 h-4 text-amber-400" /> Trial Info</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Trials are <strong className="text-amber-400">5-minute</strong> no-prefix sessions created via the <code className="text-[11px] bg-white/5 px-1 py-0.5 rounded">trialnp</code> command. They auto-expire and get cleaned up every minute by the bot.
                            </p>
                            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                                <p className="text-xs text-amber-400">⏰ Active trials: <strong>{trials.length}</strong></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="relative mb-4">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, guild, or ID..." className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>

                    {tab === 'active' ? (
                        <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm font-bold text-white">Active No-Prefix ({filteredEntries.length})</span>
                            </div>
                            {loadingEntries ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-cyan-500 opacity-50" /></div>
                            ) : filteredEntries.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-12">No active no-prefix entries.</p>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredEntries.map((entry, i) => (
                                        <div key={`${entry.user_id}-${entry.guild_id}-${i}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                                            {entry.avatar ? <img src={entry.avatar} alt="" className="w-9 h-9 rounded-full" /> :
                                                <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">{(entry.username || '?').charAt(0)}</div>}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white truncate">{entry.username || entry.user_id}</span>
                                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold px-1.5 py-0.5 rounded">NP</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    <span className="flex items-center gap-1"><Server className="w-3 h-3" /> {entry.guild_name || entry.guild_id}</span>
                                                    {entry.added_by_name && <span>Added by {entry.added_by_name}</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemove(entry.user_id, entry.guild_id || '')} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                                <Timer className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-bold text-white">Active Trials ({filteredTrials.length})</span>
                            </div>
                            {loadingTrials ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-500 opacity-50" /></div>
                            ) : filteredTrials.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-12">No active trial sessions.</p>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredTrials.map((t, i) => (
                                        <div key={`${t.user_id}-${t.guild_id}-${i}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                                            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">⏰</div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-white truncate block">{t.username || t.user_id}</span>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    <span className="flex items-center gap-1"><Server className="w-3 h-3" /> {t.guild_name || t.guild_id}</span>
                                                    <span className="text-amber-400 font-medium">{formatTimeLeft(t.expires_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNoPrefix;
