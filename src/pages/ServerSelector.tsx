import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import axios from 'axios';
import { Plus, Settings, Users, Crown, ChevronLeft, Search, Sparkles, ArrowUpRight, Zap } from 'lucide-react';
import ZyphraLoader from '../components/ZyphraLoader';
import { secureStorage } from '../utils/secureStorage';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

interface BotGuild {
  id: string;
  name: string;
  icon: string | null;
  member_count: number;
}

interface MutualGuild extends Guild {
  bot_in_server: boolean;
  member_count?: number;
}

const ServerSelector: React.FC = () => {
  const [userGuilds, setUserGuilds] = useState<Guild[]>([]);
  const [botGuilds, setBotGuilds] = useState<BotGuild[]>([]);
  const [mutualGuilds, setMutualGuilds] = useState<MutualGuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [filterActive, setFilterActive] = useState<'all' | 'with' | 'without'>('all');
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID || '1335133474226438176';
  const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

  // ✅ Scroll Position Tracking for Parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Intersection Observer for Card Animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px',
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    try {
      // Get the user's Discord token for fetching their guilds
      const token = secureStorage.getItem('discord_token');

      // Fetch bot guilds and user guilds in parallel
      const [botGuildsResponse, userGuildsResponse] = await Promise.all([
        api.get('/guilds'),
        token
          ? api.get('/user/guilds', {
            headers: { Authorization: `Bearer ${token}` },
          })
          : Promise.resolve({ data: [] }),
      ]);

      const botGuildsData: BotGuild[] = botGuildsResponse.data;
      const userGuildsData: Guild[] = userGuildsResponse.data;

      // Create a Set of bot guild IDs for fast lookup
      const botGuildIds = new Set(botGuildsData.map(g => g.id));

      // Build a map of bot guilds for member_count lookup
      const botGuildMap = new Map(botGuildsData.map(g => [g.id, g]));

      // Cross-reference: user guilds marked with bot presence
      const MANAGE_GUILD = 0x20;
      const ADMINISTRATOR = 0x8;

      const mutual: MutualGuild[] = userGuildsData
        .filter(g => {
          // Show all servers where bot is present, OR where user can invite bot
          const perms = parseInt(g.permissions || '0');
          const canManage = g.owner || (perms & ADMINISTRATOR) !== 0 || (perms & MANAGE_GUILD) !== 0;
          return botGuildIds.has(g.id) || canManage;
        })
        .map(guild => ({
          ...guild,
          bot_in_server: botGuildIds.has(guild.id),
          member_count: botGuildMap.get(guild.id)?.member_count,
        }));

      // Sort: bot servers first, then alphabetical
      mutual.sort((a, b) => {
        if (a.bot_in_server && !b.bot_in_server) return -1;
        if (!a.bot_in_server && b.bot_in_server) return 1;
        return a.name.localeCompare(b.name);
      });

      setUserGuilds(userGuildsData);
      setBotGuilds(botGuildsData);
      setMutualGuilds(mutual);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch guilds:', error);
      setLoading(false);
    }
  };

  const getGuildIcon = (guild: MutualGuild) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=128`;
    }
    return null;
  };

  const handleServerClick = (guild: MutualGuild) => {
    if (guild.bot_in_server) {
      secureStorage.setItem('selected_guild', JSON.stringify(guild));
      navigate(`/dashboard`);
    } else {
      window.open(`${BOT_INVITE_URL}&guild_id=${guild.id}`, '_blank');
    }
  };

  const filteredGuilds = mutualGuilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterActive === 'all' ? true :
        filterActive === 'with' ? guild.bot_in_server :
          !guild.bot_in_server;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <ZyphraLoader
        text="Loading Servers"
        subText="Fetching your Discord servers..."
        variant="premium"
      />
    );
  }

  return (
    <>
      {/* ✅ Advanced Styles */}
      <style>{`
        /* Premium Glassmorphism Card */
        .glass-card {
          position: relative;
          background: rgba(17, 24, 39, 0.5);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(75, 85, 99, 0.2);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.75rem;
          padding: 2px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.6) 0%,
            rgba(34, 211, 238, 0.6) 50%,
            rgba(139, 92, 246, 0.6) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .glass-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.1), 
            transparent);
          transition: left 0.7s ease;
        }

        .glass-card:hover {
          transform: translateY(-12px) scale(1.03);
          background: rgba(17, 24, 39, 0.7);
          box-shadow: 
            0 30px 60px -15px rgba(59, 130, 246, 0.4),
            0 0 0 1px rgba(59, 130, 246, 0.2),
            inset 0 2px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
        }

        .glass-card:hover::before {
          opacity: 1;
          animation: rotateBorder 3s linear infinite;
        }

        .glass-card:hover::after {
          left: 100%;
        }

        @keyframes rotateBorder {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        .glass-card:hover .card-icon {
          transform: scale(1.15) rotate(8deg);
        }

        .glass-card:hover .card-glow {
          opacity: 1;
          transform: scale(1.5);
        }

        /* Radial Glow Effect */
        .card-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          opacity: 0;
          transition: all 0.6s ease;
          pointer-events: none;
        }

        /* Icon Animations */
        .card-icon {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
        }

        /* Scroll Fade Up Animation */
        .scroll-fade-up {
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scroll-fade-up.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Stagger Delays */
        .scroll-fade-up:nth-child(3n+1) { transition-delay: 0.1s; }
        .scroll-fade-up:nth-child(3n+2) { transition-delay: 0.2s; }
        .scroll-fade-up:nth-child(3n+3) { transition-delay: 0.3s; }

        /* Glass Input with Focus */
        .glass-input {
          background: rgba(17, 24, 39, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(75, 85, 99, 0.4);
          transition: all 0.4s ease;
        }

        .glass-input:focus {
          background: rgba(17, 24, 39, 0.8);
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow: 
            0 0 0 4px rgba(251, 191, 36, 0.1),
            0 8px 16px rgba(251, 191, 36, 0.2);
          transform: translateY(-2px);
        }

        /* Stats Card Animation */
        .stats-card {
          animation: slideInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) backwards;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.4s ease;
        }

        .stats-card:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .stats-card:nth-child(1) { animation-delay: 0.1s; }
        .stats-card:nth-child(2) { animation-delay: 0.2s; }
        .stats-card:nth-child(3) { animation-delay: 0.3s; }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Filter Button */
        .filter-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .filter-btn.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.6);
          color: #60A5FA;
        }

        .filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Parallax Background */
        .parallax-bg {
          transition: transform 0.1s ease-out;
        }

        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(2deg); }
          66% { transform: translateY(-6px) rotate(-2deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Pulse Animation */
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        /* Shimmer Effect */
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
        {/* ✅ Animated Background with Parallax */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          ></div>
          <div
            className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ transform: `translateY(${-scrollY * 0.2}px)`, animationDelay: '1.5s' }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow"
            style={{ transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.0005})`, animationDelay: '3s' }}
          ></div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 relative z-10">
          {/* ✅ Enhanced Header with Parallax */}
          <div
            ref={headerRef}
            className="text-center mb-12"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-blue-400 font-medium">Choose Your Server</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent animate-float">
              Select a Server
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Choose a server to unlock powerful bot features and manage your community
            </p>
          </div>

          {/* ✅ Enhanced Search Bar & Filter */}
          <div className="max-w-3xl mx-auto mb-10 space-y-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search servers by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-2xl px-6 py-4 pl-14 text-white placeholder-gray-400 focus:outline-none"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setFilterActive('all')}
                className={`filter-btn px-6 py-2 rounded-full border text-sm font-medium ${filterActive === 'all' ? 'active' : 'bg-gray-800/40 border-gray-700 text-gray-300'
                  }`}
              >
                All Servers
              </button>
              <button
                onClick={() => setFilterActive('with')}
                className={`filter-btn px-6 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${filterActive === 'with' ? 'active' : 'bg-gray-800/40 border-gray-700 text-gray-300'
                  }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                With Bot
              </button>
              <button
                onClick={() => setFilterActive('without')}
                className={`filter-btn px-6 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${filterActive === 'without' ? 'active' : 'bg-gray-800/40 border-gray-700 text-gray-300'
                  }`}
              >
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                Without Bot
              </button>
            </div>
          </div>

          {/* ✅ Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="stats-card bg-gradient-to-br from-blue-500/10 to-cyan-600/5 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 text-center group cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-white/50 text-sm mb-2">Your Servers</p>
              <p className="text-4xl font-bold text-blue-400">{mutualGuilds.length}</p>
            </div>
            <div className="stats-card bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 text-center group cursor-pointer">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-2">With Bot</p>
              <p className="text-4xl font-bold text-green-400">
                {mutualGuilds.filter(g => g.bot_in_server).length}
              </p>
            </div>
            <div className="stats-card bg-gradient-to-br from-blue-500/10 to-cyan-600/5 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 text-center group cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Available</p>
              <p className="text-4xl font-bold text-blue-400">
                {mutualGuilds.filter(g => !g.bot_in_server).length}
              </p>
            </div>
          </div>

          {/* ✅ Server Grid */}
          {filteredGuilds.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No servers found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredGuilds.map((guild, index) => (
                <div
                  key={guild.id}
                  id={`card-${guild.id}`}
                  ref={(el) => {
                    if (el && observerRef.current && !visibleCards.has(`card-${guild.id}`)) {
                      observerRef.current.observe(el);
                    }
                  }}
                  className={`glass-card rounded-2xl p-6 cursor-pointer scroll-fade-up ${visibleCards.has(`card-${guild.id}`) ? 'visible' : ''
                    }`}
                  onClick={() => handleServerClick(guild)}
                >
                  {/* Glow Effect */}
                  <div className="card-glow"></div>

                  {/* Server Icon & Info */}
                  <div className="flex items-start gap-4 mb-5 relative z-10">
                    {getGuildIcon(guild) ? (
                      <div className="relative">
                        <img
                          src={getGuildIcon(guild)!}
                          alt={guild.name}
                          className="w-16 h-16 rounded-full flex-shrink-0 card-icon border-2 border-gray-700/50"
                        />
                        {guild.bot_in_server && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-2xl font-bold card-icon border-2 border-gray-700/50">
                          {guild.name.charAt(0)}
                        </div>
                        {guild.bot_in_server && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-2 truncate group-hover:text-yellow-400 transition">
                        {guild.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {guild.owner && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm border border-yellow-500/30">
                            <Crown className="w-3 h-3" />
                            Owner
                          </span>
                        )}
                        {guild.member_count && (
                          <span className="text-xs bg-gray-700/50 text-gray-400 px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm border border-gray-600/30">
                            <Users className="w-3 h-3" />
                            {guild.member_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-5 relative z-10">
                    {guild.bot_in_server ? (
                      <div className="flex items-center justify-between text-sm text-green-400 bg-green-500/10 px-4 py-3 rounded-xl backdrop-blur-sm border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">Bot Active</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-700/30 px-4 py-3 rounded-xl backdrop-blur-sm border border-gray-600/20">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span className="font-medium">Ready to Install</span>
                        </div>
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServerClick(guild);
                    }}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-400 flex items-center justify-center gap-2 relative z-10 group/btn ${guild.bot_in_server
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600 hover:shadow-lg hover:shadow-yellow-400/50'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-blue-500/50'
                      }`}
                  >
                    {guild.bot_in_server ? (
                      <>
                        <Settings className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
                        Manage Server
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
                        Invite Bot
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Enhanced Back Button */}
          <div className="text-center mt-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-800/40 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:border-yellow-500/50 hover:bg-gray-800/60 transition-all duration-300 hover:scale-105 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerSelector;
