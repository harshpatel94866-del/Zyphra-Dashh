import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, Server, Database, Activity, Globe, Clock, Check, AlertCircle, XCircle, Cpu, Users, Layers, Headphones } from 'lucide-react';
import { getStatusDetailed } from '../api';

interface Shard {
    id: number;
    status: 'online' | 'degraded' | 'offline';
    latency: number;
    servers: number;
    users: number;
    voice: number;
}

interface Service {
    name: string;
    description: string;
    status: 'online' | 'degraded' | 'offline';
}

interface StatusData {
    uptime_seconds: number;
    shards_total: number;
    shards_online: number;
    avg_latency: number;
    total_servers: number;
    total_users: number;
    total_voice: number;
    per_shard: Shard[];
    services: Service[];
}

const StatusPage: React.FC = () => {
    const { modeStyle, colors, primaryColorClass, bgClass, textClass, solidBgClass } = useTheme();
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState<StatusData | null>(null);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());

    const fetchStatus = async () => {
        try {
            const data = await getStatusDetailed();
            setStatusData(data);
            setLastChecked(new Date());
        } catch (error) {
            console.error("Failed to fetch status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 15000); // refresh every 15s
        return () => clearInterval(interval);
    }, []);

    // Formatters
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const getStatusIcon = (status: string, className = "w-5 h-5") => {
        if (status === 'online') return <CheckCircle2 className={`${className} text-emerald-500`} />;
        if (status === 'degraded') return <AlertCircle className={`${className} text-yellow-500`} />;
        return <XCircle className={`${className} text-red-500`} />;
    };

    const getStatusColor = (status: string) => {
        if (status === 'online') return 'text-emerald-500';
        if (status === 'degraded') return 'text-yellow-500';
        return 'text-red-500';
    };

    const getStatusBg = (status: string) => {
        if (status === 'online') return 'bg-emerald-500/10 border-emerald-500/20';
        if (status === 'degraded') return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-red-500/10 border-red-500/20';
    };

    if (loading && !statusData) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${bgClass} ${textClass}`}>
                <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4`} style={{ borderColor: `${colors.primary}40`, borderTopColor: colors.primary }} />
                <p className="text-lg opacity-70">Connecting to Zyphra services...</p>
            </div>
        );
    }

    // Determine overall banner status
    let overallStatus = 'All Systems Operational';
    let overallStatusColor = 'text-emerald-500';
    let overallStatusBg = 'bg-emerald-500/10 border-emerald-500/20';
    let OverallIcon = CheckCircle2;

    if (statusData) {
        const offlineShards = statusData.per_shard.filter(s => s.status === 'offline').length;
        const degradedShards = statusData.per_shard.filter(s => s.status === 'degraded').length;
        const offlineServices = statusData.services.filter(s => s.status === 'offline').length;

        if (offlineShards > 0 || offlineServices > 0) {
            overallStatus = 'Partial System Outage';
            overallStatusColor = 'text-red-500';
            overallStatusBg = 'bg-red-500/10 border-red-500/20';
            OverallIcon = XCircle;
        } else if (degradedShards > 0) {
            overallStatus = 'Degraded Performance';
            overallStatusColor = 'text-yellow-500';
            overallStatusBg = 'bg-yellow-500/10 border-yellow-500/20';
            OverallIcon = AlertCircle;
        }
    }

    return (
        <div className={`min-h-screen ${bgClass} ${textClass} pt-24 pb-20 font-sans transition-colors duration-300`}>
            <div className="max-w-6xl mx-auto px-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b pb-8" style={{ borderColor: modeStyle.border }}>
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-sm opacity-60">
                            <Globe className="w-4 h-4" />
                            <span>Status Page</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight flex items-center gap-3">
                            System Status<span className={primaryColorClass}>.</span>
                        </h1>
                        <p className="text-lg opacity-70 mt-2">
                            Real-time status of all Zyphra services and shards.
                        </p>
                    </div>
                    <button 
                        onClick={fetchStatus}
                        className={`mt-6 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-[var(--theme-bg-hover)] transition-colors text-sm font-medium`}
                        style={{ borderColor: modeStyle.border }}
                    >
                        <Clock className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Banner */}
                <div className={`rounded-xl p-6 border mb-10 flex items-start sm:items-center gap-4 ${overallStatusBg}`}>
                    <div className={`rounded-full p-2 bg-black/20 shrink-0`}>
                        <OverallIcon className={`w-8 h-8 ${overallStatusColor}`} />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${overallStatusColor}`}>{overallStatus}</h2>
                        <p className="opacity-80 text-sm mt-1">
                            Last checked: {lastChecked.toLocaleTimeString()} · Auto-refreshes every 15s
                        </p>
                    </div>
                </div>

                {statusData && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        
                        {/* Global Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <StatCard icon={Cpu} label="SHARDS" value={`${statusData.shards_online}/${statusData.shards_total}`} sub="online" theme={modeStyle} />
                            <StatCard icon={Activity} label="AVG LATENCY" value={`${statusData.avg_latency}ms`} sub={statusData.avg_latency < 200 ? 'good' : 'poor'} theme={modeStyle} />
                            <StatCard icon={Server} label="SERVERS" value={formatNumber(statusData.total_servers)} sub="total" theme={modeStyle} />
                            <StatCard icon={Users} label="USERS" value={formatNumber(statusData.total_users)} sub="total" theme={modeStyle} />
                            <StatCard icon={Clock} label="UPTIME" value={formatUptime(statusData.uptime_seconds)} sub="since start" theme={modeStyle} />
                            <StatCard icon={Headphones} label="VOICE" value={formatNumber(statusData.total_voice)} sub="connections" theme={modeStyle} />
                        </div>

                        {/* Layout: Left Shards, Right Services */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                            
                            {/* Shards Grid (Takes up 8 columns) */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Layers className={`w-5 h-5 ${primaryColorClass}`} />
                                        Per-Shard Status
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs font-medium">
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Online</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"/> Degraded</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"/> Offline</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {statusData.per_shard.map(shard => (
                                        <div 
                                            key={shard.id}
                                            className="rounded-xl border p-5 backdrop-blur-md transition-colors hover:border-[var(--theme-border-light)]"
                                            style={{ borderColor: modeStyle.border, backgroundColor: modeStyle.bgCard }}
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBg(shard.status)}`}>
                                                        {getStatusIcon(shard.status, 'w-4 h-4')}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">Shard {shard.id}</h4>
                                                        <div className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${getStatusColor(shard.status)}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                                                            {shard.status.charAt(0).toUpperCase() + shard.status.slice(1)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xl font-black ${getStatusColor(shard.status)}`}>{shard.latency}<span className="text-sm font-medium opacity-60">ms</span></div>
                                                    <div className="text-[10px] uppercase tracking-wider opacity-50 mt-1">Excellent</div>
                                                </div>
                                            </div>
                                            
                                            {/* Shard breakdown */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <ShardMetric icon={Server} value={formatNumber(shard.servers)} label="Servers" />
                                                <ShardMetric icon={Users} value={formatNumber(shard.users)} label="Users" />
                                                <ShardMetric icon={Headphones} value={formatNumber(shard.voice)} label="Voice" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Service Overview (Takes up 4 columns) */}
                            <div className="xl:col-span-4 space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Globe className={`w-5 h-5 ${primaryColorClass}`} />
                                    Service Overview
                                </h3>
                                <div 
                                    className="rounded-xl border backdrop-blur-md overflow-hidden"
                                    style={{ borderColor: modeStyle.border, backgroundColor: modeStyle.bgCard }}
                                >
                                    <div className="divide-y" style={{ borderColor: modeStyle.border }}>
                                        {statusData.services.map((service, idx) => (
                                            <div key={idx} className="p-5 flex items-center justify-between hover:bg-[var(--theme-bg-hover)] transition-colors">
                                                <div>
                                                    <h4 className="font-bold text-sm">{service.name}</h4>
                                                    <p className="text-xs opacity-60 mt-1">{service.description}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-xs font-semibold ${getStatusColor(service.status)}`}>
                                                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                                    {getStatusIcon(service.status, 'w-4 h-4')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-xs opacity-40 text-center tracking-wide mt-4">
                                    Status data refreshes automatically every 15 seconds. All times are in your local timezone.
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ icon: Icon, label, value, sub, theme }: any) => (
    <div className="rounded-xl border p-4 backdrop-blur-md" style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}>
        <div className="flex items-center gap-1.5 opacity-50 text-[10px] font-bold tracking-widest uppercase mb-3">
            <Icon className="w-3.5 h-3.5" /> {label}
        </div>
        <div className="text-2xl font-black mb-1">{value}</div>
        <div className="text-xs opacity-60 font-medium">{sub}</div>
    </div>
);

const ShardMetric = ({ icon: Icon, value, label }: any) => (
    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)]">
        <Icon className="w-3.5 h-3.5 opacity-50 mb-1" />
        <div className="font-bold text-sm">{value}</div>
        <div className="text-[10px] opacity-60">{label}</div>
    </div>
);

export default StatusPage;
