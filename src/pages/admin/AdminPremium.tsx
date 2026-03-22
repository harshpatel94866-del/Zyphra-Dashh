import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { Crown, Users, Server, Loader2, Search, Trash2, Plus, RefreshCw, Clock, Star, Zap } from 'lucide-react';

interface PremiumUser {
    user_id: string;
    tier: string;
    expires_at: string | null;
    autolyrics: boolean;
    username: string | null;
    avatar: string | null;
}

interface PremiumGuild {
    guild_id: string;
    tier: string;
    expires_at: string | null;
    name: string | null;
    icon: string | null;
    member_count: number;
}

const AdminPremium: React.FC = () => {
    const [tab, setTab] = useState<'users' | 'guilds'>('users');
    const [users, setUsers] = useState<PremiumUser[]>([]);
    const [guilds, setGuilds] = useState<PremiumGuild[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingGuilds, setLoadingGuilds] = useState(true);
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // User form
    const [newUserId, setNewUserId] = useState('');
    const [newUserTier, setNewUserTier] = useState('basic');
    const [newUserExpiry, setNewUserExpiry] = useState('');
    const [newUserAutolyrics, setNewUserAutolyrics] = useState(false);
    const [addingUser, setAddingUser] = useState(false);

    // Guild form
    const [newGuildId, setNewGuildId] = useState('');
    const [newGuildTier, setNewGuildTier] = useState('basic');
    const [newGuildExpiry, setNewGuildExpiry] = useState('');
    const [addingGuild, setAddingGuild] = useState(false);

    const fetchUsers = async (silent = false) => {
        if (!silent) setLoadingUsers(true);
        try {
            const res = await api.get('/admin/premium');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
        finally { setLoadingUsers(false); }
    };

    const fetchGuilds = async (silent = false) => {
        if (!silent) setLoadingGuilds(true);
        try {
            const res = await api.get('/admin/premium/guilds');
            setGuilds(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
        finally { setLoadingGuilds(false); }
    };

    const fetchAll = async (silent = false) => {
        await Promise.all([fetchUsers(silent), fetchGuilds(silent)]);
        setLastUpdated(new Date());
    };

    useEffect(() => {
        fetchAll();
        intervalRef.current = setInterval(() => fetchAll(true), 30000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserId) return;
        setAddingUser(true);
        try {
            await api.post('/admin/premium', {
                user_id: newUserId,
                tier: newUserTier,
                expires_at: newUserExpiry || null,
                autolyrics: newUserAutolyrics,
            });
            setNewUserId(''); setNewUserExpiry(''); setNewUserAutolyrics(false);
            await fetchUsers();
        } catch (e) { console.error(e); }
        finally { setAddingUser(false); }
    };

    const handleRemoveUser = async (uid: string) => {
        if (!window.confirm(`Remove premium from user ${uid}?`)) return;
        try { await api.delete(`/admin/premium/${uid}`); await fetchUsers(); }
        catch (e) { console.error(e); }
    };

    const handleAddGuild = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuildId) return;
        setAddingGuild(true);
        try {
            await api.post('/admin/premium/guilds', {
                guild_id: newGuildId,
                tier: newGuildTier,
                expires_at: newGuildExpiry || null,
            });
            setNewGuildId(''); setNewGuildExpiry('');
            await fetchGuilds();
        } catch (e) { console.error(e); }
        finally { setAddingGuild(false); }
    };

    const handleRemoveGuild = async (gid: string) => {
        if (!window.confirm(`Remove premium from guild ${gid}?`)) return;
        try { await api.delete(`/admin/premium/guilds/${gid}`); await fetchGuilds(); }
        catch (e) { console.error(e); }
    };

    const tierColor = (t: string) => {
        switch (t?.toLowerCase()) {
            case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'silver': return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
            case 'bronze': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        }
    };

    const formatExpiry = (exp: string | null) => {
        if (!exp) return '♾️ Lifetime';
        const d = new Date(exp);
        const now = new Date();
        if (d < now) return '⚠️ Expired';
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const filteredUsers = users.filter(u =>
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        u.user_id.includes(search)
    );

    const filteredGuilds = guilds.filter(g =>
        (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
        g.guild_id.includes(search)
    );

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                        💎 Premium Manager
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Manage premium users and guilds — reads from <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded">db/premium.db</code></p>
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
                <button onClick={() => setTab('users')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${tab === 'users' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'}`}>
                    <Users className="w-4 h-4" /> Users ({users.length})
                </button>
                <button onClick={() => setTab('guilds')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${tab === 'guilds' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'}`}>
                    <Server className="w-4 h-4" /> Guilds ({guilds.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    {tab === 'users' ? (
                        <form onSubmit={handleAddUser} className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 shadow-2xl">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-yellow-400" /> Grant User Premium</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">User ID *</label>
                                    <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="e.g. 1070619082..." className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Tier</label>
                                    <select value={newUserTier} onChange={e => setNewUserTier(e.target.value)} className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50">
                                        <option value="basic">Basic</option>
                                        <option value="silver">Silver</option>
                                        <option value="gold">Gold</option>
                                        <option value="bronze">Bronze</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Expiry Date (empty = lifetime)</label>
                                    <input type="date" value={newUserExpiry} onChange={e => setNewUserExpiry(e.target.value)} className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={newUserAutolyrics} onChange={e => setNewUserAutolyrics(e.target.checked)} className="rounded" />
                                    <span className="text-sm text-gray-300">Auto-Lyrics</span>
                                </label>
                                <button type="submit" disabled={addingUser || !newUserId} className="w-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 text-yellow-400 border border-yellow-500/30 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {addingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                                    Grant Premium
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleAddGuild} className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 shadow-2xl">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-purple-400" /> Grant Guild Premium</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Guild ID *</label>
                                    <input type="text" value={newGuildId} onChange={e => setNewGuildId(e.target.value)} placeholder="e.g. 11234567890..." className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Tier</label>
                                    <select value={newGuildTier} onChange={e => setNewGuildTier(e.target.value)} className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50">
                                        <option value="basic">Basic</option>
                                        <option value="silver">Silver</option>
                                        <option value="gold">Gold</option>
                                        <option value="bronze">Bronze</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Expiry Date (empty = lifetime)</label>
                                    <input type="date" value={newGuildExpiry} onChange={e => setNewGuildExpiry(e.target.value)} className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                                </div>
                                <button type="submit" disabled={addingGuild || !newGuildId} className="w-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-400 border border-purple-500/30 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {addingGuild ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                                    Grant Guild Premium
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="relative mb-4">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}...`} className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                    </div>

                    {tab === 'users' ? (
                        <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-bold text-white">Premium Users ({filteredUsers.length})</span>
                            </div>
                            {loadingUsers ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-yellow-500 opacity-50" /></div>
                            ) : filteredUsers.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-12">No premium users found.</p>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredUsers.map(u => (
                                        <div key={u.user_id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                                            {u.avatar ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-full" /> :
                                                <div className="w-9 h-9 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-xs">{(u.username || '?').charAt(0)}</div>}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white truncate">{u.username || u.user_id}</span>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold border px-1.5 py-0.5 rounded ${tierColor(u.tier)}`}>{u.tier}</span>
                                                    {u.autolyrics && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold px-1.5 py-0.5 rounded">🎵 LYRICS</span>}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    <code className="text-[10px]">{u.user_id}</code>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatExpiry(u.expires_at)}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveUser(u.user_id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                                <Server className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-bold text-white">Premium Guilds ({filteredGuilds.length})</span>
                            </div>
                            {loadingGuilds ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-500 opacity-50" /></div>
                            ) : filteredGuilds.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-12">No premium guilds found.</p>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredGuilds.map(g => (
                                        <div key={g.guild_id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                                            {g.icon ? <img src={g.icon} alt="" className="w-9 h-9 rounded-full" /> :
                                                <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">{(g.name || '?').charAt(0)}</div>}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white truncate">{g.name || g.guild_id}</span>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold border px-1.5 py-0.5 rounded ${tierColor(g.tier)}`}>{g.tier}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    <code className="text-[10px]">{g.guild_id}</code>
                                                    <span>{g.member_count.toLocaleString()} members</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatExpiry(g.expires_at)}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveGuild(g.guild_id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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

export default AdminPremium;
