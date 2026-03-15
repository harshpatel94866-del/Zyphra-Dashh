import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Shield, Settings, BarChart3, ArrowRight } from 'lucide-react';
import ZyphraLoader from './ZyphraLoader';
import { useTheme } from '../context/ThemeContext';
import { secureStorage } from '../utils/secureStorage';

const DashboardLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { mode, colors, solidBgClass } = useTheme();

  // Discord OAuth2 Configuration
  const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID || '1335133474226438176';
  const REDIRECT_URI = encodeURIComponent(`${window.location.origin}/auth/callback`);
  const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify%20guilds`;

  // Check if user is already logged in (non-blocking)
  useEffect(() => {
    const token = secureStorage.getItem('discord_token');
    if (token) {
      const selectedGuild = secureStorage.getItem('selected_guild');
      if (selectedGuild) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard/servers');
      }
    }
  }, [navigate]);

  const handleDiscordLogin = () => {
    console.log('[LOGIN] Redirecting to Discord OAuth...');
    console.log('[LOGIN] URL:', DISCORD_OAUTH_URL);
    setLoading(true);
    // Direct redirect to Discord OAuth
    window.location.href = DISCORD_OAUTH_URL;
  };

  // Show loading state while redirecting to Discord
  if (loading) {
    return (
      <ZyphraLoader
        text="Redirecting"
        subText="Taking you to Discord..."
        variant="premium"
      />
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${mode === 'dark' ? 'bg-[var(--theme-bg)] text-[var(--theme-text)]' : 'bg-[var(--theme-bg)] text-[var(--theme-text)]'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[120px]"></div>

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--theme-primary)]/20 to-transparent rounded-3xl blur-xl"></div>

        {/* Glassmorphism Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
          {/* Shimmer effect */}
          {/* <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>
          </div> */}

          {/* Logo */}
          <div className="relative flex justify-center mb-8">
            <div className="relative">
              {/* Rotating ring */}
              <div className="absolute -inset-4 border-2 border-dashed border-blue-500/30 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>

              {/* Logo container */}
              <div className="w-20 h-20 ${solidBgClass} rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Zap className="w-10 h-10 text-[var(--theme-text)]" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 text-[var(--theme-primary)] bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-[var(--theme-text-secondary)] text-center mb-8">
            Sign in with Discord to access your dashboard
          </p>

          {/* Login Button */}
          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-[var(--theme-text)] font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#5865F2]/30 hover:scale-[1.02]"
          >
            <svg className="w-6 h-6" viewBox="0 0 71 55" fill="none">
              <g clipPath="url(#clip0)">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor" />
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="71" height="55" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Sign in with Discord
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-[var(--theme-text)]/30 text-sm uppercase tracking-wider">Features</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Shield className="w-5 h-5" />, label: 'Secure' },
              { icon: <Settings className="w-5 h-5" />, label: 'Manage' },
              { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300 group cursor-default"
              >
                <div className="text-blue-400 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <span className="text-[var(--theme-text-secondary)] text-xs font-medium group-hover:text-[var(--theme-text)]/80 transition-colors">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-6 text-sm text-[var(--theme-text)]/30">
          <Link to="/privacy" className="hover:text-[var(--theme-text)]/60 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-[var(--theme-text)]/60 transition-colors">Terms</Link>
          <Link to="/support" className="hover:text-[var(--theme-text)]/60 transition-colors">Support</Link>
        </div>

        <p className="text-center text-[var(--theme-text)]/20 text-xs mt-4">
          © 2025 Cybernatics Development Team
        </p>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-float { animation: float 6s infinite ease-in-out; }
        .animate-shimmer { animation: shimmer 4s infinite; }
      `}</style>
    </div>
  );
};

export default DashboardLogin;
