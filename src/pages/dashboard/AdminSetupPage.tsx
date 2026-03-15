import React, { useState, useEffect } from 'react';
import { UserCog, Shield, Trash2, Save } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Role { id: string; name: string; color: number; position: number; }

const AdminSetupPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [adminRoles, setAdminRoles] = useState<string[]>([]);
    const [bypassRoles, setBypassRoles] = useState<string[]>([]);

    useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        if (!guild || !guild.id) return;
        api.get(`/guild/${guild.id}/roles`, { timeout: 5000 })
            .then(res => setRoles(res.data.roles || []))
            .catch(() => { });
    }, []);

    const addRole = (roleId: string, list: string[], setList: (v: string[]) => void) => {
        if (roleId && !list.includes(roleId)) setList([...list, roleId]);
    };

    const removeRole = (roleId: string, list: string[], setList: (v: string[]) => void) => {
        setList(list.filter(r => r !== roleId));
    };

    const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || 'Unknown';
    const getRoleColor = (id: string) => {
        const color = roles.find(r => r.id === id)?.color || 0;
        return color === 0 ? '#9ca3af' : `#${color.toString(16).padStart(6, '0')}`;
    };

    const RoleList: React.FC<{ title: string; desc: string; icon: React.ReactNode; items: string[]; onAdd: (id: string) => void; onRemove: (id: string) => void }> = ({ title, desc, icon, items, onAdd, onRemove }) => (
        <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-1">
                {icon}
                <h2 className="text-base font-bold text-white">{title}</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">{desc}</p>

            <select
                onChange={e => { onAdd(e.target.value); e.target.value = ''; }}
                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-3"
                defaultValue=""
            >
                <option value="" disabled>Select a role to add...</option>
                {roles.filter(r => !items.includes(r.id)).map(r => (
                    <option key={r.id} value={r.id}>@{r.name}</option>
                ))}
            </select>

            <div className="space-y-1.5">
                {items.length === 0 ? (
                    <p className="text-xs text-gray-600 py-3 text-center">No roles configured</p>
                ) : (
                    items.map(id => (
                        <div key={id} className="flex items-center justify-between bg-[#0a0f1e] rounded-lg px-3 py-2 border border-white/[0.04]">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getRoleColor(id) }} />
                                <span className="text-sm text-white">@{getRoleName(id)}</span>
                            </div>
                            <button onClick={() => onRemove(id)} className="p-1 hover:bg-red-500/20 rounded transition">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <UserCog className="w-6 h-6 text-indigo-400" />
                    <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
                </div>
                <p className="text-sm text-gray-500">Configure admin roles and permission bypass</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoleList
                    title="Admin Roles"
                    desc="Roles with full admin access to bot commands"
                    icon={<Shield className="w-5 h-5 text-red-400" />}
                    items={adminRoles}
                    onAdd={id => addRole(id, adminRoles, setAdminRoles)}
                    onRemove={id => removeRole(id, adminRoles, setAdminRoles)}
                />
                <RoleList
                    title="Bypass Roles"
                    desc="Roles that bypass automod and spam filters"
                    icon={<Shield className="w-5 h-5 text-emerald-400" />}
                    items={bypassRoles}
                    onAdd={id => addRole(id, bypassRoles, setBypassRoles)}
                    onRemove={id => removeRole(id, bypassRoles, setBypassRoles)}
                />
            </div>

            <button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Admin Setup
            </button>
        </DashboardLayout>
    );
};

export default AdminSetupPage;
