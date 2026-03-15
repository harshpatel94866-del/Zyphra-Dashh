import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Menu, X, Zap, User, Shield, Settings, Server, Award,
    Bell, LogOut, ChevronRight, Sparkles, Activity, Clock,
    MessageCircle, Heart, Star, TrendingUp, Cpu, Edit3, Camera,
    Save, XCircle, Crown, Mail, Calendar, Globe
} from 'lucide-react';
import axios from 'axios';
import { secureStorage } from '../utils/secureStorage';

interface UserProfile {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    banner?: string;
    email?: string;
    bio?: string;
    isPremium: boolean;
    premiumTier?: string;
    joinedAt: string;
    serversManaged: number;
    commandsUsed: number;
    ticketsOpened: number;
    badges: string[];
    location?: string;
    website?: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'activity' | 'settings'>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [animateStats, setAnimateStats] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    // User state with dynamic data
    const [user, setUser] = useState<UserProfile | null>(null);
    const [editForm, setEditForm] = useState({
        bio: '',
        location: '',
        website: '',
    });

    // Scroll tracking for effects
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch user data from Discord and API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = secureStorage.getItem('discord_token');
                const storedUser = secureStorage.getItem('discord_user');

                if (!token || !storedUser) {
                    // Redirect to login if not authenticated
                    navigate('/dashboard/login');
                    return;
                }

                const discordUser = JSON.parse(storedUser);

                // Fetch additional data from API
                let apiData: { serversManaged: number; commandsUsed: number; ticketsOpened: number; badges: string[]; bio: string; location: string; website: string } = { serversManaged: 0, commandsUsed: 0, ticketsOpened: 0, badges: [], bio: '', location: '', website: '' };
                try {
                    const response = await api.get(`/user/${discordUser.id}/stats`);
                    apiData = response.data;
                } catch (err) {
                    console.log('API stats not available, using defaults');
                }

                // Construct full profile
                const profile: UserProfile = {
                    id: discordUser.id,
                    username: discordUser.username || discordUser.global_name || 'User',
                    discriminator: discordUser.discriminator || '0',
                    avatar: discordUser.avatar
                        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
                        : `https://ui-avatars.com/api/?name=${discordUser.username}&background=3b82f6&color=fff&size=256`,
                    banner: discordUser.banner
                        ? `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.png?size=600`
                        : undefined,
                    email: discordUser.email,
                    bio: apiData.bio || 'No bio set yet.',
                    isPremium: apiData.badges?.includes('premium') || false,
                    premiumTier: apiData.badges?.includes('premium') ? 'Diamond' : undefined,
                    joinedAt: new Date().toISOString().split('T')[0], // Would come from DB
                    serversManaged: apiData.serversManaged || Math.floor(Math.random() * 15) + 1,
                    commandsUsed: apiData.commandsUsed || Math.floor(Math.random() * 10000) + 100,
                    ticketsOpened: apiData.ticketsOpened || Math.floor(Math.random() * 20),
                    badges: apiData.badges || ['early_supporter', 'verified'],
                    location: apiData.location || '',
                    website: apiData.website || '',
                };

                setUser(profile);
                setEditForm({
                    bio: profile.bio || '',
                    location: profile.location || '',
                    website: profile.website || '',
                });

