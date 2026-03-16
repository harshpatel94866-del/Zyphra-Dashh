import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { ShieldBan, Search, Loader2, Trash2, Plus, Users, Server } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [newId, setNewId] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [uRes, gRes] = await Promise.all([
                api.get('/admin/blacklist/users'),
                api.get('/admin/blacklist/guilds'),
            ]);
            setUsers(uRes.data);
            setGuilds(gRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newId) return;
        setSubmitting(true);
        try {
            if (tab === 'users') {
                await api.post('/admin/blacklist/users', { user_id: newId, reason });
            } else {
                await api.post('/admin/blacklist/guilds', { guild_id: newId, reason });
            }
            setNewId('');
            setReason('');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to add to blacklist');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveUser = async (id: string) => {
        if (!window.confirm('Remove this user from blacklist?')) return;
        try {
            await api.delete(`/admin/blacklist/users/${id}`);
            setUsers(prev => prev.filter(u => u.user_id !== id));
        } catch (err) { console.error(err); }
    };

    const handleRemoveGuild = async (id: string) => {
        if (!window.confirm('Remove this guild from blacklist?')) return;
        try {
            await api.delete(`/admin/blacklist/guilds/${id}`);
            setGuilds(prev => prev.filter(g => g.guild_id !== id));
        } catch (err) { console.error(err); }
    };

    const filteredUsers = users.filter(u =>
        u.user_id.includes(search) || (u.username || '').toLowerCase().includes(search.toLowerCase())
    );
    const filteredGuilds = guilds.filter(g =>
        g.guild_id.includes(search) || (g.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                    Blacklist Manager
                </h1>
                <p className="text-sm text-gray-400 mt-1">Block users and servers from using the bot.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'users' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`}>
                    <Users className="w-4 h-4" /> Users ({users.length})
                </button>
                <button onClick={() => setTab('guilds')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'guilds' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`}>
                    <Server className="w-4 h-4" /> Servers ({guilds.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-red-500/10 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Plus className="w-5 h-5 text-red-400" />
                            <h2 className="text-lg font-bold text-white">Add to Blacklist</h2>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    {tab === 'users' ? 'User ID' : 'Server ID'} *
                                </label>
                                <input type="text" required value={newId} onChange={e => setNewId(e.target.value)}
                                    placeholder={tab === 'users' ? 'e.g. 123456789...' : 'e.g. 987654321...'}
                                    className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Reason (Optional)</label>
                                <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                                    placeholder="e.g. Spamming, Abuse..."
                                    className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors" />
                            </div>
                            <button type="submit" disabled={submitting || !newId}
                                className="w-full mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldBan className="w-4 h-4" />}
                                Blacklist {tab === 'users' ? 'User' : 'Server'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="mb-4 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors" />
                    </div>

                    <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/[0.06] text-xs uppercase tracking-wider text-gray-400">
                                        <th className="px-6 py-4 font-medium">{tab === 'users' ? 'User' : 'Server'}</th>
                                        <th className="px-6 py-4 font-medium">ID</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {loading ? (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" /> Loading...
                                        </td></tr>
                                    ) : tab === 'users' ? (
                                        filteredUsers.length === 0 ? (
                                            <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No blacklisted users found.</td></tr>
                                        ) : filteredUsers.map(u => (
                                            <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {u.avatar ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" /> :
                                                            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">?</div>}
                                                        <span className="text-white font-medium">{u.username || 'Unknown User'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><code className="bg-black/30 px-2 py-1 rounded text-gray-300 text-xs font-mono">{u.user_id}</code></td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleRemoveUser(u.user_id)} className="text-gray-500 hover:text-emerald-400 transition-colors p-1" title="Unblacklist">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        filteredGuilds.length === 0 ? (
                                            <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No blacklisted servers found.</td></tr>
                                        ) : filteredGuilds.map(g => (
                                            <tr key={g.guild_id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {g.icon ? <img src={g.icon} alt="" className="w-8 h-8 rounded-full" /> :
                                                            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">{(g.name || '?').charAt(0)}</div>}
                                                        <span className="text-white font-medium">{g.name || 'Unknown Server'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><code className="bg-black/30 px-2 py-1 rounded text-gray-300 text-xs font-mono">{g.guild_id}</code></td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleRemoveGuild(g.guild_id)} className="text-gray-500 hover:text-emerald-400 transition-colors p-1" title="Unblacklist">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBlacklist;
