import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme Types
export type ThemeColor = 'violet' | 'blue' | 'indigo' | 'cyan' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'pink';
export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeLayoutRadius = 'sharp' | 'sm' | 'md' | 'lg';
export type ThemeAnimations = 'off' | 'slow' | 'normal' | 'fast';

// Color Configurations
export const themeColors: Record<ThemeColor, {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    glow: string;
    rgb: string;
}> = {
    violet: {
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        primaryLight: '#a78bfa',
        glow: 'shadow-violet-500/30',
        rgb: '139, 92, 246',
    },
    blue: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryLight: '#60a5fa',
        glow: 'shadow-blue-500/30',
        rgb: '59, 130, 246',
    },
    indigo: {
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        primaryLight: '#818cf8',
        glow: 'shadow-indigo-500/30',
        rgb: '99, 102, 241',
    },
    cyan: {
        primary: '#06b6d4',
        primaryHover: '#0891b2',
        primaryLight: '#22d3ee',
        glow: 'shadow-cyan-500/30',
        rgb: '6, 182, 212',
    },
    teal: {
        primary: '#14b8a6',
        primaryHover: '#0d9488',
        primaryLight: '#2dd4bf',
        glow: 'shadow-teal-500/30',
        rgb: '20, 184, 166',
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
    red: {
        primary: '#ef4444',
        primaryHover: '#dc2626',
        primaryLight: '#f87171',
        glow: 'shadow-red-500/30',
        rgb: '239, 68, 68',
    },
    pink: {
        primary: '#ec4899',
        primaryHover: '#db2777',
        primaryLight: '#f472b6',
        glow: 'shadow-pink-500/30',
        rgb: '236, 72, 153',
    },
};

// Mode Colors
export const modeColors: Record<'dark' | 'light', {
    bg: string;
    bgSecondary: string;
    bgCard: string;
    bgHover: string;
    text: string;
    textSecondary: string;
    border: string;
    borderLight: string;
}> = {
    dark: {
        bg: '#030712',
        bgSecondary: '#0a0f1e',
        bgCard: 'rgba(255, 255, 255, 0.02)',
        bgHover: 'rgba(255, 255, 255, 0.05)',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.5)',
        border: 'rgba(255, 255, 255, 0.05)',
        borderLight: 'rgba(255, 255, 255, 0.1)',
    },
    light: {
        bg: '#f8fafc',
        bgSecondary: '#ffffff',
        bgCard: 'rgba(0, 0, 0, 0.02)',
        bgHover: 'rgba(0, 0, 0, 0.05)',
        text: '#0f172a',
        textSecondary: 'rgba(15, 23, 42, 0.6)',
        border: 'rgba(0, 0, 0, 0.08)',
        borderLight: 'rgba(0, 0, 0, 0.12)',
    },
};

export const layoutRadii: Record<ThemeLayoutRadius, string> = {
    sharp: '0px',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
};

// Context Interface
interface ThemeContextType {
    color: ThemeColor;
    mode: ThemeMode;
    layoutRadius: ThemeLayoutRadius;
    animations: ThemeAnimations;
    compactMode: boolean;
    reduceMotion: boolean;

    setColor: (color: ThemeColor) => void;
    setMode: (mode: ThemeMode) => void;
    setLayoutRadius: (radius: ThemeLayoutRadius) => void;
    setAnimations: (animations: ThemeAnimations) => void;
    setCompactMode: (compact: boolean) => void;
    setReduceMotion: (reduce: boolean) => void;
    resetToDefaults: () => void;

