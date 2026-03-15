import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, Users, UserPlus, Settings, ChevronRight, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

type TabId = 'overview' | 'whitelist' | 'settings' | 'extra-owner';

const antinukeModules = [
    { id: 'anti_ban', label: 'Anti Ban', category: 'core' },
    { id: 'anti_kick', label: 'Anti Kick', category: 'core' },
    { id: 'anti_bot_add', label: 'Anti Bot Add', category: 'core' },
    { id: 'anti_channel_create', label: 'Anti Channel Create', category: 'core' },
    { id: 'anti_channel_delete', label: 'Anti Channel Delete', category: 'core' },
    { id: 'anti_channel_update', label: 'Anti Channel Update', category: 'core' },
    { id: 'anti_role_create', label: 'Anti Role Create', category: 'core' },
    { id: 'anti_role_delete', label: 'Anti Role Delete', category: 'core' },
    { id: 'anti_role_update', label: 'Anti Role Update', category: 'core' },
    { id: 'anti_webhook', label: 'Anti Webhook', category: 'core' },
    { id: 'anti_everyone_here', label: 'Anti @everyone / @here', category: 'advanced' },
    { id: 'anti_guild_update', label: 'Anti Guild Update', category: 'advanced' },
    { id: 'anti_integration', label: 'Anti Integration', category: 'advanced' },
    { id: 'anti_member_update', label: 'Anti Member Update', category: 'advanced' },
    { id: 'anti_prune', label: 'Anti Prune', category: 'advanced' },
    { id: 'anti_dangerous_permission', label: 'Anti Dangerous Permission Update', category: 'advanced' },
];

const AntinukePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toggles, setToggles] = useState<Record<string, boolean>>(
        Object.fromEntries(antinukeModules.map(m => [m.id, false]))
    );

    // Load antinuke status from bot API
    useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        try {
            const guild = JSON.parse(guildStr);
            api.get(`/guild/${guild.id}/protection/status`, { timeout: 5000 })
                .then(res => {
                    setEnabled(res.data.antinuke_enabled || false);
                })
                .catch(() => { });
        } catch { }
    }, []);

    // Enable/Disable antinuke via bot API
    const handleEnableDisable = async (enable: boolean) => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        setLoading(true);
        try {
            await api.post(
                `/guild/${guild.id}/protection/antinuke/${enable ? 'enable' : 'disable'}`
            );
            setEnabled(enable);
        } catch (err) {
            console.error('[Antinuke] Failed to toggle:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs: { id: TabId; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'whitelist', label: 'Whitelist' },
        { id: 'settings', label: 'Settings' },
        { id: 'extra-owner', label: 'Extra Owner' },
    ];

    const handleToggle = (id: string) => {
        if (!enabled) return;
        setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const coreModules = antinukeModules.filter(m => m.category === 'core');
    const advancedModules = antinukeModules.filter(m => m.category === 'advanced');

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h1 className="text-2xl font-bold text-white">Antinuke</h1>
                </div>
                <p className="text-sm text-gray-500">Protect your server from malicious attacks</p>
            </div>

            {/* Security Control Center */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            Antinuke Security Control Center
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">State, protected surface, trusted bypass users, and attack response in one place.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEnableDisable(true)}
                            disabled={loading}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${enabled
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                }`}
                        >
                            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Enable
                        </button>
                        <button
                            onClick={() => handleEnableDisable(false)}
                            disabled={loading}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!enabled
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600 hover:text-white'
                                }`}
                        >
                            Disable
                        </button>
                    </div>
                </div>

                {/* Status cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'STATUS', value: enabled ? 'Active' : 'Inactive', color: enabled ? '#22c55e' : '#ef4444' },
                        { label: 'BLAST RADIUS', value: enabled ? 'Runtime guards active' : 'No runtime guards', color: enabled ? '#22c55e' : '#f59e0b' },
                        { label: 'TRUSTED BYPASS', value: '0 whitelist entries', color: '#9ca3af' },
                        { label: 'ATTACK RESPONSE', value: 'None', color: '#ef4444' },
                    ].map((card) => (
                        <div key={card.label} className="bg-[#0a0f1e] rounded-lg p-3 border border-white/[0.04]">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                            <p className="text-sm font-semibold" style={{ color: card.color }}>
                                ● {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-white/[0.06] mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h3 className="text-base font-bold text-white mb-4">Enabled Protections</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Core Actions */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Core Actions</h4>
                                <div className="space-y-1">
                                    {coreModules.map(mod => (
                                        <div key={mod.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${toggles[mod.id] && enabled ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                                <span className="text-sm text-gray-300">{mod.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!enabled && <Lock className="w-3.5 h-3.5 text-gray-600" />}
                                                <button
                                                    onClick={() => handleToggle(mod.id)}
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
                            </div>

                            {/* Advanced / Sensitive */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Advanced / Sensitive</h4>
                                <div className="space-y-1">
                                    {advancedModules.map(mod => (
                                        <div key={mod.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${toggles[mod.id] && enabled ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                                <span className="text-sm text-gray-300">{mod.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!enabled && <Lock className="w-3.5 h-3.5 text-gray-600" />}
                                                <button
                                                    onClick={() => handleToggle(mod.id)}
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
                            </div>
                        </div>

                        {!enabled && (
                            <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-400">
                                ⚠️ Antinuke is disabled. Event protections are shown as locked off-state.
                            </div>
                        )}
                    </div>
                )}

                {/* Whitelist Tab */}
                {activeTab === 'whitelist' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-white">Trusted Bypass Users</h3>
                            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition">
                                <Plus className="w-3.5 h-3.5" />
                                Add User
                            </button>
                        </div>
                        <div className="bg-[#0a0f1e] rounded-lg border border-white/[0.04] p-8 text-center">
                            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">No whitelisted users yet</p>
                            <p className="text-xs text-gray-600 mt-1">Whitelisted users can bypass antinuke protections</p>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-white">Antinuke Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04]">
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Punishment Type</label>
                                <select className="w-full bg-[#0d1225] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                                    <option value="ban">Ban</option>
                                    <option value="kick">Kick</option>
                                    <option value="strip_roles">Strip Roles</option>
                                </select>
                            </div>
                            <div className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04]">
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Action Threshold</label>
                                <input
                                    type="number"
                                    defaultValue={3}
                                    min={1}
                                    max={10}
                                    className="w-full bg-[#0d1225] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Extra Owner Tab */}
                {activeTab === 'extra-owner' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-white">Extra Owners</h3>
                            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition">
                                <Plus className="w-3.5 h-3.5" />
                                Add Owner
                            </button>
                        </div>
                        <div className="bg-[#0a0f1e] rounded-lg border border-white/[0.04] p-8 text-center">
                            <UserPlus className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">No extra owners configured</p>
                            <p className="text-xs text-gray-600 mt-1">Extra owners have full antinuke bypass and can manage settings</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AntinukePage;
