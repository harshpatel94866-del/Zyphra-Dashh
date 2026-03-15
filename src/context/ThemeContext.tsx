import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme Types
export type ThemeColor = 'blue' | 'red' | 'green' | 'yellow' | 'orange';
export type ThemeMode = 'dark' | 'light';

// Color Configurations
export const themeColors: Record<ThemeColor, {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    glow: string;
    rgb: string;
}> = {
    blue: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryLight: '#60a5fa',
        glow: 'shadow-blue-500/30',
        rgb: '59, 130, 246',
    },
    red: {
        primary: '#ef4444',
        primaryHover: '#dc2626',
        primaryLight: '#f87171',
        glow: 'shadow-red-500/30',
        rgb: '239, 68, 68',
    },
    green: {
        primary: '#22c55e',
        primaryHover: '#16a34a',
        primaryLight: '#4ade80',
        glow: 'shadow-green-500/30',
        rgb: '34, 197, 94',
    },
    yellow: {
        primary: '#eab308',
        primaryHover: '#ca8a04',
        primaryLight: '#facc15',
        glow: 'shadow-yellow-500/30',
        rgb: '234, 179, 8',
    },
    orange: {
        primary: '#f97316',
        primaryHover: '#ea580c',
        primaryLight: '#fb923c',
        glow: 'shadow-orange-500/30',
        rgb: '249, 115, 22',
    },
};

// Mode Colors
export const modeColors: Record<ThemeMode, {
    bg: string;
    bgSecondary: string;
    bgCard: string;
    text: string;
    textSecondary: string;
    border: string;
}> = {
    dark: {
        bg: '#030712',
        bgSecondary: '#0a0f1e',
        bgCard: 'rgba(255, 255, 255, 0.02)',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.5)',
        border: 'rgba(255, 255, 255, 0.05)',
    },
    light: {
        bg: '#f8fafc',
        bgSecondary: '#ffffff',
        bgCard: 'rgba(0, 0, 0, 0.02)',
        text: '#0f172a',
        textSecondary: 'rgba(15, 23, 42, 0.6)',
        border: 'rgba(0, 0, 0, 0.08)',
    },
};

// Context Interface
interface ThemeContextType {
    color: ThemeColor;
    mode: ThemeMode;
    setColor: (color: ThemeColor) => void;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
    colors: typeof themeColors.blue;
    modeStyle: typeof modeColors.dark;
    // Tailwind class helpers
    solidBgClass: string;
    glowClass: string;
    primaryColorClass: string;
    bgClass: string;
    textClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider Component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [color, setColorState] = useState<ThemeColor>(() => {
        const saved = localStorage.getItem('theme_color');
        return (saved as ThemeColor) || 'blue';
    });

    const [mode, setModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme_mode');
        return (saved as ThemeMode) || 'dark';
    });

    // Persist to localStorage
    const setColor = (newColor: ThemeColor) => {
        setColorState(newColor);
        localStorage.setItem('theme_color', newColor);
    };

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem('theme_mode', newMode);
    };

    const toggleMode = () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    };

    // Apply mode class to document
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(mode);

        // Set CSS variables
        const colorConfig = themeColors[color];
        const modeConfig = modeColors[mode];

        document.documentElement.style.setProperty('--theme-primary', colorConfig.primary);
        document.documentElement.style.setProperty('--theme-primary-hover', colorConfig.primaryHover);
        document.documentElement.style.setProperty('--theme-primary-light', colorConfig.primaryLight);
        document.documentElement.style.setProperty('--theme-primary-rgb', colorConfig.rgb);
        document.documentElement.style.setProperty('--theme-bg', modeConfig.bg);
        document.documentElement.style.setProperty('--theme-bg-secondary', modeConfig.bgSecondary);
        document.documentElement.style.setProperty('--theme-text', modeConfig.text);
        document.documentElement.style.setProperty('--theme-text-secondary', modeConfig.textSecondary);
    }, [color, mode]);

    // Generate Tailwind classes based on current theme
    const getColorClasses = () => {
        const colorMap: Record<ThemeColor, { solidBg: string; glow: string; primary: string; }> = {
            blue: { solidBg: 'bg-blue-600', glow: 'shadow-blue-500/30', primary: 'text-blue-500' },
            red: { solidBg: 'bg-red-600', glow: 'shadow-red-500/30', primary: 'text-red-500' },
            green: { solidBg: 'bg-green-600', glow: 'shadow-green-500/30', primary: 'text-green-500' },
            yellow: { solidBg: 'bg-yellow-500', glow: 'shadow-yellow-500/30', primary: 'text-yellow-500' },
            orange: { solidBg: 'bg-orange-500', glow: 'shadow-orange-500/30', primary: 'text-orange-500' },
        };
        return colorMap[color];
    };

    const value: ThemeContextType = {
        color,
        mode,
        setColor,
        setMode,
        toggleMode,
        colors: themeColors[color],
        modeStyle: modeColors[mode],
        solidBgClass: getColorClasses().solidBg,
        glowClass: getColorClasses().glow,
        primaryColorClass: getColorClasses().primary,
        bgClass: mode === 'dark' ? 'bg-[#030712]' : 'bg-slate-50',
        textClass: mode === 'dark' ? 'text-white' : 'text-slate-900',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
