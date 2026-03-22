import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { ShieldBan, Users, Server, Loader2, Search, Trash2, Plus } from 'lucide-react';

interface BlacklistedUser {
    user_id: string;
    username: string | null;
    avatar: string | null;
}

interface BlacklistedGuild {
    guild_id: string;
    name: string | null;
    icon: string | null;
}

const AdminBlacklist: React.FC = () => {
    const [tab, setTab] = useState<'users' | 'guilds'>('users');
    const [users, setUsers] = useState<BlacklistedUser[]>([]);
    const [guilds, setGuilds] = useState<BlacklistedGuild[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingGuilds, setLoadingGuilds] = useState(true);
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [newUserId, setNewUserId] = useState('');
    const [addingUser, setAddingUser] = useState(false);
    const [newGuildId, setNewGuildId] = useState('');
    const [addingGuild, setAddingGuild] = useState(false);

    const fetchUsers = async (silent = false) => {
        if (!silent) setLoadingUsers(true);
        try {
            const res = await api.get('/admin/blacklist/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
        finally { setLoadingUsers(false); }
    };

    const fetchGuilds = async (silent = false) => {
        if (!silent) setLoadingGuilds(true);
        try {
            const res = await api.get('/admin/blacklist/guilds');
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
            await api.post('/admin/blacklist/users', { user_id: newUserId });
            setNewUserId('');
            await fetchUsers();
        } catch (e) { console.error(e); }
        finally { setAddingUser(false); }
    };

    const handleRemoveUser = async (uid: string) => {
        if (!window.confirm(`Unblacklist user ${uid}?`)) return;
        try { await api.delete(`/admin/blacklist/users/${uid}`); await fetchUsers(); }
        catch (e) { console.error(e); }
    };

    const handleAddGuild = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuildId) return;
        setAddingGuild(true);
        try {
            await api.post('/admin/blacklist/guilds', { guild_id: newGuildId });
            setNewGuildId('');
            await fetchGuilds();
        } catch (e) { console.error(e); }
        finally { setAddingGuild(false); }
    };

    const handleRemoveGuild = async (gid: string) => {
        if (!window.confirm(`Unblacklist guild ${gid}?`)) return;
        try { await api.delete(`/admin/blacklist/guilds/${gid}`); await fetchGuilds(); }
        catch (e) { console.error(e); }
    };

    const filteredUsers = users.filter(u =>
        (u.username || '').toLowerCase().includes(search.toLowerCase()) || u.user_id.includes(search)
    );
    const filteredGuilds = guilds.filter(g =>
        (g.name || '').toLowerCase().includes(search.toLowerCase()) || g.guild_id.includes(search)
    );

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                        🚫 Blacklist Manager
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Block users and servers — reads from <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded">db/block.db</code></p>
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
                <button onClick={() => setTab('users')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${tab === 'users' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'}`}>
                    <Users className="w-4 h-4" /> Users ({users.length})
                </button>
                <button onClick={() => setTab('guilds')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${tab === 'guilds' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'}`}>
                    <Server className="w-4 h-4" /> Servers ({guilds.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    {tab === 'users' ? (
                        <form onSubmit={handleAddUser} className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 shadow-2xl">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-red-400" /> Blacklist User</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">User ID *</label>
                                    <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="e.g. 1234567890..." className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
                                </div>
                                <button type="submit" disabled={addingUser || !newUserId} className="w-full bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-400 border border-red-500/30 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {addingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldBan className="w-4 h-4" />}
                                    Blacklist User
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleAddGuild} className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 shadow-2xl">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-orange-400" /> Blacklist Server</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Guild ID *</label>
                                    <input type="text" value={newGuildId} onChange={e => setNewGuildId(e.target.value)} placeholder="e.g. 1234567890..." className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50" />
                                </div>
                                <button type="submit" disabled={addingGuild || !newGuildId} className="w-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-400 border border-orange-500/30 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {addingGuild ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldBan className="w-4 h-4" />}
                                    Blacklist Server
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="relative mb-4">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}...`} className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>

                    {tab === 'users' ? (
                        <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                                <ShieldBan className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-bold text-white">Blacklisted Users ({filteredUsers.length})</span>
                            </div>
                            {loadingUsers ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-red-500 opacity-50" /></div>
                            ) : filteredUsers.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-12">No blacklisted users.</p>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredUsers.map(u => (
                                        <div key={u.user_id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                                            {u.avatar ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-full" /> :
                                                <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">{(u.username || '?').charAt(0)}</div>}
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-white truncate block">{u.username || 'Unknown User'}</span>
                                                <code className="text-[10px] text-gray-500">{u.user_id}</code>
                                            </div>
                                            <button onClick={() => handleRemoveUser(u.user_id)} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-gray-500 hover:text-emerald-400" title="Unblacklist"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                                <ShieldBan className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-bold text-white">Blacklisted Servers ({filteredGuilds.length})</span>
                            </div>
                            {loadingGuilds ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500 opacity-50" /></div>
                            ) : filteredGuilds.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-12">No blacklisted servers.</p>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredGuilds.map(g => (
                                        <div key={g.guild_id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                                            {g.icon ? <img src={g.icon} alt="" className="w-9 h-9 rounded-full" /> :
                                                <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">{(g.name || '?').charAt(0)}</div>}
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-white truncate block">{g.name || 'Unknown Server'}</span>
                                                <code className="text-[10px] text-gray-500">{g.guild_id}</code>
                                            </div>
                                            <button onClick={() => handleRemoveGuild(g.guild_id)} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-gray-500 hover:text-emerald-400" title="Unblacklist"><Trash2 className="w-4 h-4" /></button>
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

export default AdminBlacklist;
