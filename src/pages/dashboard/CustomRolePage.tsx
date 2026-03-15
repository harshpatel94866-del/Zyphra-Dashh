import React, { useState, useEffect } from 'react';
import { Crown, Plus, Trash2, Save, Loader2, CheckCircle } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Role { id: string; name: string; color: number; position: number; }
interface CustomCmd { name: string; role_id: string; }

const CustomRolePage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [setupRoles, setSetupRoles] = useState<Record<string, string>>({});
    const [customCmds, setCustomCmds] = useState<CustomCmd[]>([]);
    const [newCmdName, setNewCmdName] = useState('');
    const [newCmdRole, setNewCmdRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const getGuild = () => { const s = secureStorage.getItem('selected_guild'); return s ? JSON.parse(s) : null; };

    useEffect(() => {
        const guild = getGuild();
        if (!guild || !guild.id) return;
        Promise.all([
            api.get(`/guild/${guild.id}/roles`, { timeout: 5000 }).catch(() => ({ data: { roles: [] } })),
            api.get(`/guild/${guild.id}/customrole`, { timeout: 5000 }).catch(() => ({ data: { roles: {}, custom_commands: [] } })),
        ]).then(([rRes, crRes]) => {
            setRoles(rRes.data.roles || []);
            setSetupRoles(crRes.data.roles || {});
            setCustomCmds(crRes.data.custom_commands || []);
        }).finally(() => setLoading(false));
    }, []);

    const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || 'Unknown';

    const handleSaveSetup = async () => {
        const guild = getGuild();
        if (!guild) return;
        setSaving(true);
        try {
            await api.post(`/guild/${guild.id}/customrole`, { roles: setupRoles });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error('[CustomRole] Save failed:', err); }
        finally { setSaving(false); }
    };

    const addCmd = async () => {
        if (!newCmdName.trim() || !newCmdRole) return;
        const guild = getGuild();
        if (!guild) return;
        try {
            await api.post(`/guild/${guild.id}/customrole/command`, {
                name: newCmdName.trim(),
                role_id: newCmdRole,
            });
            setCustomCmds([...customCmds, { name: newCmdName.trim().toLowerCase(), role_id: newCmdRole }]);
            setNewCmdName('');
            setNewCmdRole('');
        } catch (err) { console.error('[CustomRole] Add cmd failed:', err); }
    };

    const deleteCmd = async (name: string) => {
        const guild = getGuild();
        if (!guild) return;
        try {
            await api.delete(`/guild/${guild.id}/customrole/command/${encodeURIComponent(name)}`);
            setCustomCmds(customCmds.filter(c => c.name !== name));
        } catch (err) { console.error('[CustomRole] Delete cmd failed:', err); }
    };

    const roleTypes = [
        { key: 'staff', label: 'Staff Role' },
        { key: 'girl', label: 'Girl Role' },
        { key: 'vip', label: 'VIP Role' },
        { key: 'guest', label: 'Guest Role' },
        { key: 'friend', label: 'Friend Role' },
        { key: 'reqrole', label: 'Required Role (to use commands)' },
    ];

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading custom roles from bot...</span>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <h1 className="text-2xl font-bold text-white">Custom Roles</h1>
                </div>
                <p className="text-sm text-gray-500">Setup custom role assignment commands</p>
            </div>

            {/* Built-in Role Setup */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <h2 className="text-base font-bold text-white mb-4">Role Setup</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleTypes.map(rt => (
                        <div key={rt.key}>
                            <label className="text-xs text-gray-500 mb-1 block">{rt.label}</label>
                            <select
                                value={setupRoles[rt.key] || ''}
                                onChange={e => setSetupRoles({ ...setupRoles, [rt.key]: e.target.value || '' })}
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">None</option>
                                {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
                <button onClick={handleSaveSetup} disabled={saving}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : saved ? 'Saved to Bot!' : 'Save Roles'}
                </button>
            </div>

            {/* Custom Commands */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">
                    Custom Commands <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full ml-2">{customCmds.length}/56</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input value={newCmdName} onChange={e => setNewCmdName(e.target.value)} placeholder="Command name"
                        className="flex-1 bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                    <select value={newCmdRole} onChange={e => setNewCmdRole(e.target.value)}
                        className="flex-1 bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                        <option value="">Select role...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                    </select>
                    <button onClick={addCmd} className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
                <div className="space-y-2">
                    {customCmds.length === 0 ? (
                        <p className="text-xs text-gray-600 py-4 text-center">No custom commands</p>
                    ) : customCmds.map(cmd => (
                        <div key={cmd.name} className="flex items-center justify-between bg-[#0a0f1e] rounded-lg px-4 py-3 border border-white/[0.04]">
                            <div>
                                <span className="text-white font-medium text-sm">{cmd.name}</span>
                                <span className="text-gray-500 text-xs ml-3">→ @{getRoleName(cmd.role_id)}</span>
                            </div>
                            <button onClick={() => deleteCmd(cmd.name)} className="p-1 hover:bg-red-500/20 rounded transition">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomRolePage;
