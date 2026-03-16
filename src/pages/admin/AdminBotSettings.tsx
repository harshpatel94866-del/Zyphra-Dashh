import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../api';
import { Settings, Loader2, Activity, Wrench, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const AdminBotSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<string | null>(null);

    // Bot status state
    const [status, setStatus] = useState('dnd');
    const [activityType, setActivityType] = useState('watching');
    const [activityText, setActivityText] = useState('');
    const [maintenance, setMaintenance] = useState(false);
    const [togglingMaint, setTogglingMaint] = useState(false);

    useEffect(() => {
        api.get('/admin/bot/status')
            .then(res => {
                setStatus(res.data.status || 'online');
                setActivityType(res.data.activity_type || 'watching');
                setActivityText(res.data.activity_text || '');
                setMaintenance(res.data.maintenance || false);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSavePresence = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/admin/bot/status', {
                status,
                activity_type: activityType,
                activity_text: activityText,
            });
        } catch (err) {
            console.error(err);
            alert('Failed to update bot status');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleMaintenance = async () => {
        setTogglingMaint(true);
        try {
            const res = await api.post('/admin/bot/maintenance', { enabled: !maintenance });
            setMaintenance(res.data.maintenance);
            if (res.data.maintenance) {
                setStatus('idle');
                setActivityType('playing');
                setActivityText('🔧 Maintenance Mode');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setTogglingMaint(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await api.post('/admin/bot/sync');
            setSyncResult(`✅ Synced ${res.data.synced} slash commands`);
        } catch (err: any) {
            setSyncResult(`❌ Sync failed: ${err?.response?.data?.detail || 'Unknown error'}`);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 opacity-50" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Bot Settings
                </h1>
                <p className="text-sm text-gray-400 mt-1">Control bot presence, maintenance mode, and command sync.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bot Presence */}
                <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-purple-500/10 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-bold text-white">Bot Presence</h2>
                    </div>

                    <form onSubmit={handleSavePresence} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { value: 'online', label: 'Online', color: 'bg-emerald-400' },
                                    { value: 'idle', label: 'Idle', color: 'bg-yellow-400' },
                                    { value: 'dnd', label: 'DND', color: 'bg-red-400' },
                                    { value: 'invisible', label: 'Invisible', color: 'bg-gray-500' },
                                ].map(s => (
                                    <button key={s.value} type="button" onClick={() => setStatus(s.value)}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${status === s.value
                                            ? 'bg-purple-500/20 border-purple-500/30 text-white'
                                            : 'bg-[#0a0f1e] border-white/[0.08] text-gray-400 hover:border-white/[0.15]'}`}>
                                        <span className={`w-2 h-2 rounded-full ${s.color}`} />
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Activity Type</label>
                            <select value={activityType} onChange={e => setActivityType(e.target.value)}
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]">
                                <option value="watching">Watching</option>
                                <option value="playing">Playing</option>
                                <option value="listening">Listening to</option>
                                <option value="competing">Competing in</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Activity Text</label>
                            <input type="text" value={activityText} onChange={e => setActivityText(e.target.value)}
                                placeholder="e.g. Protecting 500 Servers!"
                                className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" />
                        </div>

                        <button type="submit" disabled={saving}
                            className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Save Presence
                        </button>
                    </form>
                </div>

                {/* Maintenance & Sync */}
                <div className="space-y-6">
                    {/* Maintenance Mode */}
                    <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-yellow-500/10 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-yellow-400" />
                                <h2 className="text-lg font-bold text-white">Maintenance Mode</h2>
                            </div>
                            <button onClick={handleToggleMaintenance} disabled={togglingMaint}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenance ? 'bg-yellow-500' : 'bg-[#0a0f1e] border border-white/[0.08]'}`}>
                                <span className={`inline-block w-5 h-5 transform rounded-full bg-white transition-transform ${maintenance ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400">
                            {maintenance
                                ? '🔧 Maintenance mode is ON. Bot status is set to Idle with maintenance activity.'
                                : 'Enable this to put the bot in maintenance mode. It will change the status to Idle and update the activity.'}
                        </p>
                        {maintenance && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                Bot is currently in maintenance mode
                            </div>
                        )}
                    </div>

                    {/* Slash Command Sync */}
                    <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-emerald-500/10 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <RefreshCw className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-lg font-bold text-white">Slash Command Sync</h2>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Force sync all slash commands to Discord. This may take a few seconds.
                        </p>
                        <button onClick={handleSync} disabled={syncing}
                            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            {syncing ? 'Syncing...' : 'Sync Commands'}
                        </button>
                        {syncResult && (
                            <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${syncResult.startsWith('✅')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {syncResult}
                            </p>
                        )}
                    </div>

                    {/* Settings Quick Info */}
                    <div className="bg-[#0f1423]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Settings className="w-5 h-5 text-gray-400" />
                            <h2 className="text-sm font-bold text-gray-300">Quick Info</h2>
                        </div>
                        <div className="space-y-2 text-xs text-gray-500">
                            <p>• Presence changes are instant and visible on Discord immediately.</p>
                            <p>• Maintenance mode resets when the bot restarts.</p>
                            <p>• Slash command sync may take up to 1 hour to propagate globally.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBotSettings;
