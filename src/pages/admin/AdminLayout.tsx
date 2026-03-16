import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { secureStorage } from '../../utils/secureStorage';
import { useTheme } from '../../context/ThemeContext';
import { Shield, LayoutDashboard, Server, Star, ArrowLeft, ShieldBan, Users, Settings } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bgClass, primaryColorClass } = useTheme();
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const userStr = secureStorage.getItem('discord_user') || secureStorage.getItem('user');
        if (!userStr) {
            navigate('/dashboard/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (!user.is_owner && user.id !== '1070619070468214824') {
                navigate('/dashboard/servers');
            } else {
                setIsOwner(true);
            }
        } catch {
            navigate('/dashboard/servers');
        }
    }, [navigate]);

    if (!isOwner) return null;

    const navItems = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/guilds', label: 'Guilds', icon: Server },
        { path: '/admin/premium', label: 'Premium & NP', icon: Star },
        { path: '/admin/blacklist', label: 'Blacklist', icon: ShieldBan },
        { path: '/admin/users', label: 'User Lookup', icon: Users },
        { path: '/admin/bot-settings', label: 'Bot Settings', icon: Settings },
    ];

    return (
        <div className={`min-h-screen ${bgClass} text-white`}>
            {/* Top Navigation Bar */}
            <div className="bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate('/dashboard/servers')}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <Shield className={`w-6 h-6 ${primaryColorClass}`} />
                                <span className="font-bold text-lg tracking-wide uppercase">Zyphra Admin</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            active ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
