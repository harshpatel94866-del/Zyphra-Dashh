import React from 'react';
import { AlertTriangle, Shield, Users, Zap } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const EmergencyPage: React.FC = () => {
    const [enabled, setEnabled] = React.useState(false);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <h1 className="text-2xl font-bold text-white">Emergency Mode</h1>
                </div>
                <p className="text-sm text-gray-500">Rapid containment controls for server emergencies</p>
            </div>

            <div className="bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">Emergency System</h2>
                        <p className="text-xs text-gray-500 mt-1">When enabled, locks down the server instantly</p>
                    </div>
                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${enabled
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700'
                                : 'bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white'
                            }`}
                    >
                        {enabled ? '🔴 Emergency Active' : 'Activate Emergency'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04]">
                        <Shield className="w-5 h-5 text-blue-400 mb-2" />
                        <h3 className="text-sm font-semibold text-white mb-1">Anti Betray</h3>
                        <p className="text-xs text-gray-500">Prevents trusted users from going rogue during emergencies</p>
                        <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition">Configure →</button>
                    </div>
                    <div className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04]">
                        <Users className="w-5 h-5 text-emerald-400 mb-2" />
                        <h3 className="text-sm font-semibold text-white mb-1">Authorized Users</h3>
                        <p className="text-xs text-gray-500">Users who can activate/deactivate emergency mode</p>
                        <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition">Manage →</button>
                    </div>
                    <div className="bg-[#0a0f1e] rounded-lg p-4 border border-white/[0.04]">
                        <Zap className="w-5 h-5 text-amber-400 mb-2" />
                        <h3 className="text-sm font-semibold text-white mb-1">Auto Emergency</h3>
                        <p className="text-xs text-gray-500">Automatically trigger emergency on mass attacks</p>
                        <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition">Configure →</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmergencyPage;