    colors: typeof themeColors.violet;
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
        return (localStorage.getItem('theme_color') as ThemeColor) || 'violet';
    });

    const [mode, setModeState] = useState<ThemeMode>(() => {
        return (localStorage.getItem('theme_mode') as ThemeMode) || 'dark';
    });

    const [layoutRadius, setLayoutRadiusState] = useState<ThemeLayoutRadius>(() => {
        return (localStorage.getItem('theme_radius') as ThemeLayoutRadius) || 'md';
    });

    const [animations, setAnimationsState] = useState<ThemeAnimations>(() => {
        return (localStorage.getItem('theme_animations') as ThemeAnimations) || 'normal';
    });

    const [compactMode, setCompactModeState] = useState<boolean>(() => {
        return localStorage.getItem('theme_compact') === 'true';
    });

    const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
        return localStorage.getItem('theme_reduce_motion') === 'true';
    });

    // Actual active mode resolved for 'system'
    const [resolvedMode, setResolvedMode] = useState<'dark' | 'light'>('dark');

    const setColor = (newColor: ThemeColor) => {
        setColorState(newColor);
        localStorage.setItem('theme_color', newColor);
    };

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem('theme_mode', newMode);
    };

    const setLayoutRadius = (radius: ThemeLayoutRadius) => {
        setLayoutRadiusState(radius);
        localStorage.setItem('theme_radius', radius);
    };

    const setAnimations = (anim: ThemeAnimations) => {
        setAnimationsState(anim);
        localStorage.setItem('theme_animations', anim);
    };

    const setCompactMode = (compact: boolean) => {
        setCompactModeState(compact);
        localStorage.setItem('theme_compact', String(compact));
    };

    const setReduceMotion = (reduce: boolean) => {
        setReduceMotionState(reduce);
        localStorage.setItem('theme_reduce_motion', String(reduce));
    };

    const resetToDefaults = () => {
        setColor('violet');
        setMode('dark');
        setLayoutRadius('md');
        setAnimations('normal');
        setCompactMode(false);
        setReduceMotion(false);
    };

    // Handle System Mode resolution
    useEffect(() => {
        if (mode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setResolvedMode(mediaQuery.matches ? 'dark' : 'light');

            const handler = (e: MediaQueryListEvent) => {
                setResolvedMode(e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            setResolvedMode(mode);
        }
    }, [mode]);

    // Apply mode class to document and set CSS variables
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolvedMode);

        const colorConfig = themeColors[color];
        const modeConfig = modeColors[resolvedMode];

        document.documentElement.style.setProperty('--theme-primary', colorConfig.primary);
        document.documentElement.style.setProperty('--theme-primary-hover', colorConfig.primaryHover);
        document.documentElement.style.setProperty('--theme-primary-light', colorConfig.primaryLight);
        document.documentElement.style.setProperty('--theme-primary-rgb', colorConfig.rgb);
        document.documentElement.style.setProperty('--theme-bg', modeConfig.bg);
        document.documentElement.style.setProperty('--theme-bg-secondary', modeConfig.bgSecondary);
        document.documentElement.style.setProperty('--theme-bg-hover', modeConfig.bgHover);
        document.documentElement.style.setProperty('--theme-text', modeConfig.text);
        document.documentElement.style.setProperty('--theme-text-secondary', modeConfig.textSecondary);
        document.documentElement.style.setProperty('--theme-border', modeConfig.border);
        document.documentElement.style.setProperty('--theme-border-light', modeConfig.borderLight);
        document.documentElement.style.setProperty('--theme-radius', layoutRadii[layoutRadius]);
        document.documentElement.style.setProperty('--theme-radius', layoutRadii[layoutRadius]);
        
        // Data attributes for comprehensive usage
        document.documentElement.setAttribute('data-radius', layoutRadius);
        document.documentElement.setAttribute('data-animations', animations);
        document.documentElement.setAttribute('data-compact', String(compactMode));
        document.documentElement.setAttribute('data-reduce-motion', String(reduceMotion));

    }, [color, resolvedMode, layoutRadius, animations, compactMode, reduceMotion]);

    // Generate Tailwind classes
    const getColorClasses = () => {
        const colorMap: Record<ThemeColor, { solidBg: string; glow: string; primary: string; }> = {
            violet: { solidBg: 'bg-violet-600', glow: 'shadow-violet-500/30', primary: 'text-violet-500' },
            blue: { solidBg: 'bg-blue-600', glow: 'shadow-blue-500/30', primary: 'text-blue-500' },
            indigo: { solidBg: 'bg-indigo-600', glow: 'shadow-indigo-500/30', primary: 'text-indigo-500' },
            cyan: { solidBg: 'bg-cyan-600', glow: 'shadow-cyan-500/30', primary: 'text-cyan-500' },
            teal: { solidBg: 'bg-teal-600', glow: 'shadow-teal-500/30', primary: 'text-teal-500' },
            green: { solidBg: 'bg-green-600', glow: 'shadow-green-500/30', primary: 'text-green-500' },
            yellow: { solidBg: 'bg-yellow-500', glow: 'shadow-yellow-500/30', primary: 'text-yellow-500' },
            orange: { solidBg: 'bg-orange-500', glow: 'shadow-orange-500/30', primary: 'text-orange-500' },
            red: { solidBg: 'bg-red-600', glow: 'shadow-red-500/30', primary: 'text-red-500' },
            pink: { solidBg: 'bg-pink-600', glow: 'shadow-pink-500/30', primary: 'text-pink-500' },
        };
        return colorMap[color];
    };

    const value: ThemeContextType = {
        color,
        mode,
        layoutRadius,
        animations,
        compactMode,
        reduceMotion,
        setColor,
        setMode,
        setLayoutRadius,
        setAnimations,
        setCompactMode,
        setReduceMotion,
        resetToDefaults,
        colors: themeColors[color],
        modeStyle: modeColors[resolvedMode],
        solidBgClass: getColorClasses().solidBg,
        glowClass: getColorClasses().glow,
        primaryColorClass: getColorClasses().primary,
        bgClass: resolvedMode === 'dark' ? 'bg-[#030712]' : 'bg-slate-50',
        textClass: resolvedMode === 'dark' ? 'text-white' : 'text-slate-900',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
