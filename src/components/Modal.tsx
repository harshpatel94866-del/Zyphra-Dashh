import React, { useEffect, useCallback } from 'react';
import { X, Check, AlertTriangle, Info, AlertCircle, Sparkles } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    variant?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'premium';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    variant = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    showCancel = false,
    children,
}) => {
    // Handle ESC key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const variantConfig = {
        info: {
            icon: <Info className="w-8 h-8" />,
            gradient: 'from-blue-500 to-cyan-500',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
            borderColor: 'border-blue-500/30',
            glowColor: 'rgba(59, 130, 246, 0.3)',
        },
        success: {
            icon: <Check className="w-8 h-8" />,
            gradient: 'from-green-500 to-emerald-500',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-400',
            borderColor: 'border-green-500/30',
            glowColor: 'rgba(34, 197, 94, 0.3)',
        },
        warning: {
            icon: <AlertTriangle className="w-8 h-8" />,
            gradient: 'from-yellow-500 to-amber-500',
            iconBg: 'bg-yellow-500/20',
            iconColor: 'text-yellow-400',
            borderColor: 'border-yellow-500/30',
            glowColor: 'rgba(234, 179, 8, 0.3)',
        },
        error: {
            icon: <AlertCircle className="w-8 h-8" />,
            gradient: 'from-red-500 to-rose-500',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            borderColor: 'border-red-500/30',
            glowColor: 'rgba(239, 68, 68, 0.3)',
        },
        confirm: {
            icon: <AlertTriangle className="w-8 h-8" />,
            gradient: 'from-blue-500 to-cyan-500',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
            borderColor: 'border-blue-500/30',
            glowColor: 'rgba(59, 130, 246, 0.3)',
        },
        premium: {
            icon: <Sparkles className="w-8 h-8" />,
            gradient: 'from-amber-400 via-yellow-500 to-orange-500',
            iconBg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
            iconColor: 'text-amber-400',
            borderColor: 'border-amber-500/30',
            glowColor: 'rgba(251, 191, 36, 0.4)',
        },
    };

    const config = variantConfig[variant];

    const handleConfirm = () => {
        onConfirm?.();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative max-w-md w-full pointer-events-auto animate-modalIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow Effect */}
                    <div
                        className="absolute -inset-1 rounded-3xl blur-xl opacity-60 animate-pulse"
                        style={{ background: config.glowColor }}
                    />

                    {/* Modal Content */}
                    <div className={`relative p-8 rounded-2xl bg-gradient-to-br from-[#0a0f1e]/95 to-[#0c1a3a]/95 backdrop-blur-xl border ${config.borderColor} shadow-2xl`}>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110 hover:rotate-90"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className={`w-20 h-20 rounded-2xl ${config.iconBg} flex items-center justify-center ${config.iconColor} animate-iconBounce`}>
                                {config.icon}
                            </div>
                        </div>

                        {/* Title */}
                        {title && (
                            <h2 className={`text-2xl font-bold text-center mb-3 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                                {title}
                            </h2>
                        )}

                        {/* Message */}
                        {message && (
                            <p className="text-white/70 text-center mb-6 leading-relaxed">
                                {message}
                            </p>
                        )}

                        {/* Custom Content */}
                        {children}

                        {/* Action Buttons */}
                        <div className={`flex gap-3 mt-6 ${showCancel ? 'justify-center' : 'justify-center'}`}>
                            {showCancel && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 max-w-[140px] py-3 px-6 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all hover:scale-105"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 max-w-[200px] py-3 px-6 rounded-xl font-bold text-white transition-all hover:scale-105 hover:shadow-lg bg-gradient-to-r ${config.gradient}`}
                                style={{ boxShadow: `0 10px 40px ${config.glowColor}` }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes iconBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-modalIn {
          animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-iconBounce {
          animation: iconBounce 2s ease-in-out infinite;
        }
      `}</style>
        </>
    );
};

export default Modal;
