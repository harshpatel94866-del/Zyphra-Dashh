import React, { useState } from 'react';
import { useTheme, ThemeColor, ThemeMode } from '../context/ThemeContext';
import { Settings, Sun, Moon, X, Palette, Check } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { color, mode, setColor, setMode, colors } = useTheme();

    const colorOptions: { id: ThemeColor; name: string; class: string; bg: string }[] = [
        { id: 'blue', name: 'Blue', class: 'bg-blue-500', bg: 'from-blue-500 to-cyan-500' },
        { id: 'red', name: 'Red', class: 'bg-red-500', bg: 'from-red-500 to-rose-500' },
        { id: 'green', name: 'Green', class: 'bg-green-500', bg: 'from-green-500 to-emerald-500' },
        { id: 'yellow', name: 'Yellow', class: 'bg-yellow-500', bg: 'from-yellow-500 to-amber-500' },
        { id: 'orange', name: 'Orange', class: 'bg-orange-500', bg: 'from-orange-500 to-amber-500' },
    ];

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${isOpen
                    ? 'bg-white/10 backdrop-blur-xl rotate-180'
                    : `bg-gradient-to-br ${colorOptions.find(c => c.id === color)?.bg} shadow-lg`
                    }`}
                style={{ boxShadow: isOpen ? undefined : `0 8px 32px rgba(${colors.rgb}, 0.4)` }}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Settings className="w-6 h-6 text-white animate-pulse" />
                )}
            </button>

            {/* Settings Panel */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-72 transition-all duration-300 ${isOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <div className={`rounded-2xl border overflow-hidden backdrop-blur-xl shadow-2xl ${mode === 'dark'
                    ? 'bg-[#0a0f1e]/90 border-white/10'
                    : 'bg-white/90 border-gray-200'
                    }`}>
                    {/* Header */}
                    <div className={`px-5 py-4 border-b ${mode === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorOptions.find(c => c.id === color)?.bg} flex items-center justify-center`}
                            >
                                <Palette className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className={`font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Theme Settings
                                </h3>
                                <p className={`text-xs ${mode === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                                    Customize your experience
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className={`px-5 py-4 border-b ${mode === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                        <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${mode === 'dark' ? 'text-white/40' : 'text-gray-400'
                            }`}>
                            Mode
                        </p>
                        <div className={`flex rounded-xl p-1 ${mode === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                            <button
                                onClick={() => setMode('light')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'light'
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Sun className="w-4 h-4" />
                                Light
                            </button>
                            <button
                                onClick={() => setMode('dark')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'dark'
                                    ? 'bg-white/10 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Moon className="w-4 h-4" />
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* Color Options */}
                    <div className="px-5 py-4">
                        <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${mode === 'dark' ? 'text-white/40' : 'text-gray-400'
                            }`}>
                            Accent Color
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                            {colorOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setColor(option.id)}
                                    className={`relative w-full aspect-square rounded-xl transition-all duration-300 ${color === option.id
                                        ? 'scale-110 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent'
                                        : 'hover:scale-105'
                                        } bg-gradient-to-br ${option.bg}`}
                                    title={option.name}
                                >
                                    {color === option.id && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`px-5 py-3 ${mode === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className={`text-xs text-center ${mode === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
                            Settings saved automatically
                        </p>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default ThemeToggle;
