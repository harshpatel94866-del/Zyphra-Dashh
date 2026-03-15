import React from 'react';
import { Zap } from 'lucide-react';

interface ZyphraLoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    subText?: string;
    fullScreen?: boolean;
    variant?: 'default' | 'minimal' | 'premium';
}

const ZyphraLoader: React.FC<ZyphraLoaderProps> = ({
    size = 'lg',
    text = 'Loading...',
    subText,
    fullScreen = true,
    variant = 'default'
}) => {
    const sizeClasses = {
        sm: { container: 'w-12 h-12', icon: 'w-5 h-5', ring: 'w-14 h-14' },
        md: { container: 'w-16 h-16', icon: 'w-7 h-7', ring: 'w-20 h-20' },
        lg: { container: 'w-24 h-24', icon: 'w-10 h-10', ring: 'w-28 h-28' },
        xl: { container: 'w-32 h-32', icon: 'w-14 h-14', ring: 'w-36 h-36' },
    };

    const LoaderContent = () => (
        <div className="relative flex flex-col items-center justify-center">
            {/* Animated Background Glow */}
            <div className="absolute">
                <div className="w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {/* Multi-ring Spinner */}
            <div className="relative">
                {/* Outer rotating ring */}
                <div
                    className={`${sizeClasses[size].ring} absolute -inset-2 border-2 border-transparent border-t-blue-400 border-r-cyan-400 rounded-full animate-spin`}
                    style={{ animationDuration: '2s' }}
                ></div>

                {/* Middle rotating ring (reverse) */}
                <div
                    className={`${sizeClasses[size].ring} absolute -inset-2 border-2 border-transparent border-b-sky-400 border-l-blue-500 rounded-full animate-spin`}
                    style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
                ></div>

                {/* Inner pulsing core */}
                <div className={`${sizeClasses[size].container} relative rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse`}>
                    {/* Rotating gradient overlay */}
                    <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-spin"
                        style={{ animationDuration: '3s' }}
                    ></div>

                    {/* Icon */}
                    <Zap className={`${sizeClasses[size].icon} text-white relative z-10 drop-shadow-lg`} />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer"></div>
                    </div>
                </div>

                {/* Orbiting dots */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                </div>
            </div>

            {/* Text */}
            {text && (
                <div className="mt-8 text-center animate-fadeIn">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        {text}
                    </h2>
                    {subText && (
                        <p className="text-white/50 mt-2 text-sm">{subText}</p>
                    )}

                    {/* Animated dots */}
                    <div className="flex justify-center gap-1 mt-3">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Premium variant extras */}
            {variant === 'premium' && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Floating particles */}
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-float"
                            style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${20 + Math.random() * 60}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${3 + Math.random() * 3}s`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0c1a3a] to-[#0a0f1e] z-50 flex items-center justify-center">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

                {/* Large background orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <LoaderContent />

                <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 1; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-shimmer { animation: shimmer 2s infinite; }
          .animate-float { animation: float 4s infinite ease-in-out; }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>
            </div>
        );
    }

    return <LoaderContent />;
};

export default ZyphraLoader;
