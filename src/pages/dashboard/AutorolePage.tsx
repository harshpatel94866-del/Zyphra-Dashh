import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Save, UserPlus, Bot, Loader2, CheckCircle } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Role { id: string; name: string; color: number; position: number; }

const AutorolePage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [humanRoles, setHumanRoles] = useState<string[]>([]);
    const [botRoles, setBotRoles] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedType, setSelectedType] = useState<'human' | 'bot'>('human');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        if (!guild || !guild.id) return;

        Promise.all([
            api.get(`/guild/${guild.id}/roles`, { timeout: 5000 }).catch(() => ({ data: { roles: [] } })),
            api.get(`/guild/${guild.id}/autorole`, { timeout: 5000 }).catch(() => ({ data: { humans: [], bots: [] } })),
        ]).then(([rolesRes, autoroleRes]) => {
            setRoles(rolesRes.data.roles || []);
            setHumanRoles(autoroleRes.data.humans || []);
            setBotRoles(autoroleRes.data.bots || []);
        }).finally(() => setLoading(false));
    }, []);

    const addEntry = () => {
        if (!selectedRole) return;
        if (selectedType === 'human') {
            if (humanRoles.includes(selectedRole)) return;
            setHumanRoles([...humanRoles, selectedRole]);
        } else {
            if (botRoles.includes(selectedRole)) return;
            setBotRoles([...botRoles, selectedRole]);
        }
        setSelectedRole('');
    };

    const removeHuman = (id: string) => setHumanRoles(humanRoles.filter(r => r !== id));
    const removeBot = (id: string) => setBotRoles(botRoles.filter(r => r !== id));

    const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || 'Unknown';
    const getRoleColor = (id: string) => {
        const color = roles.find(r => r.id === id)?.color || 0;
        return color === 0 ? '#9ca3af' : `#${color.toString(16).padStart(6, '0')}`;
    };

    const handleSave = async () => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        setSaving(true);
        try {
            await api.post(`/guild/${guild.id}/autorole`, {
                humans: humanRoles,
                bots: botRoles,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('[Autorole] Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading autorole data from bot...</span>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Users className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl font-bold text-white">Autorole</h1>
                </div>
                <p className="text-sm text-gray-500">Automatically assign roles when members or bots join</p>
            </div>

            {/* Add New Autorole */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <h2 className="text-base font-bold text-white mb-4">Add Autorole</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value)}
                        className="flex-1 bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Select a role...</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>@{r.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value as 'human' | 'bot')}
                        className="bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="human">For Humans</option>
                        <option value="bot">For Bots</option>
                    </select>
                    <button
                        onClick={addEntry}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Autorole Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Human Autoroles */}
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <UserPlus className="w-5 h-5 text-blue-400" />
                        <h2 className="text-base font-bold text-white">Human Autoroles</h2>
                        <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{humanRoles.length}</span>
                    </div>
                    <div className="space-y-1.5">
                        {humanRoles.length === 0 ? (
                            <p className="text-xs text-gray-600 py-4 text-center">No human autoroles configured</p>
                        ) : (
                            humanRoles.map(roleId => (
                                <div key={roleId} className="flex items-center justify-between bg-[#0a0f1e] rounded-lg px-3 py-2 border border-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getRoleColor(roleId) }} />
                                        <span className="text-sm text-white">@{getRoleName(roleId)}</span>
                                    </div>
                                    <button onClick={() => removeHuman(roleId)} className="p-1 hover:bg-red-500/20 rounded transition">
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Bot Autoroles */}
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Bot className="w-5 h-5 text-violet-400" />
                        <h2 className="text-base font-bold text-white">Bot Autoroles</h2>
                        <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{botRoles.length}</span>
                    </div>
                    <div className="space-y-1.5">
                        {botRoles.length === 0 ? (
                            <p className="text-xs text-gray-600 py-4 text-center">No bot autoroles configured</p>
                        ) : (
                            botRoles.map(roleId => (
                                <div key={roleId} className="flex items-center justify-between bg-[#0a0f1e] rounded-lg px-3 py-2 border border-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getRoleColor(roleId) }} />
                                        <span className="text-sm text-white">@{getRoleName(roleId)}</span>
                                    </div>
                                    <button onClick={() => removeBot(roleId)} className="p-1 hover:bg-red-500/20 rounded transition">
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : saved ? 'Saved to Bot!' : 'Save Autoroles'}
            </button>
        </DashboardLayout>
    );
};

export default AutorolePage;
