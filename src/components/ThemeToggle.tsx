import React, { useState, useEffect } from 'react';
import { useTheme, ThemeColor, ThemeMode, ThemeLayoutRadius, ThemeAnimations } from '../context/ThemeContext';
import { Settings, Sun, Moon, X, Monitor, Palette, Check, LayoutGrid, Zap, Eye, RefreshCw, Laptop } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [deviceType, setDeviceType] = useState('Desktop');

    const { 
        color, mode, layoutRadius, animations, compactMode, reduceMotion,
        setColor, setMode, setLayoutRadius, setAnimations, setCompactMode, setReduceMotion, resetToDefaults,
        colors 
    } = useTheme();

    useEffect(() => {
        // Simple device detection for the UI
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setDeviceType(isMobile ? 'Mobile' : 'Desktop');
    }, []);

    const colorOptions: { id: ThemeColor; bg: string }[] = [
        { id: 'violet', bg: 'from-violet-500 to-violet-600' },
        { id: 'blue', bg: 'from-blue-500 to-blue-600' },
        { id: 'indigo', bg: 'from-indigo-500 to-indigo-600' },
        { id: 'cyan', bg: 'from-cyan-500 to-cyan-600' },
        { id: 'teal', bg: 'from-teal-500 to-teal-600' },
        { id: 'green', bg: 'from-green-500 to-green-600' },
        { id: 'yellow', bg: 'from-yellow-400 to-yellow-500' },
        { id: 'orange', bg: 'from-orange-500 to-orange-600' },
        { id: 'red', bg: 'from-red-500 to-red-600' },
        { id: 'pink', bg: 'from-pink-500 to-pink-600' },
    ];

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => {
        // We use the dynamic primary color when checked!
        return (
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`w-10 h-5 rounded-full transition-colors relative shadow-inner flex items-center shrink-0
                    ${checked ? '' : mode === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-300'}
                `}
                style={{ backgroundColor: checked ? colors.primary : undefined }}
            >
                <div 
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all transform 
                        ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
                    `} 
                />
            </button>
        );
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${isOpen
                    ? 'bg-white/10 backdrop-blur-xl rotate-180'
                    : `bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg`
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Settings className="w-6 h-6 text-white animate-pulse" />
                )}
            </button>

            {/* Settings Panel */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[340px] transition-all duration-300 origin-bottom-right ${isOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                <div className={`rounded-xl border shadow-2xl overflow-hidden ${mode === 'dark' || mode === 'system'
                    ? 'bg-[#0b0b0b] border-[#1f1f1f] text-gray-300'
                    : 'bg-white border-gray-200 text-gray-600'
                    }`}>
                    
                    {/* Header line: Device Detection */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                        <span className="text-sm font-medium text-gray-400">Device Detected</span>
                        <div className="flex items-center gap-1.5" style={{ color: colors.primary }}>
                            <Laptop className="w-4 h-4" />
                            <span className="text-sm font-semibold">{deviceType}</span>
                        </div>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* 1. Theme Mode */}
                        <div className="p-4 border-b border-[#1f1f1f]">
                            <div className="flex items-center gap-2 mb-3">
                                <Monitor className="w-5 h-5 text-gray-200" />
                                <h3 className="font-bold text-gray-100 text-sm">Theme Mode</h3>
                            </div>
                            <div className="flex rounded-lg p-1 bg-[#151515] border border-[#222]">
                                {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${mode === m
                                            ? 'text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        style={{ backgroundColor: mode === m ? colors.primaryHover : 'transparent' }}
                                    >
                                        {m === 'light' && <Sun className="w-4 h-4" />}
                                        {m === 'dark' && <Moon className="w-4 h-4" />}
                                        {m === 'system' && <Monitor className="w-4 h-4" />}
                                        <span className="capitalize">{m}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Accent Color */}
                        <div className="p-4 border-b border-[#1f1f1f]">
                            <div className="flex items-center gap-2 mb-3">
                                <Palette className="w-5 h-5 text-gray-200" />
                                <h3 className="font-bold text-gray-100 text-sm">Accent Color</h3>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {colorOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setColor(option.id)}
                                        className={`relative w-full aspect-square rounded-xl transition-all duration-300 ${color === option.id
                                            ? 'scale-110 ring-2 ring-white/70 ring-offset-2 ring-offset-[#0b0b0b]'
                                            : 'hover:scale-105'
                                            } bg-gradient-to-br ${option.bg}`}
                                        title={option.id}
                                    >
                                        {color === option.id && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Layout Radius */}
                        <div className="p-4 border-b border-[#1f1f1f]">
                            <div className="flex items-center gap-2 mb-3">
                                <LayoutGrid className="w-5 h-5 text-gray-200" />
                                <h3 className="font-bold text-gray-100 text-sm">Layout</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-14">Radius</span>
                                <div className="flex-1 flex rounded-lg p-1 bg-[#151515] border border-[#222]">
                                    {(['sharp', 'sm', 'md', 'lg'] as ThemeLayoutRadius[]).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setLayoutRadius(r)}
                                            className={`flex-1 py-1 rounded-md text-xs font-medium transition-all capitalize ${layoutRadius === r
                                                ? 'text-white'
                                                : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                            style={{ backgroundColor: layoutRadius === r ? colors.primaryHover : 'transparent' }}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 4. Animations */}
                        <div className="p-4 border-b border-[#1f1f1f]">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-5 h-5 text-gray-200" />
                                <h3 className="font-bold text-gray-100 text-sm">Animations</h3>
                            </div>
                            <div className="flex rounded-lg p-1 bg-[#151515] border border-[#222]">
                                {(['off', 'slow', 'normal', 'fast'] as ThemeAnimations[]).map((a) => (
                                    <button
                                        key={a}
                                        onClick={() => setAnimations(a)}
                                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${animations === a
                                            ? 'text-white'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        style={{ backgroundColor: animations === a ? colors.primaryHover : 'transparent' }}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 5. Accessibility */}
                        <div className="p-4 border-b border-[#1f1f1f]">
                            <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-5 h-5 text-gray-200" />
                                <h3 className="font-bold text-gray-100 text-sm">Accessibility</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-[#151515] border border-[#222] rounded-lg p-3">
                                    <span className="text-sm font-medium text-gray-400">Compact Mode</span>
                                    <ToggleSwitch checked={compactMode} onChange={setCompactMode} />
                                </div>
                                <div className="flex items-center justify-between bg-[#151515] border border-[#222] rounded-lg p-3">
                                    <span className="text-sm font-medium text-gray-400">Reduce Motion</span>
                                    <ToggleSwitch checked={reduceMotion} onChange={setReduceMotion} />
                                </div>
                            </div>
                        </div>

                        {/* 6. Reset to Defaults */}
                        <div className="p-2">
                            <button
                                onClick={resetToDefaults}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default ThemeToggle;
