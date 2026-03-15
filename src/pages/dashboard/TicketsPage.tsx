import React, { useState, useEffect } from 'react';
import { Ticket, Loader2, Save, CheckCircle, Settings, Hash } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Channel { id: string; name: string; type: number; }
interface Role { id: string; name: string; color: number; position: number; }

const TicketsPage: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [config, setConfig] = useState<any>({ configured: false });
    const [panelChannel, setPanelChannel] = useState('');
    const [ticketCategory, setTicketCategory] = useState('');
    const [supportRole, setSupportRole] = useState('');
    const [logChannel, setLogChannel] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const getGuild = () => {
        const s = secureStorage.getItem('selected_guild');
        return s ? JSON.parse(s) : null;
    };

    useEffect(() => {
        const guild = getGuild();
        if (!guild) return;
        Promise.all([
            api.get(`/guild/${guild.id}/channels`, { timeout: 5000 }).catch(() => ({ data: { channels: [] } })),
            api.get(`/guild/${guild.id}/roles`, { timeout: 5000 }).catch(() => ({ data: { roles: [] } })),
            api.get(`/guild/${guild.id}/tickets`, { timeout: 5000 }).catch(() => ({ data: { configured: false } })),
        ]).then(([cRes, rRes, tRes]) => {
            const allChannels = cRes.data.channels || [];
            setChannels(allChannels);
            setRoles(rRes.data.roles || []);
            const cfg = tRes.data;
            setConfig(cfg);
            if (cfg.configured) {
                setPanelChannel(cfg.panel_channel_id || '');
                setTicketCategory(cfg.ticket_category_id || '');
                setSupportRole(cfg.support_role_id || '');
                setLogChannel(cfg.logs_channel_id || '');
            }
        }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        const guild = getGuild();
        if (!guild) return;
        setSaving(true);
        try {
            await api.post(`/guild/${guild.id}/tickets`, {
                panel_channel_id: panelChannel || null,
                ticket_category_id: ticketCategory || null,
                support_role_id: supportRole || null,
                logs_channel_id: logChannel || null,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('[Tickets] Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const textChannels = channels.filter(c => c.type === 0);
    const categories = channels.filter(c => c.type === 4);

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading ticket config from bot...</span>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Ticket className="w-6 h-6 text-orange-400" />
                    <h1 className="text-2xl font-bold text-white">Tickets</h1>
                    {config.configured && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Configured</span>
                    )}
                </div>
                <p className="text-sm text-gray-500">Configure ticket system panel and support roles</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-300">
                    <strong>Tip:</strong> For full setup, use the <code className="bg-blue-500/20 px-1.5 py-0.5 rounded">ticket setup</code> bot command which includes interactive panel creation with buttons.
                </p>
            </div>

            {/* Configuration */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <h2 className="text-base font-bold text-white">Ticket Configuration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Panel Channel</label>
                        <select value={panelChannel} onChange={e => setPanelChannel(e.target.value)}
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                            <option value="">Select channel...</option>
                            {textChannels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Ticket Category</label>
                        <select value={ticketCategory} onChange={e => setTicketCategory(e.target.value)}
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                            <option value="">Select category...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Support Role</label>
                        <select value={supportRole} onChange={e => setSupportRole(e.target.value)}
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                            <option value="">Select role...</option>
                            {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Log Channel</label>
                        <select value={logChannel} onChange={e => setLogChannel(e.target.value)}
                            className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                            <option value="">Select channel...</option>
                            {textChannels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : saved ? 'Saved to Bot!' : 'Save Configuration'}
            </button>
        </DashboardLayout>
    );
};

export default TicketsPage;
