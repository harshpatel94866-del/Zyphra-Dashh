import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface AutoResponse { name: string; message: string; }

const AutoRespondersPage: React.FC = () => {
    const [responses, setResponses] = useState<AutoResponse[]>([]);
    const [newName, setNewName] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const getGuild = () => {
        const s = secureStorage.getItem('selected_guild');
        return s ? JSON.parse(s) : null;
    };

    useEffect(() => {
        const guild = getGuild();
        if (!guild || !guild.id) return;
        api.get(`/guild/${guild.id}/autoresponder`, { timeout: 5000 })
            .then(res => setResponses(res.data.responses || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const addResponse = async () => {
        if (!newName.trim() || !newMessage.trim()) return;
        const guild = getGuild();
        if (!guild) return;
        setSaving(true);
        try {
            await api.post(`/guild/${guild.id}/autoresponder`, {
                name: newName.trim(),
                message: newMessage.trim(),
            });
            setResponses([...responses.filter(r => r.name.toLowerCase() !== newName.trim().toLowerCase()), { name: newName.trim().toLowerCase(), message: newMessage.trim() }]);
            setNewName('');
            setNewMessage('');
        } catch (err) {
            console.error('[AutoResponder] Add failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const removeResponse = async (name: string) => {
        const guild = getGuild();
        if (!guild) return;
        try {
            await api.delete(`/guild/${guild.id}/autoresponder/${encodeURIComponent(name)}`);
            setResponses(responses.filter(r => r.name !== name));
        } catch (err) {
            console.error('[AutoResponder] Delete failed:', err);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading auto-responders from bot...</span>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <MessageCircle className="w-6 h-6 text-cyan-400" />
                    <h1 className="text-2xl font-bold text-white">Auto Responders</h1>
                </div>
                <p className="text-sm text-gray-500">Bot automatically responds when a trigger word is sent</p>
            </div>

            {/* Add Response */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <h2 className="text-base font-bold text-white mb-4">Add Auto Response</h2>
                <div className="space-y-3">
                    <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Trigger word"
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Bot will reply with this message..."
                        rows={3}
                        className="w-full bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                    />
                    <button
                        onClick={addResponse}
                        disabled={saving}
                        className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {saving ? 'Adding...' : 'Add Response'}
                    </button>
                </div>
            </div>

            {/* Responses List */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">
                    Active Responses <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full ml-2">{responses.length}/20</span>
                </h2>
                <div className="space-y-2">
                    {responses.length === 0 ? (
                        <p className="text-xs text-gray-600 py-4 text-center">No auto-responders configured</p>
                    ) : (
                        responses.map(r => (
                            <div key={r.name} className="bg-[#0a0f1e] rounded-lg px-4 py-3 border border-white/[0.04]">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-medium text-sm">Trigger: <span className="text-cyan-400">{r.name}</span></span>
                                    <button onClick={() => removeResponse(r.name)} className="p-1 hover:bg-red-500/20 rounded transition">
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 truncate">Reply: {r.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AutoRespondersPage;
