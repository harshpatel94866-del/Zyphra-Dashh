import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { Search, Loader2, User, Server, Bot, Calendar, Globe } from 'lucide-react';

interface MutualGuild {
    id: string;
    name: string;
    icon?: string | null;
    nickname?: string | null;
    joined_at?: string | null;
    roles?: { id: string; name: string; color: number }[];
}

interface UserResult {
    user_id: string;
    username: string;
    display_name: string;
    avatar: string | null;
    bot: boolean;
    created_at: string | null;
    mutual_guilds: MutualGuild[];
}

const AdminUserLookup: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query || query.length < 2) return;
        setLoading(true);
        setSearched(true);
        setSelectedUser(null);
        try {
            const res = await api.get(`/admin/users/search?q=${encodeURIComponent(query)}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = async (userId: string) => {
        setDetailLoading(true);
        try {
            const res = await api.get(`/admin/users/${userId}`);
            setSelectedUser(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return 'Unknown';
        return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    User Lookup
                </h1>
                <p className="text-sm text-gray-400 mt-1">Search any user across all servers the bot is in.</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="relative max-w-2xl">
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search by username or user ID..."
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-xl pl-12 pr-28 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                    <button type="submit" disabled={loading || query.length < 2}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Results List */}
                <div className={selectedUser ? 'lg:col-span-1' : 'lg:col-span-3'}>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-500 opacity-50" />
                        </div>
                    ) : searched && results.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No users found matching "{query}"</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.map(user => (
                                <button key={user.user_id} onClick={() => handleSelectUser(user.user_id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedUser?.user_id === user.user_id
                                        ? 'bg-cyan-500/10 border-cyan-500/30'
                                        : 'bg-[#0f1423]/80 border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'}`}>
                                    {user.avatar ? <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" /> :
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white truncate">{user.username}</span>
                                            {user.bot && <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">BOT</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                            <Globe className="w-3 h-3" />
                                            <span>{user.mutual_guilds.length} mutual server{user.mutual_guilds.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <code className="text-xs text-gray-500 font-mono hidden sm:block">{user.user_id}</code>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selectedUser && (
                    <div className="lg:col-span-2">
                        {detailLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                            </div>
                        ) : (
                            <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                                {/* User Header */}
                                <div className="p-6 border-b border-white/[0.06] bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        {selectedUser.avatar ? <img src={selectedUser.avatar} alt="" className="w-16 h-16 rounded-full ring-2 ring-cyan-500/30" /> :
                                            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl ring-2 ring-cyan-500/30">
                                                {selectedUser.username.charAt(0).toUpperCase()}
                                            </div>}
                                        <div>
                                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                                {selectedUser.username}
                                                {selectedUser.bot && <Bot className="w-4 h-4 text-blue-400" />}
                                            </h2>
                                            <p className="text-sm text-gray-400">{selectedUser.display_name}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created {formatDate(selectedUser.created_at)}</span>
                                                <code className="bg-black/30 px-2 py-0.5 rounded">{selectedUser.user_id}</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mutual Guilds */}
                                <div className="p-4">
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <Server className="w-4 h-4 text-cyan-400" />
                                        Mutual Servers ({selectedUser.mutual_guilds.length})
                                    </h3>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                        {selectedUser.mutual_guilds.map(g => (
                                            <div key={g.id} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                                                <div className="flex items-center gap-3">
                                                    {g.icon ? <img src={g.icon} alt="" className="w-8 h-8 rounded-full" /> :
                                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">{g.name.charAt(0)}</div>}
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-medium text-white text-sm truncate block">{g.name}</span>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                            {g.nickname && <span>Nick: {g.nickname}</span>}
                                                            {g.joined_at && <span>Joined {formatDate(g.joined_at)}</span>}
                                                        </div>
                                                    </div>
                                                    <code className="text-[10px] text-gray-600 font-mono">{g.id}</code>
                                                </div>
                                                {g.roles && g.roles.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {g.roles.slice(0, 8).map(r => (
                                                            <span key={r.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.06]"
                                                                style={{ color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : '#9ca3af' }}>
                                                                {r.name}
                                                            </span>
                                                        ))}
                                                        {g.roles.length > 8 && <span className="text-[10px] text-gray-500">+{g.roles.length - 8} more</span>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUserLookup;
