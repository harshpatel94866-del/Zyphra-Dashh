import React from 'react';
import { Bot, Shield, Link2, MessageSquare, Smile, AtSign, Hash } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

const automodModules = [
    { id: 'antilink', label: 'Anti Link', desc: 'Blocks messages containing links', icon: <Link2 className="w-4 h-4" /> },
    { id: 'antispam', label: 'Anti Spam', desc: 'Prevents spam messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'anticaps', label: 'Anti Caps', desc: 'Limits excessive capitalization', icon: <span className="text-xs font-bold">AA</span> },
    { id: 'anti_invites', label: 'Anti Invites', desc: 'Blocks Discord invite links', icon: <AtSign className="w-4 h-4" /> },
    { id: 'anti_emoji_spam', label: 'Anti Emoji Spam', desc: 'Limits emoji usage', icon: <Smile className="w-4 h-4" /> },
    { id: 'anti_mass_mention', label: 'Anti Mass Mention', desc: 'Blocks mass pings', icon: <Hash className="w-4 h-4" /> },
];

const AutomodPage: React.FC = () => {
    const [enabled, setEnabled] = React.useState(false);
    const [toggles, setToggles] = React.useState<Record<string, boolean>>(
        Object.fromEntries(automodModules.map(m => [m.id, false]))
    );

    // Load automod status from bot API
    React.useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        try {
            const guild = JSON.parse(guildStr);
            if (!guild || !guild.id) return;
            api.get(`/guild/${guild.id}/protection/status`, { timeout: 5000 })
                .then(res => setEnabled(res.data.automod_enabled || false))
                .catch(() => { });
        } catch { }
    }, []);

    // Toggle automod via bot API
    const handleMasterToggle = async () => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        const newState = !enabled;
        try {
            await api.post(
                `/guild/${guild.id}/protection/automod/${newState ? 'enable' : 'disable'}`
            );
            setEnabled(newState);
        } catch (err) {
            console.error('[Automod] Toggle failed:', err);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Bot className="w-6 h-6 text-violet-400" />
                    <h1 className="text-2xl font-bold text-white">Automod</h1>
                </div>
                <p className="text-sm text-gray-500">Automated moderation to keep your server clean</p>
            </div>

            {/* Master Toggle */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Automod System</h2>
                        <p className="text-xs text-gray-500 mt-1">Enable or disable all automod features</p>
                    </div>
                    <button
                        onClick={handleMasterToggle}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-gray-600'
                            }`}
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-[26px]' : 'translate-x-0.5'
                            }`} />
                    </button>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automodModules.map(mod => (
                    <div key={mod.id} className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 transition hover:border-white/[0.1]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                                    {mod.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{mod.label}</h3>
                                    <p className="text-xs text-gray-500">{mod.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => enabled && setToggles(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                                disabled={!enabled}
                                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${!enabled ? 'bg-gray-700 cursor-not-allowed opacity-50' :
                                    toggles[mod.id] ? 'bg-emerald-500' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${toggles[mod.id] && enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!enabled && (
                <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-400">
                    ⚠️ Automod is disabled. Enable it to configure individual modules.
                </div>
            )}
        </DashboardLayout>
    );
};

export default AutomodPage;
