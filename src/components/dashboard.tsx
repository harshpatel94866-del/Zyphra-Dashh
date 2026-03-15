import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Copy, Check, RefreshCw, Shield, AlertTriangle, Bot as BotIcon,
  Users, Hash, Palette, ExternalLink, Server,
  Activity, Zap
} from 'lucide-react';
import { motion, useInView } from 'motion/react';
import anime from 'animejs';
import DashboardLayout from './DashboardLayout';
import api from '../api';
import { secureStorage } from '../utils/secureStorage';
import { useTheme } from '../context/ThemeContext';

interface Stats {
  guilds: number;
  users: number;
  status: string;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

interface GuildInfo {
  member_count: number;
  channel_count: number;
  role_count: number;
  type: string;
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const fadeSlideUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 16 }
  }
};

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 14 }
  }
};

// ─── Animated Protection Donut (Anime.js) ────────────────────────────────────
const ProtectionDonut: React.FC<{ score: number }> = ({ score }) => {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const circleRef = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  const getColor = (s: number) => {
    if (s >= 91) return '#22c55e';
    if (s >= 71) return '#22c55e';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(score);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const targetOffset = circumference - (score / 100) * circumference;

      // Animate the circle stroke
      if (circleRef.current) {
        anime({
          targets: circleRef.current,
          strokeDashoffset: [circumference, targetOffset],
          duration: 1500,
          easing: 'easeOutExpo',
          delay: 300,
        });
      }

      // Animate the score number
      if (scoreRef.current) {
        const obj = { val: 0 };
        anime({
          targets: obj,
          val: score,
          round: 1,
          duration: 1500,
          easing: 'easeOutExpo',
          delay: 300,
          update: () => {
            if (scoreRef.current) {
              scoreRef.current.textContent = `${Math.round(obj.val)}%`;
            }
          }
        });
      }
    }
  }, [isInView, score, circumference]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span ref={scoreRef} className="text-3xl font-bold" style={{ color }}>0%</span>
      </div>
    </div>
  );
};

// ─── Animated Progress Bar ───────────────────────────────────────────────────
const AnimatedProgressBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && barRef.current && !hasAnimated.current) {
      hasAnimated.current = true;
      anime({
        targets: barRef.current,
        width: [`2%`, `${Math.max(value, 2)}%`],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 200,
      });
    }
  }, [isInView, value]);

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-2">
        <div
          ref={barRef}
          className="h-2 rounded-full"
          style={{
            width: '2%',
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
};

// ─── Module Status Item ──────────────────────────────────────────────────────
const ModuleStatusItem: React.FC<{ label: string; enabled: boolean }> = ({ label, enabled }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-gray-300">{label}</span>
    {enabled ? (
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="w-3 h-3 text-emerald-400" />
      </div>
    ) : (
      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
        <span className="text-red-400 text-xs">✕</span>
      </div>
    )}
  </div>
);

// ─── Copy Button ─────────────────────────────────────────────────────────────
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-white/10 transition-colors"
      title="Copy"
      whileTap={{ scale: 0.85 }}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
      )}
    </motion.button>
  );
};

