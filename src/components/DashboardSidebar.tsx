import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { secureStorage } from '../utils/secureStorage';
import {
    Shield, Zap, AlertTriangle, Gauge, Bot, Wrench, UserCog,
    MessageSquare, Palette, Users, MessageCircle, SmilePlus, Gift,
    LayoutDashboard, Settings, ScrollText, RefreshCw, LogOut, ChevronDown,
    Ticket
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Guild {
    id: string;
    name: string;
    icon: string | null;
}

interface User {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
}

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: string;
    badgeColor?: string;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

interface DashboardSidebarProps {
    guild: Guild;
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ guild, user, isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { primaryColorClass, bgClass, colors } = useTheme();
    const [profileOpen, setProfileOpen] = useState(false);

    const sections: SidebarSection[] = [
        {
            title: 'GENERAL',
            items: [
                { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
                { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/dashboard/settings' },
            ]
        },
        {
            title: 'SECURITY',
            items: [
                { id: 'antinuke', label: 'Antinuke', icon: <Shield className="w-4 h-4" />, path: '/dashboard/antinuke' },
                { id: 'emergency', label: 'Emergency Mode', icon: <AlertTriangle className="w-4 h-4" />, path: '/dashboard/emergency' },
                { id: 'limit-system', label: 'Limit System', icon: <Gauge className="w-4 h-4" />, path: '/dashboard/limit-system', badge: '●', badgeColor: '#22c55e' },
            ]
        },
        {
            title: 'MODERATION',
            items: [
                { id: 'automod', label: 'Automod', icon: <Bot className="w-4 h-4" />, path: '/dashboard/automod' },
                { id: 'mod-setup', label: 'Mod Setup', icon: <Wrench className="w-4 h-4" />, path: '/dashboard/mod-setup' },
                { id: 'admin-setup', label: 'Admin Setup', icon: <UserCog className="w-4 h-4" />, path: '/dashboard/admin-setup' },
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { id: 'welcomer', label: 'Welcomer', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/welcomer' },
                { id: 'custom-role', label: 'Custom Role', icon: <Palette className="w-4 h-4" />, path: '/dashboard/custom-role' },
                { id: 'autorole', label: 'Autorole', icon: <Users className="w-4 h-4" />, path: '/dashboard/autorole', badge: '●', badgeColor: '#22c55e' },
                { id: 'auto-responders', label: 'Auto Responders', icon: <MessageCircle className="w-4 h-4" />, path: '/dashboard/auto-responders' },
                { id: 'auto-react', label: 'Auto React', icon: <SmilePlus className="w-4 h-4" />, path: '/dashboard/auto-react' },
                { id: 'giveaway', label: 'Giveaway', icon: <Gift className="w-4 h-4" />, path: '/dashboard/giveaway' },
                { id: 'tickets', label: 'Tickets', icon: <Ticket className="w-4 h-4" />, path: '/dashboard/tickets' },
                { id: 'logging', label: 'Logging', icon: <ScrollText className="w-4 h-4" />, path: '/dashboard/logging' },
            ]
        },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    const getGuildIcon = () => {
        if (guild.icon) {
            return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
        }
        return null;
    };

    const getAvatarUrl = (u: User) => {
        if (u.avatar) {
            return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=64`;
        }
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(u.discriminator) % 5}.png`;
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    // Flatten all paths for layoutId matching
    const allPaths = ['/dashboard/audit-logs', ...sections.flatMap(s => s.items.map(i => i.path))];

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-full w-[220px] z-50
                bg-theme-bg-secondary/98 backdrop-blur-xl border-r border-[var(--theme-text)]/[0.06]
                flex flex-col
                transform transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Header — Bot branding + Server */}
                <div className="p-4 border-b border-[var(--theme-text)]/[0.06]">
                    <motion.div
                        className="flex items-center gap-2 mb-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <span className={`text-[11px] font-bold tracking-[0.12em] ${primaryColorClass} uppercase`}>Zyphra</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-2.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        {getGuildIcon() ? (
                            <img src={getGuildIcon()!} alt={guild.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center text-xs font-bold text-theme-primary flex-shrink-0">
                                {guild.name.charAt(0)}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--theme-text)] truncate">{guild.name}</p>
                        </div>
                    </motion.div>
                    <motion.button
                        onClick={() => {/* TODO: refresh */ }}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-500/90 hover:bg-emerald-500
                            text-[var(--theme-text)] text-xs font-semibold py-1.5 rounded-md transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <RefreshCw className="w-3 h-3" />
                        Refresh Server
                    </motion.button>
                </div>

                {/* Audit Logs link */}
                <div className="px-3 pt-3 pb-1">
                    <button
                        onClick={() => handleNavigate('/dashboard/audit-logs')}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors relative
                            ${isActive('/dashboard/audit-logs')
                                ? 'text-[var(--theme-text)] font-medium'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-[var(--theme-text)]/[0.04]'
                            }`}
                    >
                        {isActive('/dashboard/audit-logs') && (
                            <motion.div
                                className="absolute inset-0 rounded-md shadow-lg"
                                style={{ backgroundColor: colors.primary, boxShadow: `0 10px 15px -3px ${colors.primary}33` }}
                                layoutId="activeIndicator"
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                        )}
                        <span className={`relative z-10 ${isActive('/dashboard/audit-logs') ? 'text-[var(--theme-text)]' : 'text-gray-500'}`}>
                            <ScrollText className="w-4 h-4" />
                        </span>
                        <span className="relative z-10">Audit Logs</span>
                    </button>
                </div>

                {/* Scrollable sections with staggered items */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin scrollbar-thumb-[var(--theme-text)]/10">
                    {sections.map((section, sectionIdx) => (
                        <div key={section.title} className="mt-4">
                            <motion.div
                                className="text-[10px] font-bold tracking-[0.14em] text-gray-500 uppercase mb-1.5 px-2.5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 + sectionIdx * 0.05 }}
                            >
                                {section.title}
                            </motion.div>
                            <div className="space-y-0.5">
                                {section.items.map((item, itemIdx) => {
                                    const active = isActive(item.path);
                                    return (
                                        <motion.button
                                            key={item.id}
                                            onClick={() => handleNavigate(item.path)}
                                            className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-colors duration-150 relative
                                                ${active
                                                    ? 'text-[var(--theme-text)] font-medium'
                                                    : 'text-gray-400 hover:text-gray-200 hover:bg-[var(--theme-text)]/[0.04]'
                                                }`}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 + sectionIdx * 0.06 + itemIdx * 0.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            {/* Animated active indicator with layoutId */}
                                            {active && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-md shadow-lg"
                                                    style={{ backgroundColor: colors.primary, boxShadow: `0 10px 15px -3px ${colors.primary}33` }}
                                                    layoutId="activeIndicator"
                                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                            <span className={`relative z-10 ${active ? 'text-[var(--theme-text)]' : 'text-gray-500'}`}>{item.icon}</span>
                                            <span className="relative z-10 flex-1 text-left">{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className="relative z-10 text-[8px] leading-none"
                                                    style={{ color: item.badgeColor }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User profile footer */}
                <div className="p-3 border-t border-[var(--theme-text)]/[0.06]">
                    <div className="relative">
                        <motion.button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--theme-text)]/[0.04] transition-colors"
                            whileTap={{ scale: 0.97 }}
                        >
                            {user ? (
                                <>
                                    <img src={getAvatarUrl(user)} alt={user.username} className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-[var(--theme-text)] truncate">{user.username}</p>
                                        <p className="text-[10px] text-gray-500">Online</p>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: profileOpen ? 180 : 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    >
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 animate-pulse" />
                                    <div className="flex-1 text-left">
                                        <p className="text-sm text-gray-400">Loading...</p>
                                    </div>
                                </>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {profileOpen && (
                                <motion.div
                                    className="absolute bottom-full left-0 right-0 mb-1 bg-[#151b30] rounded-lg border border-[var(--theme-text)]/[0.08] shadow-2xl overflow-hidden"
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <motion.button
                                        onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                                        className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-[var(--theme-text)]/[0.06] transition text-left text-sm text-gray-300"
                                        whileHover={{ x: 3 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Users className={`w-4 h-4 ${primaryColorClass}`} />
                                        View Profile
                                    </motion.button>
                                    <motion.button
                                        onClick={() => {
                                            secureStorage.removeItem('selected_guild');
                                            navigate('/dashboard/servers');
                                        }}
                                        className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-[var(--theme-text)]/[0.06] transition text-left text-sm text-gray-300"
                                        whileHover={{ x: 3 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <RefreshCw className="w-4 h-4 text-yellow-400" />
                                        Change Server
                                    </motion.button>
                                    <div className="h-px bg-[var(--theme-text)]/[0.06]" />
                                    <motion.button
                                        onClick={() => {
                                            secureStorage.removeItem('discord_token');
                                            secureStorage.removeItem('discord_user');
                                            secureStorage.removeItem('user');
                                            secureStorage.removeItem('selected_guild');
                                            navigate('/dashboard/login');
                                        }}
                                        className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-red-500/10 transition text-left text-sm text-red-400"
                                        whileHover={{ x: 3 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
