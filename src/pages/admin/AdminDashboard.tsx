import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import {
    Server, Users, Wifi, Clock, Gauge, Box, Terminal, Zap,
    Activity, Loader2, RefreshCw, Megaphone, Crown
} from 'lucide-react';

interface TopGuild {
    id: string;
    name: string;
    icon: string | null;
    member_count: number;
}

interface AdminStats {
    guilds: number;
    users: number;
    channels: number;
    voice_connections: number;
    shards: number;
    uptime_seconds: number;
    avg_latency: number;
    cog_count: number;
    prefix_commands: number;
    slash_commands: number;
    status: string;
    maintenance: boolean;
    top_guilds: TopGuild[];
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err: any) {
            const status = err?.response?.status;
            const detail = err?.response?.data?.detail || err?.message || 'Unknown error';
            if (status === 401) {
                setError(`Authentication failed (401): ${detail}\n\nYour Discord token may be expired. Please log out and log in again via /dashboard/login.`);
            } else if (status === 403) {
                setError(`Access denied (403): ${detail}\n\nOnly the bot owner can access this page.`);
            } else if (status === 500) {
                setError(`Server error (500): ${detail}\n\nThe bot API crashed. Check your bot server terminal for [ADMIN STATS ERROR] or [ADMIN AUTH ERROR] logs.`);
            } else {
                setError(`Failed to load stats: ${detail}`);
            }
            console.error('[AdminDashboard]', status, detail);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const handleSync = async () => {
        setSyncing(true);
        setSyncMsg('');
        try {
            const res = await api.post('/admin/bot/sync');
            setSyncMsg(`✅ Synced ${res.data.synced} commands`);
        } catch (err: any) {
            setSyncMsg(`❌ ${err?.response?.data?.detail || 'Failed'}`);
        } finally {
            setSyncing(false);
        }
    };

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (d > 0) return `${d}d ${h}h ${m}m`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 opacity-50" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-16">
                    <div className="max-w-lg w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-red-400 mb-3">Admin Dashboard Error</h2>
                        <pre className="text-sm text-red-300/80 whitespace-pre-wrap text-left bg-black/20 rounded-lg p-4 mb-6">{error}</pre>
                        <button
                            onClick={fetchStats}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const statusColor = stats?.status === 'online' ? 'text-emerald-400' :
        stats?.status === 'maintenance' ? 'text-yellow-400' : 'text-gray-400';
    const statusDot = stats?.status === 'online' ? 'bg-emerald-400' :
        stats?.status === 'maintenance' ? 'bg-yellow-400' : 'bg-gray-400';

    const statCards = [
        { label: 'Total Guilds', value: stats?.guilds || 0, icon: Server, color: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-500/20', iconColor: 'text-purple-400' },
        { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
        { label: 'Channels', value: stats?.channels || 0, icon: Box, color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
        { label: 'Uptime', value: formatUptime(stats?.uptime_seconds || 0), icon: Clock, color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
        { label: 'Avg Latency', value: `${stats?.avg_latency || 0}ms`, icon: Gauge, color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/20', iconColor: 'text-rose-400' },
        { label: 'Shards', value: stats?.shards || 1, icon: Zap, color: 'from-cyan-500/20 to-teal-500/20', border: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
        { label: 'Prefix Commands', value: stats?.prefix_commands || 0, icon: Terminal, color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/20', iconColor: 'text-orange-400' },
        { label: 'Slash Commands', value: stats?.slash_commands || 0, icon: Activity, color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/20', iconColor: 'text-violet-400' },
    ];

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                        Bot Overview
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${statusDot} animate-pulse`} />
                        <span className={`text-sm font-medium ${statusColor} capitalize`}>{stats?.status}</span>
                        {stats?.maintenance && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded ml-1">
                                Maintenance
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={fetchStats} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white" title="Refresh">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className={`bg-gradient-to-br ${card.color} backdrop-blur-sm border ${card.border} rounded-xl p-4 shadow-lg`}>
                        <div className="flex items-center justify-between mb-3">
                            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 5 Guilds */}
                <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-lg font-bold text-white">Top Guilds</h2>
                    </div>
                    <div className="space-y-3">
                        {(stats?.top_guilds || []).map((g, i) => (
                            <div key={g.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
                                <span className="text-sm font-bold text-gray-500 w-5 text-center">{i + 1}</span>
                                {g.icon ? <img src={g.icon} alt="" className="w-8 h-8 rounded-full" /> :
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">{g.name.charAt(0)}</div>}
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-white truncate block">{g.name}</span>
                                    <span className="text-xs text-gray-500">{g.member_count.toLocaleString()} members</span>
                                </div>
                            </div>
                        ))}
                        {(!stats?.top_guilds || stats.top_guilds.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">No guild data available</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-lg font-bold text-white">Quick Actions</h2>
                    </div>
                    <div className="space-y-3">
                        <button onClick={handleSync} disabled={syncing}
                            className="w-full flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg px-4 py-3 text-left transition-all group disabled:opacity-50">
                            {syncing ? <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /> :
                                <RefreshCw className="w-5 h-5 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />}
                            <div>
                                <span className="text-sm font-medium text-white block">Sync Slash Commands</span>
                                <span className="text-xs text-gray-500">Force re-sync all application commands</span>
                            </div>
                        </button>

                        <a href="/admin/bot-settings" className="w-full flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 hover:border-purple-500/40 rounded-lg px-4 py-3 text-left transition-all group block">
                            <Wifi className="w-5 h-5 text-purple-400" />
                            <div>
                                <span className="text-sm font-medium text-white block">Bot Presence</span>
                                <span className="text-xs text-gray-500">Change status, activity, maintenance mode</span>
                            </div>
                        </a>

                        <a href="/admin/blacklist" className="w-full flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 hover:border-red-500/40 rounded-lg px-4 py-3 text-left transition-all group block">
                            <Megaphone className="w-5 h-5 text-red-400" />
                            <div>
                                <span className="text-sm font-medium text-white block">Blacklist Manager</span>
                                <span className="text-xs text-gray-500">Block users and servers</span>
                            </div>
                        </a>

                        {syncMsg && (
                            <p className={`text-sm px-3 py-2 rounded-lg mt-2 ${syncMsg.startsWith('✅')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {syncMsg}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
