import React from 'react';
import { Gauge, Shield } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const limits = [
    { id: 'ban_limit', label: 'Ban Limit', desc: 'Max bans before action', default: 3 },
    { id: 'kick_limit', label: 'Kick Limit', desc: 'Max kicks before action', default: 3 },
    { id: 'channel_limit', label: 'Channel Limit', desc: 'Max channel changes before action', default: 3 },
    { id: 'role_limit', label: 'Role Limit', desc: 'Max role changes before action', default: 3 },
];

const LimitSystemPage: React.FC = () => {
    const [values, setValues] = React.useState<Record<string, number>>(
        Object.fromEntries(limits.map(l => [l.id, l.default]))
    );
    const [timeWindow, setTimeWindow] = React.useState(600);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Gauge className="w-6 h-6 text-cyan-400" />
                    <h1 className="text-2xl font-bold text-white">Limit System</h1>
                </div>
                <p className="text-sm text-gray-500">Set rate limits for destructive actions to prevent nukes</p>
            </div>

            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-5">Action Limits</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    {limits.map(limit => (
                        <div key={limit.id} className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04]">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{limit.label}</h3>
                                    <p className="text-xs text-gray-500">{limit.desc}</p>
                                </div>
                                <Shield className="w-4 h-4 text-cyan-400/50" />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={values[limit.id]}
                                    onChange={e => setValues(prev => ({ ...prev, [limit.id]: parseInt(e.target.value) }))}
                                    className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <span className="text-lg font-bold text-cyan-400 w-8 text-right">{values[limit.id]}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time Window */}
                <div className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04] max-w-md">
                    <h3 className="text-sm font-semibold text-white mb-1">Time Window</h3>
                    <p className="text-xs text-gray-500 mb-3">Period (in seconds) to count actions</p>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={60}
                            max={3600}
                            step={60}
                            value={timeWindow}
                            onChange={e => setTimeWindow(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <span className="text-lg font-bold text-cyan-400 w-16 text-right">{timeWindow}s</span>
                    </div>
                </div>

                <button className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                    Save Limits
                </button>
            </div>
        </DashboardLayout>
    );
};

export default LimitSystemPage;
