import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Hash, Bell, Globe } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Channel {
    id: string;
    name: string;
    type: number;
}

const SettingsPage: React.FC = () => {
    const [prefix, setPrefix] = useState('+');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [logChannel, setLogChannel] = useState('');
    const [language, setLanguage] = useState('en');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        if (!guild || !guild.id) return;

        // Fetch channels + settings in parallel
        Promise.all([
            api.get(`/guild/${guild.id}/channels`, { timeout: 5000 }).catch(() => ({ data: { channels: [] } })),
            api.get(`/guild/${guild.id}/settings`, { timeout: 5000 }).catch(() => ({ data: {} })),
        ]).then(([chRes, settRes]) => {
            const textChannels = (chRes.data.channels || []).filter((c: Channel) => c.type === 0 || c.type === 5);
            setChannels(textChannels);
            if (settRes.data.prefix) setPrefix(settRes.data.prefix);
            if (settRes.data.log_channel_id) setLogChannel(settRes.data.log_channel_id);
        });
    }, []);

    const handleSave = async () => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        setSaving(true);
        try {
            await api.post(`/guild/${guild.id}/settings`, {
                prefix,
                log_channel_id: logChannel || null,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('[Settings] Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <SettingsIcon className="w-6 h-6 text-gray-400" />
                    <h1 className="text-2xl font-bold text-white">Server Settings</h1>
                </div>
                <p className="text-sm text-gray-500">Configure general bot settings for this server</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bot Prefix */}
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h2 className="text-base font-bold text-white">Bot Prefix</h2>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">The prefix used for bot commands in this server</p>
                    <input
                        type="text"
                        value={prefix}
                        onChange={e => setPrefix(e.target.value)}
                        maxLength={5}
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition"
                        placeholder="+"
                    />
                    <p className="text-xs text-gray-600 mt-2">Max 5 characters. Example: <code className="text-blue-400">!</code>, <code className="text-blue-400">&gt;</code>, <code className="text-blue-400">z!</code></p>
                </div>

                {/* Log Channel */}
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Hash className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-bold text-white">Default Log Channel</h2>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Where bot logs and alerts are sent</p>
                    <select
                        value={logChannel}
                        onChange={e => setLogChannel(e.target.value)}
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">None (disabled)</option>
                        {channels.map(ch => (
                            <option key={ch.id} value={ch.id}># {ch.name}</option>
                        ))}
                    </select>
                </div>

                {/* Language */}
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Bell className="w-5 h-5 text-purple-400" />
                        <h2 className="text-base font-bold text-white">Bot Language</h2>
                    </div>
                    <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                    </select>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
                {saved && (
                    <span className="text-sm text-emerald-400 animate-pulse">✓ Settings saved successfully!</span>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