// ─── Module Detail Card ──────────────────────────────────────────────────────
const ModuleCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  items: { label: string; enabled: boolean }[];
  path: string;
  navigate: (path: string) => void;
}> = ({ title, subtitle, icon, iconColor, items, path, navigate }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.background = `radial-gradient(300px at ${x}px ${y}px, rgba(73,63,255,0.08), transparent 60%)`;
  };

  return (
    <motion.div
      ref={cardRef}
      variants={fadeSlideUp}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
      className="group bg-[#0d1225]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden relative hover:border-white/[0.12] transition-colors"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--theme-text)] flex items-center gap-2">
            <span style={{ color: iconColor }}>{icon}</span>
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <motion.button
          onClick={() => navigate(path)}
          className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ExternalLink className="w-4 h-4 text-gray-500" />
        </motion.button>
      </div>
      <div className="px-5 pb-5 space-y-0.5">
        {items.map((item) => (
          <ModuleStatusItem key={item.label} label={item.label} enabled={item.enabled} />
        ))}
      </div>

      {/* Cursor-following shine */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN OVERVIEW PAGE
// ════════════════════════════════════════════════════════════════════════════
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { solidBgClass, colors } = useTheme();
  
  const [guild, setGuild] = useState<Guild | null>(null);
  const [stats, setStats] = useState<Stats>({ guilds: 0, users: 0, status: 'online' });
  const [guildInfo, setGuildInfo] = useState<GuildInfo>({
    member_count: 0, channel_count: 0, role_count: 0, type: 'Standard',
  });

  const [nukeScore, setNukeScore] = useState(0);
  const [emergencyScore, setEmergencyScore] = useState(30);
  const [automodScore, setAutomodScore] = useState(0);
  const [overallScore, setOverallScore] = useState(6);

  useEffect(() => {
    const guildStr = secureStorage.getItem('selected_guild');
    if (!guildStr) return;
    try {
      const g = JSON.parse(guildStr);
      setGuild(g);
      fetchData(g.id);
    } catch { }
  }, []);

  const fetchData = async (guildId: string) => {
    if (!guildId) return;
    try {
      const [statsRes, guildInfoRes, channelsRes, rolesRes, protectionRes] = await Promise.all([
        api.get('/stats').catch(() => ({ data: { guilds: 0, users: 0, status: 'online' } })),
        api.get(`/guild/${guildId}`, { timeout: 5000 })
          .catch(() => ({ data: { member_count: 0 } })),
        api.get(`/guild/${guildId}/channels`, { timeout: 5000 })
          .catch(() => ({ data: { channels: [] } })),
        api.get(`/guild/${guildId}/roles`, { timeout: 5000 })
          .catch(() => ({ data: { roles: [] } })),
        api.get(`/guild/${guildId}/protection/status`, { timeout: 5000 })
          .catch(() => ({ data: { antinuke_setup: false, automod_setup: false, antinuke_enabled: false, automod_enabled: false } })),
      ]);

      setStats(statsRes.data);
      const channels = channelsRes.data.channels || [];
      const roles = rolesRes.data.roles || [];
      const memberCount = guildInfoRes.data.member_count || 0;

      setGuildInfo({
        member_count: memberCount,
        channel_count: channels.length,
        role_count: roles.length,
        type: memberCount >= 1000 ? 'Large' : 'Standard',
      });

      const d = protectionRes.data;
      const nuke = d.antinuke_setup ? (d.antinuke_enabled ? 80 : 20) : 0;
      const automod = d.automod_setup ? (d.automod_enabled ? 70 : 15) : 0;
      setNukeScore(nuke);
      setAutomodScore(automod);
      setOverallScore(Math.round((nuke + emergencyScore + automod) / 3));
    } catch (err) {
      console.error('[Dashboard] Failed to fetch guild data:', err);
    }
  };

  if (!guild) return null;

  return (
    <DashboardLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Overview Banner ─────────────────────────────────────────── */}
        <motion.div variants={fadeSlideUp} className="relative rounded-2xl overflow-hidden mb-8">
          <div className={`absolute inset-0 ${solidBgClass} opacity-30`} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-40" />

          {/* Animated glow orb */}
          <motion.div
            className="absolute -top-10 -right-10 w-40 h-40 bg-theme-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative px-8 py-10">
            <motion.p
              className="text-xs font-bold tracking-[0.2em] text-theme-primary uppercase mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Overview
            </motion.p>
            <motion.h1
              className="text-4xl font-extrabold text-[var(--theme-text)] mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              {guild.name}
            </motion.h1>
            <motion.p
              className="text-sm text-blue-200/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Real-time server protection posture with module-level security readiness.
            </motion.p>
          </div>
        </motion.div>

        {/* ─── Server Details + Protection Score ──────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
          {/* Server Details — 3 col */}
          <motion.div variants={fadeSlideUp} className="xl:col-span-3 bg-theme-bg-secondary/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--theme-text)]">Server Details</h2>
              <motion.button
                onClick={() => guild && fetchData(guild.id)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[var(--theme-text)] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-md transition-colors border border-white/[0.06]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-3 h-3" />
                Sync
              </motion.button>
            </div>

            {/* Name & ID */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-theme-bg/50 rounded-lg p-3 border border-white/[0.04]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Server Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--theme-text)] truncate">{guild.name}</p>
                  <CopyButton text={guild.name} />
                </div>
              </div>
              <div className="bg-theme-bg/50 rounded-lg p-3 border border-white/[0.04]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Server ID</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--theme-text)] font-mono truncate">{guild.id}</p>
                  <CopyButton text={guild.id} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <motion.div
              className="grid grid-cols-3 gap-3 mb-5"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                { icon: <Server className="w-4 h-4 text-gray-500" />, label: 'Type', value: guildInfo.type },
                { icon: <Users className="w-4 h-4 text-gray-500" />, label: 'Members', value: guildInfo.member_count },
                { icon: <Hash className="w-4 h-4 text-gray-500" />, label: 'Channels', value: guildInfo.channel_count },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  className="flex items-center gap-2.5 bg-theme-bg/50 rounded-lg p-3 border border-white/[0.04]"
                >
                  {stat.icon}
                  <div>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                    <p className="text-sm font-semibold text-[var(--theme-text)]">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Roles stat */}
            <motion.div
              variants={scaleIn}
              className="flex items-center gap-2.5 bg-theme-bg/50 rounded-lg p-3 border border-white/[0.04] max-w-[200px]"
            >
              <Palette className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-[10px] text-gray-500">Roles</p>
                <p className="text-sm font-semibold text-[var(--theme-text)]">{guildInfo.role_count}</p>
              </div>
            </motion.div>

            {/* Protection progress bars */}
            <div className="mt-6 space-y-3">
              {[
                { label: 'Nuke Protection', value: nukeScore, color: nukeScore > 0 ? colors.primary : '#ef4444' },
                { label: 'Emergency', value: emergencyScore, color: emergencyScore >= 50 ? '#22c55e' : '#ef4444' },
                { label: 'Automod', value: automodScore, color: automodScore > 0 ? colors.primary : '#ef4444' },
              ].map((bar) => (
                <AnimatedProgressBar key={bar.label} label={bar.label} value={bar.value} color={bar.color} />
              ))}
            </div>
          </motion.div>

          {/* Protection Score — 2 col */}
          <motion.div variants={fadeSlideUp} className="xl:col-span-2 bg-theme-bg-secondary/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--theme-text)]">Overall Protection Score</h2>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-gray-400">Live</span>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <ProtectionDonut score={overallScore} />
            </div>

            {/* Legend */}
            <div className="space-y-2.5">
              {[
                { range: '0-39%', color: '#ef4444', label: 'High Risk' },
                { range: '40-70%', color: '#f59e0b', label: 'Moderate' },
                { range: '71-90%', color: '#22c55e', label: 'Protected' },
                { range: '91-100%', color: '#22c55e', label: 'Fully Secured' },
              ].map((item) => (
                <div key={item.range} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-400">{item.range}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[10px] text-gray-600 leading-relaxed">
              This score is based on Zyphra protection modules, not Discord server settings.
            </p>
          </motion.div>
        </div>

        {/* ─── Quick Action Buttons ────────────────────────────────────── */}
        <motion.div variants={fadeSlideUp} className="flex flex-wrap gap-3 mb-8">
          {[
            { label: 'Open Antinuke', path: '/dashboard/antinuke', color: 'from-blue-600 to-blue-700' },
            { label: 'Open Emergency Mode', path: '/dashboard/emergency', color: 'from-emerald-600 to-emerald-700' },
            { label: 'Open Limit System', path: '/dashboard/limit-system', color: 'from-cyan-600 to-cyan-700' },
            { label: 'Open Automod', path: '/dashboard/automod', color: 'from-violet-600 to-violet-700' },
          ].map((btn) => (
            <motion.button
              key={btn.label}
              onClick={() => navigate(btn.path)}
              className={`bg-gradient-to-r ${btn.color} text-[var(--theme-text)] text-xs font-semibold px-4 py-2 rounded-lg`}
              whileHover={{ scale: 1.05, y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {btn.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ─── Module Detail Cards ─────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
        >
          <ModuleCard
            title="Nuke Protection"
            subtitle={nukeScore > 0 ? 'Active protection' : 'No nuke system active'}
            icon={<Shield className="w-4 h-4" />}
            iconColor="#60a5fa"
            items={[
              { label: 'Enabled', enabled: nukeScore > 0 },
              { label: 'Logging', enabled: false },
              { label: 'Anti Betray / Auto Emergency', enabled: false },
              { label: 'Advance Limit Protection', enabled: false },
            ]}
            path="/dashboard/antinuke"
            navigate={navigate}
          />

          <ModuleCard
            title="Emergency"
            subtitle="Rapid containment controls"
            icon={<AlertTriangle className="w-4 h-4" />}
            iconColor="#fbbf24"
            items={[
              { label: 'Enabled', enabled: false },
              { label: 'Roles Added', enabled: false },
              { label: 'Authorized User', enabled: false },
            ]}
            path="/dashboard/emergency"
            navigate={navigate}
          />

          <ModuleCard
            title="Automod"
            subtitle="0/9 events active"
            icon={<BotIcon className="w-4 h-4" />}
            iconColor="#a78bfa"
            items={[
              { label: 'Enabled', enabled: false },
              { label: 'Events Enabled (0/9)', enabled: false },
              { label: 'Logging', enabled: false },
            ]}
            path="/dashboard/automod"
            navigate={navigate}
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;
