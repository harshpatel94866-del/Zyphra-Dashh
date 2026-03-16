import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { Star, Loader2, Plus, Trash2, ShieldCheck } from 'lucide-react';

interface PremiumUser {
    user_id: string;
    guild_id: string;
    no_prefix: boolean;
    expires_at: string;
}

const AdminPremium: React.FC = () => {
    const [users, setUsers] = useState<PremiumUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [userId, setUserId] = useState('');
    const [guildId, setGuildId] = useState('');
    const [noPrefix, setNoPrefix] = useState(false);
    const [expiresAt, setExpiresAt] = useState('2099-12-31');

    const fetchPremium = () => {
        setLoading(true);
        api.get('/admin/premium')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPremium();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setSubmitting(true);
        try {
            await api.post('/admin/premium', {
                user_id: userId,
                guild_id: guildId,
                no_prefix: noPrefix,
                expires_at: expiresAt
            });
            setUserId('');
            setGuildId('');
            setNoPrefix(false);
            setExpiresAt('2099-12-31');
            fetchPremium();
        } catch (err) {
            console.error(err);
            alert('Failed to add premium user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!window.confirm('Remove premium for this user?')) return;
        try {
            await api.delete(`/admin/premium/${id}`);
            setUsers(prev => prev.filter(u => u.user_id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 pl-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    Premium & No Prefix
                </h1>
                <p className="text-sm text-gray-400 mt-1">Manage users with elevated bot privileges.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to add new premium user */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-yellow-500/10 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Plus className="w-5 h-5 text-yellow-400" />
                            <h2 className="text-lg font-bold text-white">Grant Access</h2>
                        </div>
                        
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">User ID *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={userId}
                                    onChange={e => setUserId(e.target.value)}
                                    placeholder="e.g. 10706190...824"
                                    className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Guild ID (Optional)</label>
                                <input 
                                    type="text" 
                                    value={guildId}
                                    onChange={e => setGuildId(e.target.value)}
                                    placeholder="e.g. 98765432..."
                                    className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                />
                                <p className="text-[11px] text-gray-500 mt-1">Restrict premium to a specific server if needed.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                                <input 
                                    type="date" 
                                    value={expiresAt}
                                    onChange={e => setExpiresAt(e.target.value)}
                                    className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors [color-scheme:dark]"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={noPrefix}
                                        onChange={e => setNoPrefix(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-[#0a0f1e] border border-white/[0.08] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                                <span className="text-sm font-medium text-gray-300">Enable No Prefix (NP)</span>
                            </div>

                            <button 
                                type="submit"
                                disabled={submitting || !userId}
                                className="w-full mt-6 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                Grant Access
                            </button>
                        </form>
                    </div>
                </div>

                {/* List of premium users */}
                <div className="lg:col-span-2">
                    <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/[0.06] bg-white/[0.01]">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400" />
                                Active Users
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/[0.06] text-xs uppercase tracking-wider text-gray-400">
                                        <th className="px-6 py-3 font-medium">User ID</th>
                                        <th className="px-6 py-3 font-medium">Guild ID</th>
                                        <th className="px-6 py-3 font-medium">Privileges</th>
                                        <th className="px-6 py-3 font-medium">Expires</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No premium users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(u => (
                                            <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <code className="bg-black/30 px-2 py-1 rounded text-gray-300 text-xs font-mono">
                                                        {u.user_id}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.guild_id ? (
                                                        <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{u.guild_id}</code>
                                                    ) : (
                                                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Global</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">Premium</span>
                                                        {u.no_prefix && (
                                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">NP</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-300">
                                                    {u.expires_at === '2099-12-31' ? 'Lifetime' : u.expires_at}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleRemove(u.user_id)}
                                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                                    >
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

export default AdminPremium;
