import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { Server, Search, LogOut, Loader2 } from 'lucide-react';

interface Guild {
    id: string;
    name: string;
    icon: string | null;
    member_count: number;
}

const AdminGuilds: React.FC = () => {
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchGuilds = () => {
        setLoading(true);
        api.get('/admin/guilds')
            .then(res => setGuilds(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchGuilds();
    }, []);

    const handleLeave = async (id: string, name: string) => {
        if (!process.env.NODE_ENV || !window.confirm(`Are you SURE you want the bot to leave ${name}?`)) return;
        
        setActionLoading(id);
        try {
            await api.delete(`/admin/guilds/${id}`);
            setGuilds(prev => prev.filter(g => g.id !== id));
        } catch (err) {
            console.error('Failed to leave guild', err);
            alert('Failed to leave the guild.');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = guilds.filter(g => 
        g.name.toLowerCase().includes(search.toLowerCase()) || 
        g.id.includes(search)
    );

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Guild Management
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">View and manage all {guilds.length} servers the bot is in.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/[0.06] text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-6 py-4 font-medium">Server</th>
                                <th className="px-6 py-4 font-medium min-w-[150px]">Server ID</th>
                                <th className="px-6 py-4 font-medium">Members</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                        Loading guilds...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No guilds found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(guild => (
                                    <tr key={guild.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {guild.icon ? (
                                                    <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`} alt="" className="w-10 h-10 rounded-full bg-black/50" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                                                        {guild.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-white">{guild.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="bg-black/30 px-2 py-1 rounded text-gray-300 text-xs font-mono">
                                                {guild.id}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 transform tabular-nums">
                                            {guild.member_count.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleLeave(guild.id, guild.name)}
                                                disabled={actionLoading === guild.id}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
                                                title="Force Leave Server"
                                            >
                                                {actionLoading === guild.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminGuilds;
