import React, { useState, useEffect } from 'react';
import { ScrollText, Hash, Save, Check } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { secureStorage } from '../../utils/secureStorage';

interface Channel { id: string; name: string; type: number; }

const logEvents = [
    { id: 'message_delete', label: 'Message Delete', desc: 'When messages are deleted', category: 'Message' },
    { id: 'message_edit', label: 'Message Edit', desc: 'When messages are edited', category: 'Message' },
    { id: 'message_bulk_delete', label: 'Bulk Delete', desc: 'When messages are purged', category: 'Message' },
    { id: 'member_join', label: 'Member Join', desc: 'When a member joins the server', category: 'Member' },
    { id: 'member_leave', label: 'Member Leave', desc: 'When a member leaves/is kicked', category: 'Member' },
    { id: 'member_ban', label: 'Member Ban', desc: 'When a member is banned', category: 'Member' },
    { id: 'member_unban', label: 'Member Unban', desc: 'When a member is unbanned', category: 'Member' },
    { id: 'member_role_update', label: 'Role Update', desc: 'When member roles change', category: 'Member' },
    { id: 'member_nickname', label: 'Nickname Change', desc: 'When nicknames change', category: 'Member' },
    { id: 'channel_create', label: 'Channel Create', desc: 'When channels are created', category: 'Server' },
    { id: 'channel_delete', label: 'Channel Delete', desc: 'When channels are deleted', category: 'Server' },
    { id: 'channel_update', label: 'Channel Update', desc: 'When channels are modified', category: 'Server' },
    { id: 'role_create', label: 'Role Create', desc: 'When roles are created', category: 'Server' },
    { id: 'role_delete', label: 'Role Delete', desc: 'When roles are deleted', category: 'Server' },
    { id: 'role_update', label: 'Role Update', desc: 'When roles are modified', category: 'Server' },
    { id: 'voice_join', label: 'Voice Join', desc: 'When members join voice', category: 'Voice' },
    { id: 'voice_leave', label: 'Voice Leave', desc: 'When members leave voice', category: 'Voice' },
    { id: 'voice_move', label: 'Voice Move', desc: 'When members switch voice channels', category: 'Voice' },
];

const categories = ['Message', 'Member', 'Server', 'Voice'];

const LoggingPage: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [enabled, setEnabled] = useState(false);
    const [defaultChannel, setDefaultChannel] = useState('');
    const [eventChannels, setEventChannels] = useState<Record<string, string>>({});
    const [enabledEvents, setEnabledEvents] = useState<Record<string, boolean>>(
        Object.fromEntries(logEvents.map(e => [e.id, false]))
    );

    useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) return;
        const guild = JSON.parse(guildStr);
        if (!guild || !guild.id) return;
        api.get(`/guild/${guild.id}/channels`, { timeout: 5000 })
            .then(res => setChannels((res.data.channels || []).filter((c: Channel) => c.type === 0)))
            .catch(() => { });
    }, []);

    const toggleEvent = (id: string) => {
        setEnabledEvents(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const enabledCount = Object.values(enabledEvents).filter(Boolean).length;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <ScrollText className="w-6 h-6 text-yellow-400" />
                    <h1 className="text-2xl font-bold text-white">Logging</h1>
                </div>
                <p className="text-sm text-gray-500">Configure event logging for your server</p>
            </div>

            {/* Master Toggle + Default Channel */}
            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white">Logging System</h2>
                        <p className="text-xs text-gray-500 mt-1">{enabledCount}/{logEvents.length} events enabled</p>
                    </div>
                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Default Log Channel</label>
                    <p className="text-xs text-gray-600 mb-2">All events will log here unless overridden per-event</p>
                    <select
                        value={defaultChannel}
                        onChange={e => setDefaultChannel(e.target.value)}
                        className="w-full max-w-md bg-[#0a0f1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Select a channel...</option>
                        {channels.map(ch => (
                            <option key={ch.id} value={ch.id}># {ch.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Event Categories */}
            {categories.map(cat => {
                const events = logEvents.filter(e => e.category === cat);
                return (
                    <div key={cat} className="mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{cat} Events</h3>
                        <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
                            {events.map((event, i) => (
                                <div key={event.id} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-white/[0.04]' : ''} hover:bg-white/[0.02] transition`}>
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{event.label}</span>
                                            {enabledEvents[event.id] && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{event.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={eventChannels[event.id] || ''}
                                            onChange={e => setEventChannels(prev => ({ ...prev, [event.id]: e.target.value }))}
                                            className="bg-[#0a0f1e] border border-white/[0.06] rounded-md px-2 py-1 text-xs text-gray-400 focus:outline-none focus:border-blue-500 max-w-[140px]"
                                        >
                                            <option value="">Default</option>
                                            {channels.map(ch => (
                                                <option key={ch.id} value={ch.id}># {ch.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => toggleEvent(event.id)}
                                            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${enabledEvents[event.id] ? 'bg-emerald-500' : 'bg-gray-600'
                                                }`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${enabledEvents[event.id] ? 'translate-x-[22px]' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <button className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Logging Config
            </button>
        </DashboardLayout>
    );
};

export default LoggingPage;
