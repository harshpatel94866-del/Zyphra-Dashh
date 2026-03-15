import React, { useState, useEffect } from 'react';
import { Gift, Loader2, Clock, Trophy, Hash as ChannelIcon, Plus, Send, RefreshCw } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface GiveawayData { prize: string; winners: number; ends_at: number; channel_id: string; message_id: string; host_id: string; }
interface Channel { id: string; name: string; type: number; }

const GiveawayPage: React.FC = () => {
    const [giveaways, setGiveaways] = useState<GiveawayData[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [prize, setPrize] = useState('');
    const [winners, setWinners] = useState(1);
    const [duration, setDuration] = useState('5m');
    const [channelId, setChannelId] = useState('');

    const getGuild = () => { const s = secureStorage.getItem('selected_guild'); return s ? JSON.parse(s) : null; };

    const loadGiveaways = () => {
        const guild = getGuild();
        if (!guild || !guild.id) return;
        setLoading(true);
        Promise.all([
            api.get(`/guild/${guild.id}/giveaways`, { timeout: 5000 }).catch(() => ({ data: { giveaways: [] } })),
            api.get(`/guild/${guild.id}/channels`, { timeout: 5000 }).catch(() => ({ data: { channels: [] } })),
        ]).then(([gRes, cRes]) => {
            setGiveaways(gRes.data.giveaways || []);
            setChannels((cRes.data.channels || []).filter((c: Channel) => c.type === 0));
        }).finally(() => setLoading(false));
    };

    useEffect(() => { loadGiveaways(); }, []);

    const getChannelName = (id: string) => channels.find(c => c.id === id)?.name || 'unknown';

    const formatTime = (ts: number) => {
        const now = Date.now() / 1000;
        const diff = ts - now;
        if (diff <= 0) return 'Ended';
        const d = Math.floor(diff / 86400);
        const h = Math.floor((diff % 86400) / 3600);
        const m = Math.floor((diff % 3600) / 60);
        if (d > 0) return `${d}d ${h}h remaining`;
        if (h > 0) return `${h}h ${m}m remaining`;
        return `${m}m remaining`;
    };

    const parseDuration = (str: string): number => {
        const match = str.match(/^(\d+)([smhd])$/i);
        if (!match) return 0;
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 's': return val;
            case 'm': return val * 60;
            case 'h': return val * 3600;
            case 'd': return val * 86400;
            default: return 0;
        }
    };

    const handleCreate = async () => {
        if (!prize.trim() || !channelId) return;
        const guild = getGuild();
        if (!guild) return;

        const durationSeconds = parseDuration(duration);
        if (durationSeconds < 10) return alert('Duration must be at least 10 seconds');

        setCreating(true);
        try {
            await api.post(`/guild/${guild.id}/giveaways`, {
                channel_id: channelId,
                prize: prize.trim(),
                winners,
                duration_seconds: durationSeconds,
            });
            // Reset form and reload
            setPrize('');
            setWinners(1);
            setDuration('5m');
            setChannelId('');
            setShowForm(false);
            // Reload giveaways after a short delay
            setTimeout(loadGiveaways, 1000);
        } catch (err: any) {
            console.error('[Giveaway] Create failed:', err);
            alert(err.response?.data?.detail || 'Failed to create giveaway');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading giveaways from bot...</span>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Gift className="w-6 h-6 text-pink-400" />
                            <h1 className="text-2xl font-bold text-white">Giveaways</h1>
                        </div>
                        <p className="text-sm text-gray-500">Create and manage giveaways for your server</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={loadGiveaways}
                            className="bg-[#0d1225]/80 border border-white/[0.06] text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg transition flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button onClick={() => setShowForm(!showForm)}
                            className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Giveaway
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Giveaway Form */}
            {showForm && (
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6 mb-6">
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-pink-400" /> Create Giveaway
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Prize</label>
                            <input value={prize} onChange={e => setPrize(e.target.value)} placeholder="Nitro Classic"
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Channel</label>
                            <select value={channelId} onChange={e => setChannelId(e.target.value)}
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500">
                                <option value="">Select channel...</option>
                                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Winners</label>
                            <input type="number" value={winners} onChange={e => setWinners(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))} min={1} max={15}
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Duration (e.g. 5m, 1h, 1d)</label>
                            <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="5m"
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleCreate} disabled={creating || !prize.trim() || !channelId}
                            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-2">
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {creating ? 'Creating...' : 'Start Giveaway'}
                        </button>
                        <button onClick={() => setShowForm(false)}
                            className="bg-[#0a0f1e] border border-white/[0.08] text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg transition">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Active Giveaways */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">
                    Active Giveaways <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full ml-2">{giveaways.length}</span>
                </h2>
                <div className="space-y-3">
                    {giveaways.length === 0 ? (
                        <div className="text-center py-8">
                            <Gift className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No active giveaways</p>
                            <p className="text-xs text-gray-700 mt-1">Click "New Giveaway" to start one from the dashboard</p>
                        </div>
                    ) : (
                        giveaways.map((g, i) => (
                            <div key={i} className="bg-[#0a0f1e] rounded-xl p-4 border border-white/[0.04]">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-white font-semibold text-base flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-pink-400" />
                                            {g.prize}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Trophy className="w-3 h-3" /> {g.winners} winner(s)
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <ChannelIcon className="w-3 h-3" /> #{getChannelName(g.channel_id)}
                                            </span>
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatTime(g.ends_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GiveawayPage;
