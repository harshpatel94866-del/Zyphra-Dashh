import React, { useState, useEffect } from 'react';
import { HandHeart, Loader2, Save, CheckCircle, Settings, Eye } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Channel { id: string; name: string; type: number; }

const WelcomerPage: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [config, setConfig] = useState<any>({ configured: false });
    const [selectedChannel, setSelectedChannel] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const getGuild = () => { const s = secureStorage.getItem('selected_guild'); return s ? JSON.parse(s) : null; };

    useEffect(() => {
        const guild = getGuild();
        if (!guild || !guild.id) return;
        Promise.all([
            api.get(`/guild/${guild.id}/channels`, { timeout: 5000 }).catch(() => ({ data: { channels: [] } })),
            api.get(`/guild/${guild.id}/welcomer`, { timeout: 5000 }).catch(() => ({ data: { configured: false } })),
        ]).then(([cRes, wRes]) => {
            const allChannels = (cRes.data.channels || []).filter((c: Channel) => c.type === 0);
            setChannels(allChannels);
            const cfg = wRes.data;
            setConfig(cfg);
            if (cfg.channel_id) setSelectedChannel(cfg.channel_id);
        }).finally(() => setLoading(false));
    }, []);

    const handleSaveChannel = async () => {
        const guild = getGuild();
        if (!guild || !selectedChannel) return;
        setSaving(true);
        try {
            await api.post(`/guild/${guild.id}/welcomer/channel`, {
                channel_id: selectedChannel,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('[Welcomer] Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading welcomer config from bot...</span>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <HandHeart className="w-6 h-6 text-rose-400" />
                    <h1 className="text-2xl font-bold text-white">Welcome Messages</h1>
                    {config.configured && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                    )}
                </div>
                <p className="text-sm text-gray-500">Greet new members with welcome messages</p>
            </div>

            {/* Status */}
            <div className={`${config.configured ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'} border rounded-xl p-4 mb-6`}>
                <p className={`text-sm ${config.configured ? 'text-emerald-300' : 'text-yellow-300'}`}>
                    {config.configured ? (
                        <>
                            <strong>✅ Welcomer is configured!</strong> Type: <code className="bg-white/10 px-1.5 py-0.5 rounded">{config.welcome_type}</code>
                            {config.channel_id && <> • Channel: <code className="bg-white/10 px-1.5 py-0.5 rounded">#{channels.find(c => c.id === config.channel_id)?.name || config.channel_id}</code></>}
                        </>
                    ) : (
                        <>
                            <strong>⚠️ Not configured.</strong> Use the <code className="bg-yellow-500/20 px-1.5 py-0.5 rounded">greet setup</code> bot command for full setup with embed builder, or set the channel below.
                        </>
                    )}
                </p>
            </div>

            {/* Channel Selection */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2.5 mb-4">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <h2 className="text-base font-bold text-white">Welcome Channel</h2>
                </div>
                <select
                    value={selectedChannel}
                    onChange={e => setSelectedChannel(e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-4"
                >
                    <option value="">Select a channel...</option>
                    {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
                <button
                    onClick={handleSaveChannel}
                    disabled={saving || !selectedChannel}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : saved ? 'Saved to Bot!' : 'Save Channel'}
                </button>
            </div>

            {/* Message Preview */}
            {config.configured && config.welcome_message && (
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Eye className="w-5 h-5 text-gray-400" />
                        <h2 className="text-base font-bold text-white">Message Preview</h2>
                    </div>
                    <div className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04] text-sm text-gray-300">
                        {config.welcome_message}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default WelcomerPage;
