import React, { useState, useEffect } from 'react';
import { Wrench, Shield, Users, Hash, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Role { id: string; name: string; color: number; position: number; }
interface Channel { id: string; name: string; type: number; }

const ModSetupPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [modRoles, setModRoles] = useState<string[]>([]);
    const [muteRole, setMuteRole] = useState('');
    const [modLogChannel, setModLogChannel] = useState('');
    const [warnThreshold, setWarnThreshold] = useState(3);
    const [warnAction, setWarnAction] = useState('mute');

    useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        if (!guild || !guild.id) return;

        Promise.all([
            api.get(`/guild/${guild.id}/roles`, { timeout: 5000 }).catch(() => ({ data: { roles: [] } })),
            api.get(`/guild/${guild.id}/channels`, { timeout: 5000 }).catch(() => ({ data: { channels: [] } })),
        ]).then(([rolesRes, chRes]) => {
            setRoles(rolesRes.data.roles || []);
            setChannels((chRes.data.channels || []).filter((c: Channel) => c.type === 0));
        });
    }, []);

    const addModRole = (roleId: string) => {
        if (roleId && !modRoles.includes(roleId)) setModRoles([...modRoles, roleId]);
    };

    const removeModRole = (roleId: string) => {
        setModRoles(modRoles.filter(r => r !== roleId));
    };

    const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || 'Unknown';
    const getRoleColor = (id: string) => {
        const color = roles.find(r => r.id === id)?.color || 0;
        return color === 0 ? '#9ca3af' : `#${color.toString(16).padStart(6, '0')}`;
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Wrench className="w-6 h-6 text-orange-400" />
                    <h1 className="text-2xl font-bold text-white">Mod Setup</h1>
                </div>
                <p className="text-sm text-gray-500">Configure moderation roles, channels, and warning system</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mod Roles */}
                <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <h2 className="text-base font-bold text-white">Moderator Roles</h2>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Roles that have moderation permissions</p>

                    <select
                        onChange={e => { addModRole(e.target.value); e.target.value = ''; }}
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-3"
                        defaultValue=""
                    >
                        <option value="" disabled>Select a role to add...</option>
                        {roles.filter(r => !modRoles.includes(r.id)).map(r => (
                            <option key={r.id} value={r.id}>@{r.name}</option>
                        ))}
                    </select>

                    <div className="space-y-1.5">
                        {modRoles.length === 0 ? (
                            <p className="text-xs text-gray-600 py-3 text-center">No moderator roles configured</p>
                        ) : (
                            modRoles.map(id => (
                                <div key={id} className="flex items-center justify-between bg-[#0a0f1e] rounded-lg px-3 py-2 border border-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getRoleColor(id) }} />
                                        <span className="text-sm text-white">@{getRoleName(id)}</span>
                                    </div>
                                    <button onClick={() => removeModRole(id)} className="p-1 hover:bg-red-500/20 rounded transition">
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mute Role + Log Channel */}
                <div className="space-y-6">
                    <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Users className="w-5 h-5 text-amber-400" />
                            <h2 className="text-base font-bold text-white">Mute Role</h2>
                        </div>
                        <select
                            value={muteRole}
                            onChange={e => setMuteRole(e.target.value)}
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Auto-create Muted role</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>@{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Hash className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-base font-bold text-white">Mod Log Channel</h2>
                        </div>
                        <select
                            value={modLogChannel}
                            onChange={e => setModLogChannel(e.target.value)}
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">None</option>
                            {channels.map(ch => (
                                <option key={ch.id} value={ch.id}># {ch.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Warning System */}
                <div className="lg:col-span-2 bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                    <h2 className="text-base font-bold text-white mb-4">Warning System</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Warn Threshold</label>
                            <p className="text-xs text-gray-600 mb-2">Number of warnings before auto-action</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range" min={1} max={10} value={warnThreshold}
                                    onChange={e => setWarnThreshold(parseInt(e.target.value))}
                                    className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <span className="text-lg font-bold text-orange-400 w-8 text-right">{warnThreshold}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Auto Action</label>
                            <p className="text-xs text-gray-600 mb-2">Action when warn threshold is reached</p>
                            <select
                                value={warnAction}
                                onChange={e => setWarnAction(e.target.value)}
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="mute">Mute</option>
                                <option value="kick">Kick</option>
                                <option value="ban">Ban</option>
                                <option value="timeout">Timeout (1h)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <button className="mt-6 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Mod Setup
            </button>
        </DashboardLayout>
    );
};

export default ModSetupPage;
