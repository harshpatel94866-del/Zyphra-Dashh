import React, { useState, useEffect } from 'react';
import { ScrollText, Search, Shield, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface AuditUser {
    name: string;
    id: string | null;
    avatar: string | null;
}

interface AuditEntry {
    id: string;
    action: string;
    category: 'security' | 'moderation' | 'config';
    user: AuditUser;
    target: { name: string; id: string | null };
    reason: string | null;
    timestamp: string;
}

const typeColors = {
    security: { bg: 'bg-red-500/10', text: 'text-red-400', icon: <Shield className="w-4 h-4" /> },
    moderation: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <AlertTriangle className="w-4 h-4" /> },
    config: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: <RefreshCw className="w-4 h-4" /> },
};

// Format ISO timestamp to relative time
const timeAgo = (iso: string): string => {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
};

const AuditLogsPage: React.FC = () => {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'security' | 'moderation' | 'config'>('all');
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        if (!guild || !guild.id) return;

        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/guild/${guild.id}/audit-logs?limit=50`, { timeout: 10000 });
            setEntries(res.data.entries || []);
        } catch (err: any) {
            console.error('[AuditLogs] Failed:', err);
            if (err.response?.status === 403) {
                setError('Bot needs "View Audit Log" permission to show real logs.');
            } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
                setError('Bot API is not running. Start the bot to see real audit logs.');
            } else {
                setError('Failed to load audit logs. Make sure bot is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const filtered = entries.filter(e => {
        if (filter !== 'all' && e.category !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return e.action.toLowerCase().includes(q) ||
                e.user.name.toLowerCase().includes(q) ||
                e.target.name.toLowerCase().includes(q) ||
                (e.reason || '').toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <ScrollText className="w-6 h-6 text-blue-400" />
                            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                        </div>
                        <p className="text-sm text-gray-500">Real-time audit log from Discord</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-md transition flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search actions, users, targets..."
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-1.5">
                        {(['all', 'security', 'moderation', 'config'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-400 font-medium">{error}</p>
                        <p className="text-xs text-gray-500 mt-1">The bot must be online and have "View Audit Log" permission.</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-8 text-center">
                    <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-gray-400">Fetching audit logs from Discord...</p>
                </div>
            )}

            {/* Log Entries */}
            {!loading && (
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="p-8 text-center">
                            <ScrollText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">{entries.length === 0 ? 'No audit logs available' : 'No matching logs'}</p>
                            {entries.length === 0 && !error && (
                                <p className="text-xs text-gray-600 mt-1">Make sure the bot is running and has View Audit Log permission</p>
                            )}
                        </div>
                    ) : (
                        filtered.map((entry, i) => {
                            const style = typeColors[entry.category] || typeColors.config;
                            return (
                                <div key={entry.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                                    {/* User Avatar or Icon */}
                                    {entry.user.avatar ? (
                                        <img src={entry.user.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                                    ) : (
                                        <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center ${style.text} flex-shrink-0`}>
                                            {style.icon}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-white">{entry.action}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.text} font-medium capitalize`}>
                                                {entry.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            by <span className="text-gray-300">{entry.user.name}</span>
                                            {entry.target.name !== 'Unknown' && (
                                                <> → <span className="text-gray-300">{entry.target.name}</span></>
                                            )}
                                            {entry.reason && (
                                                <span className="text-gray-600 ml-1">• {entry.reason}</span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-600 flex-shrink-0 whitespace-nowrap">{timeAgo(entry.timestamp)}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <p className="mt-4 text-xs text-gray-600 text-center">
                Showing {filtered.length} of {entries.length} entries • Live from Discord Audit Log
            </p>
        </DashboardLayout>
    );
};

export default AuditLogsPage;