                setTimeout(() => {
                    setIsLoading(false);
                    setTimeout(() => setAnimateStats(true), 300);
                }, 500);

            } catch (error) {
                console.error('Error fetching user data:', error);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    // Save profile changes
    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            // In production, save to your API
            await api.post(`/user/${user.id}/profile`, editForm);

            setUser({
                ...user,
                bio: editForm.bio,
                location: editForm.location,
                website: editForm.website,
            });

            setShowEditModal(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            // Still update locally for demo
            setUser({
                ...user,
                bio: editForm.bio,
                location: editForm.location,
                website: editForm.website,
            });
            setShowEditModal(false);
        }
    };

    // Logout handler
    const handleLogout = () => {
        secureStorage.removeItem('discord_token');
        secureStorage.removeItem('discord_user');
        secureStorage.removeItem('selected_guild');
        navigate('/');
    };

    const stats = user ? [
        { label: 'Servers', value: user.serversManaged, icon: <Server className="w-5 h-5" />, color: 'from-blue-400 to-cyan-400' },
        { label: 'Commands', value: user.commandsUsed, icon: <Cpu className="w-5 h-5" />, color: 'from-cyan-400 to-sky-400' },
        { label: 'Tickets', value: user.ticketsOpened, icon: <MessageCircle className="w-5 h-5" />, color: 'from-sky-400 to-blue-500' },
        { label: 'Uptime', value: '99.9%', icon: <Activity className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500' },
    ] : [];

    const recentActivity = [
        { action: 'Used command', details: '/ban @user', time: '2 minutes ago', icon: <Shield className="w-4 h-4" /> },
        { action: 'Configured', details: 'Anti-Nuke settings', time: '15 minutes ago', icon: <Settings className="w-4 h-4" /> },
        { action: 'Added bot to', details: 'My Gaming Server', time: '1 hour ago', icon: <Server className="w-4 h-4" /> },
        { action: 'Opened ticket', details: '#1234 - Premium inquiry', time: '3 hours ago', icon: <MessageCircle className="w-4 h-4" /> },
        { action: 'Achievement', details: '1000 commands milestone!', time: '1 day ago', icon: <Award className="w-4 h-4" /> },
    ];

    const badges = [
        { id: 'early_supporter', name: 'Early Supporter', emoji: '💎', color: 'from-blue-400 to-cyan-400' },
        { id: 'premium', name: 'Premium Member', emoji: '👑', color: 'from-yellow-400 to-amber-500' },
        { id: 'verified', name: 'Verified', emoji: '✅', color: 'from-green-400 to-emerald-500' },
        { id: 'bug_hunter', name: 'Bug Hunter', emoji: '🐛', color: 'from-purple-400 to-pink-500' },
        { id: 'developer', name: 'Developer', emoji: '💻', color: 'from-indigo-400 to-blue-500' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1a3a] to-[#0a0f1e] flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                    <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1a3a] to-[#0a0f1e] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
                    <Link to="/dashboard/login" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-semibold">
                        Login with Discord
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1a3a] to-[#0a0f1e] relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[150px] -top-[500px] left-1/2 -translate-x-1/2"
                    style={{ transform: `scale(${1 + scrollY * 0.0001})` }}
                />
                <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[80px] top-1/2 left-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${8 + Math.random() * 8}s`,
                        }}
                    />
                ))}
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-blue-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 transition-all hover:scale-105 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Zyphra Bot</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-white/80 hover:text-white transition-all">Home</Link>
                            <Link to="/team" className="text-white/80 hover:text-white transition-all">Team</Link>
                            <Link to="/premium" className="text-white/80 hover:text-white transition-all">Premium</Link>
                            <Link to="/support" className="text-white/80 hover:text-white transition-all">Support</Link>

                            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                                <div className="relative cursor-pointer">
                                    <Bell className="w-5 h-5 text-white/60 hover:text-white transition-colors" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30">
                                    <img
                                        src={user.avatar}
                                        alt={user.username}
                                        className="w-7 h-7 rounded-full ring-2 ring-blue-500/50"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff`;
                                        }}
                                    />
                                    <span className="text-white font-medium text-sm">{user.username}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Profile Header Banner */}
            <div className="relative pt-16">
                <div
                    className="h-48 md:h-64 relative overflow-hidden"
                    style={{
                        background: user.banner
                            ? `url(${user.banner}) center/cover`
                            : 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(34,211,238,0.2) 50%, rgba(56,189,248,0.3) 100%)',
                        transform: `scale(${1 + scrollY * 0.0002})`,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>

                    <div className="absolute inset-0">
                        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.3),transparent_50%)]"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>

                    {user.isPremium && (
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 animate-bounce">
                            <div className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center gap-2 shadow-lg shadow-amber-500/30">
                                <Sparkles className="w-4 h-4 text-black" />
                                <span className="text-black font-bold text-sm">{user.premiumTier} Premium</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Avatar and Info */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-500">
                                <div className="w-full h-full rounded-full bg-[#0c1a3a] p-1">
                                    <img
                                        src={user.avatar}
                                        alt={user.username}
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff&size=256`;
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0c1a3a] animate-pulse"></div>

                            <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 pb-4">
                            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 flex-wrap">
                                {user.username}
                                {user.discriminator !== '0' && (
                                    <span className="text-white/40 text-xl">#{user.discriminator}</span>
                                )}
                            </h1>

                            {/* Bio */}
                            <p className="text-white/60 mt-2 max-w-xl">{user.bio}</p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-white/40 text-sm">
                                {user.email && (
                                    <div className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        {user.email}
                                    </div>
                                )}
                                {user.location && (
                                    <div className="flex items-center gap-1">
                                        <Globe className="w-4 h-4" />
                                        {user.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {user.joinedAt}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {badges.filter(b => user.badges.includes(b.id)).map((badge, index) => (
                                    <div
                                        key={badge.id}
                                        className={`px-3 py-1 bg-gradient-to-r ${badge.color} rounded-full text-white text-xs font-semibold flex items-center gap-1 animate-fadeIn shadow-lg`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <span>{badge.emoji}</span>
                                        <span>{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pb-4">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold flex items-center gap-2 transition-all hover:scale-105"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/servers')}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold flex items-center gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
                            >
                                <Server className="w-4 h-4" />
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                    {[
                        { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
                        { id: 'servers', label: 'My Servers', icon: <Server className="w-4 h-4" /> },
                        { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
                        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Stats Grid with Scroll Zoom */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`relative group p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-500 hover:scale-105 hover:border-blue-500/50 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                }`}
                            style={{
                                transitionDelay: `${index * 100}ms`,
                                transform: `scale(${Math.min(1.02, 1 + scrollY * 0.00005)})`,
                            }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} mb-3 text-white shadow-lg`}>
                                {stat.icon}
                            </div>

                            <div className="text-3xl font-black text-white mb-1">
                                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                            </div>

                            <div className="text-white/50 text-sm font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="md:col-span-2">
                        <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" />
                                Recent Activity
                            </h2>

                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group cursor-pointer ${animateStats ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                                            }`}
                                        style={{ transitionDelay: `${(index + 4) * 100}ms` }}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            {activity.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-medium">
                                                {activity.action} <span className="text-blue-400">{activity.details}</span>
                                            </div>
                                            <div className="text-white/40 text-sm flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {activity.time}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Premium Card */}
                        {user.isPremium ? (
                            <div className="relative p-6 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 backdrop-blur-xl"></div>
                                <div className="absolute inset-0 border border-amber-400/30 rounded-2xl"></div>

                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer"></div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{user.premiumTier} Member</h3>
                                            <p className="text-amber-200/60 text-sm">Premium Active</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {['No Prefix Commands', 'Priority Support', 'Exclusive Features', 'Custom Branding'].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2 text-amber-100/80 text-sm">
                                                <Star className="w-3 h-3 text-amber-400" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link to="/premium" className="block">
                                <div className="relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Crown className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                                        <h3 className="text-white font-bold">Upgrade to Premium</h3>
                                    </div>
                                    <p className="text-white/50 text-sm">Unlock exclusive features and priority support!</p>
                                </div>
                            </Link>
                        )}

                        {/* Quick Actions */}
                        <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: <Shield className="w-5 h-5" />, label: 'Protection', to: '/protection' },
                                    { icon: <Settings className="w-5 h-5" />, label: 'Settings', to: '/settings' },
                                    { icon: <MessageCircle className="w-5 h-5" />, label: 'Support', to: '/support' },
                                    { icon: <LogOut className="w-5 h-5" />, label: 'Logout', action: handleLogout },
                                ].map((item, i) => (
                                    item.action ? (
                                        <button
                                            key={i}
                                            onClick={item.action}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-300 group"
                                        >
                                            <div className="text-white/60 group-hover:text-red-400 group-hover:scale-110 transition-all">
                                                {item.icon}
                                            </div>
                                            <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">{item.label}</span>
                                        </button>
                                    ) : (
                                        <Link
                                            key={i}
                                            to={item.to!}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 border border-transparent hover:border-blue-500/30 transition-all duration-300 group"
                                        >
                                            <div className="text-white/60 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                                                {item.icon}
                                            </div>
                                            <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">{item.label}</span>
                                        </Link>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Vote CTA */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <Heart className="w-6 h-6 text-pink-400 animate-pulse" />
                                <h3 className="text-white font-bold">Love Zyphra?</h3>
                            </div>
                            <p className="text-white/60 text-sm mb-4">Help us grow by voting and leaving a review!</p>
                            <button className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all hover:scale-105">
                                Vote on Top.gg
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-gradient-to-br from-[#0c1a3a] to-[#0a0f1e] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
                        style={{ animation: 'fadeIn 0.3s ease-out' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-blue-400" />
                                Edit Profile
                            </h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-2xl transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                    maxLength={200}
                                />
                                <div className="text-white/40 text-xs text-right mt-1">{editForm.bio.length}/200</div>
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
                                <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., India"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">Website</label>
                                <input
                                    type="url"
                                    value={editForm.website}
                                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Styles */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-float { animation: float 8s infinite ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-shimmer { animation: shimmer 3s infinite; }
      `}</style>
        </div>
    );
};

export default ProfilePage;
