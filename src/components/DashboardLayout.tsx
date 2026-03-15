import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import DashboardSidebar from './DashboardSidebar';
import ZyphraLoader from './ZyphraLoader';
import { Menu, X } from 'lucide-react';
import { secureStorage } from '../utils/secureStorage';
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

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const { bgClass } = useTheme();
    const [guild, setGuild] = useState<Guild | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const guildStr = secureStorage.getItem('selected_guild');
        if (!guildStr) {
            navigate('/dashboard/servers');
            return;
        }

        try {
            setGuild(JSON.parse(guildStr));
        } catch {
            navigate('/dashboard/servers');
            return;
        }

        const userStr = secureStorage.getItem('discord_user') || secureStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch { }
        }

        setLoading(false);
    }, [navigate]);

    if (loading || !guild) {
        return (
            <ZyphraLoader text="Loading Dashboard" subText="Preparing your experience..." variant="premium" />
        );
    }

    return (
        <div className={`min-h-screen ${bgClass} text-[var(--theme-text)]`}>
            {/* Animated background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-theme-primary/5 rounded-full blur-3xl"
                    animate={{ opacity: [0.03, 0.06, 0.03] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ willChange: 'opacity' }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-theme-primary/5 rounded-full blur-3xl"
                    animate={{ opacity: [0.04, 0.07, 0.04] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ willChange: 'opacity' }}
                />
            </div>

            {/* Mobile menu button */}
            <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] bg-theme-bg-secondary/90 backdrop-blur-sm p-2 rounded-lg border border-[var(--theme-text)]/10 transition-colors hover:border-[var(--theme-text)]/20"
                whileTap={{ scale: 0.9 }}
            >
                <AnimatePresence mode="wait">
                    {sidebarOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Menu className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Sidebar */}
            <DashboardSidebar
                guild={guild}
                user={user}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content area with entrance animation */}
            <main className="lg:ml-[220px] min-h-screen relative">
                <motion.div
                    className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default DashboardLayout;
