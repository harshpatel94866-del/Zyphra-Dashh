import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Trigger { trigger: string; emojis: string; }

const AutoReactPage: React.FC = () => {
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const [newTrigger, setNewTrigger] = useState('');
    const [newEmojis, setNewEmojis] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const getGuild = () => {
        const s = secureStorage.getItem('selected_guild');
        return s ? JSON.parse(s) : null;
    };

    useEffect(() => {
        const guild = getGuild();
        if (!guild || !guild.id) return;
        api.get(`/guild/${guild.id}/autoreact`, { timeout: 5000 })
            .then(res => setTriggers(res.data.triggers || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const addTrigger = async () => {
        if (!newTrigger.trim() || !newEmojis.trim()) return;
        const guild = getGuild();
        if (!guild) return;
        setSaving(true);
        try {
            await api.post(`/guild/${guild.id}/autoreact`, {
                trigger: newTrigger.trim(),
                emojis: newEmojis.trim(),
            });
            setTriggers([...triggers, { trigger: newTrigger.trim(), emojis: newEmojis.trim() }]);
            setNewTrigger('');
            setNewEmojis('');
        } catch (err) {
            console.error('[AutoReact] Add failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const removeTrigger = async (trigger: string) => {
        const guild = getGuild();
        if (!guild) return;
        try {
            await api.delete(`/guild/${guild.id}/autoreact/${encodeURIComponent(trigger)}`);
            setTriggers(triggers.filter(t => t.trigger !== trigger));
        } catch (err) {
            console.error('[AutoReact] Delete failed:', err);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading auto-react from bot...</span>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <h1 className="text-2xl font-bold text-white">Auto React</h1>
                </div>
                <p className="text-sm text-gray-500">Auto-react with emojis when certain trigger words are used</p>
            </div>

            {/* Add Trigger */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <h2 className="text-base font-bold text-white mb-4">Add Trigger</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        value={newTrigger}
                        onChange={e => setNewTrigger(e.target.value)}
                        placeholder="Trigger word (one word)"
                        className="flex-1 bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <input
                        value={newEmojis}
                        onChange={e => setNewEmojis(e.target.value)}
                        placeholder="Emojis (space separated)"
                        className="flex-1 bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={addTrigger}
                        disabled={saving}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                    </button>
                </div>
            </div>

            {/* Triggers List */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">
                    Active Triggers <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full ml-2">{triggers.length}/10</span>
                </h2>
                <div className="space-y-2">
                    {triggers.length === 0 ? (
                        <p className="text-xs text-gray-600 py-4 text-center">No auto-react triggers configured</p>
                    ) : (
                        triggers.map(t => (
                            <div key={t.trigger} className="flex items-center justify-between bg-[#0a0f1e] rounded-lg px-4 py-3 border border-white/[0.04]">
                                <div>
                                    <span className="text-white font-medium text-sm">{t.trigger}</span>
                                    <span className="text-gray-500 text-xs ml-3">→ {t.emojis}</span>
                                </div>
                                <button onClick={() => removeTrigger(t.trigger)} className="p-1 hover:bg-red-500/20 rounded transition">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AutoReactPage;
