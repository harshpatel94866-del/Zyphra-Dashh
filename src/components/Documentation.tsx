// Documentation.tsx - Enhanced with Animations & Collapsible Sidebar (FULL VERSION)
import React, { useState, useMemo, useEffect } from 'react';
import {
  Book, Code, Zap, Shield, Users, ChevronRight, Search,
  Menu, X, Home, Settings, Copy, Check, ExternalLink,
  Terminal, Package, Sparkles, FileText, Bot, MessageSquare,
  Clock, Lock, Star, Hash, Image, Volume2, UserPlus, Crown,
  FileQuestion, ScrollText, Smile, Bell, Ban, Activity,
  AlertTriangle, Music, Trophy, Heart, Trash2, MessageCircle,
  Edit, Plus, Minus, Eye, EyeOff, RotateCcw, ChevronDown, Headphones
} from 'lucide-react';
import logo from '../assests/logo.png';

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  children?: { id: string; title: string }[];
}

interface SearchResult {
  section: string;
  subsection?: string;
  title: string;
  content: string;
  id: string;
}

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));

  const navigation: NavItem[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Home className="w-5 h-5" />,
      children: [
        { id: 'introduction', title: 'Introduction' },
        { id: 'installation', title: 'Installation' },
        { id: 'quick-start', title: 'Quick Start' },
      ]
    },
    {
      id: 'moderation',
      title: 'Moderation',
      icon: <Shield className="w-5 h-5" />,
      children: [
        { id: 'mod-basic', title: 'Basic Moderation' },
        { id: 'mod-advanced', title: 'Advanced Moderation' },
        { id: 'mod-mass', title: 'Mass Moderation' },
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Lock className="w-5 h-5" />,
      children: [
        { id: 'antinuke', title: 'Antinuke' },
        { id: 'automod', title: 'Automod' },
        { id: 'antibot', title: 'Antibot' },
      ]
    },
    {
      id: 'automation',
      title: 'Automation',
      icon: <Activity className="w-5 h-5" />,
      children: [
        { id: 'autorole', title: 'Autorole' },
        { id: 'autoreact', title: 'Autoreact' },
        { id: 'auto-responder', title: 'Auto Responder' },
        { id: 'sticky-messages', title: 'Sticky Messages' },
      ]
    },
    {
      id: 'welcome',
      title: 'Welcome & Greet',
      icon: <MessageSquare className="w-5 h-5" />,
      children: [
        { id: 'welcome-messages', title: 'Welcome Messages' },
        { id: 'boost-messages', title: 'Boost Messages' },
        { id: 'leave-messages', title: 'Leave Messages' },
      ]
    },
    {
      id: 'voice',
      title: 'Voice',
      icon: <Volume2 className="w-5 h-5" />,
      children: [
        { id: 'voice-master', title: 'Voice Master' },
        { id: 'voice-roles', title: 'Voice Roles' },
      ]
    },
    {
      id: 'roles',
      title: 'Roles',
      icon: <UserPlus className="w-5 h-5" />,
      children: [
        { id: 'role-management', title: 'Role Management' },
        { id: 'custom-roles', title: 'Custom Roles' },
        { id: 'reaction-roles', title: 'Reaction Roles' },
      ]
    },
    {
      id: 'utility',
      title: 'Utility',
      icon: <Code className="w-5 h-5" />,
      children: [
        { id: 'utility-info', title: 'Information' },
        { id: 'utility-tools', title: 'Tools' },
        { id: 'utility-fun', title: 'Fun Commands' },
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: <Settings className="w-5 h-5" />,
      children: [
        { id: 'server-config', title: 'Server Config' },
        { id: 'logging', title: 'Logging' },
        { id: 'ignore-channels', title: 'Ignore Channels' },
        { id: 'extra-access', title: 'Extra Access' },
        { id: 'no-prefix', title: 'No Prefix' },
      ]
    },
    {
      id: 'premium',
      title: 'Premium',
      icon: <Crown className="w-5 h-5" />,
      children: [
        { id: 'premium-features', title: 'Premium Features' },
        { id: 'premium-commands', title: 'Premium Commands' },
      ]
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const searchIndex: SearchResult[] = useMemo(() => [
    { section: 'Getting Started', title: 'Introduction', content: 'welcome discord bot protection moderation', id: 'introduction' },
    { section: 'Moderation', title: 'Ban', content: 'ban kick timeout warn mute moderation', id: 'mod-basic' },
    { section: 'Security', title: 'Antinuke', content: 'antinuke protection raid nuke attack', id: 'antinuke' },
    { section: 'Automation', title: 'Autorole', content: 'autorole automatic role assignment', id: 'autorole' },
    { section: 'Voice', title: 'Voice Master', content: 'voice master temporary channels', id: 'voice-master' },
    { section: 'Utility', title: 'Server Info', content: 'serverinfo userinfo avatar banner', id: 'utility-info' },
    { section: 'Premium', title: 'Premium Features', content: 'premium upgrade features enhanced', id: 'premium-features' },
  ], []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchQuery, searchIndex]);

  const handleSearchSelect = (resultId: string) => {
    setActiveSection(resultId);
    setSearchQuery('');
    setShowSearchResults(false);
    setMobileMenuOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CommandCard: React.FC<{
    name: string;
    prefix?: string;
    slash?: string;
    description: string;
    aliases?: string[];
    premium?: boolean;
    vote?: boolean;
    noprefix?: boolean;
  }> = ({ name, prefix, slash, description, aliases, premium, vote, noprefix }) => (
    <div className="group relative bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/60 hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 animate-fadeInUp">
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
            {name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {prefix && <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-mono rounded-full hover:scale-110 hover:bg-cyan-500/30 transition-all duration-300 cursor-default">PREFIX</span>}
            {slash && <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-mono rounded-full hover:scale-110 hover:bg-blue-500/30 transition-all duration-300 cursor-default">SLASH</span>}
            {premium && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-mono rounded-full flex items-center gap-1 hover:scale-110 hover:bg-yellow-500/30 transition-all duration-300 cursor-default"><Crown className="w-3 h-3 animate-pulse" />PREMIUM</span>}
            {vote && <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-mono rounded-full flex items-center gap-1 hover:scale-110 hover:bg-purple-500/30 transition-all duration-300 cursor-default"><Star className="w-3 h-3 animate-pulse" />VOTE</span>}
            {noprefix && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-mono rounded-full flex items-center gap-1 hover:scale-110 hover:bg-emerald-500/30 transition-all duration-300 cursor-default"><Zap className="w-3 h-3" />NP</span>}
          </div>
        </div>
        {prefix && <code className="text-sky-400 font-mono text-sm block mb-1 group-hover:text-sky-300 transition-colors">{prefix}</code>}
        {slash && <code className="text-blue-400 font-mono text-sm block mb-1 group-hover:text-blue-300 transition-colors">{slash}</code>}
        <p className="text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">{description}</p>
        {aliases && aliases.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Aliases:</span>
            {aliases.map((alias, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-600/70 hover:scale-105 transition-all duration-200 cursor-default">{alias}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const Alert: React.FC<{ type: 'info' | 'warning' | 'success'; children: React.ReactNode }> = ({ type, children }) => {
    const styles = {
      info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
      success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    };
    return <div className={`border-l-4 p-4 rounded-r-lg ${styles[type]} my-6 hover:scale-[1.01] transition-transform duration-300`}>{children}</div>;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
      case 'introduction':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent animate-gradient">
              Welcome to Zyphra Documentation
            </h1>
            <p className="text-xl text-gray-400 mb-8 animate-slideInUp">The ultimate Discord bot for server protection, moderation, and management.</p>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Terminal className="w-8 h-8" />, title: 'PREFIX', desc: 'Traditional commands with + prefix', color: 'cyan' },
                { icon: <Zap className="w-8 h-8" />, title: 'SLASH', desc: 'Modern Discord slash commands', color: 'blue' },
                { icon: <Crown className="w-8 h-8" />, title: 'PREMIUM', desc: 'Exclusive premium features', color: 'yellow' },
                { icon: <Star className="w-8 h-8" />, title: 'VOTE', desc: 'Vote to unlock features', color: 'purple' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`group relative bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-xl p-4 hover:bg-${item.color}-500/20 transition-all duration-500 hover:scale-110 hover:-translate-y-2 cursor-pointer animate-fadeInUp`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/0 to-${item.color}-500/0 group-hover:from-${item.color}-500/20 group-hover:to-${item.color}-500/10 rounded-xl transition-all duration-500`}></div>
                  <div className="relative">
                    <div className={`text-${item.color}-400 mb-2 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                      {item.icon}
                    </div>
                    <h3 className="text-white font-bold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Alert type="info">
              <strong>💡 New to Zyphra?</strong> Start by inviting the bot and running <code className="text-sky-400">+help</code> or <code className="text-blue-400">/help</code>
            </Alert>
          </div>
        );

      case 'mod-basic':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Basic Moderation Commands</h1>
            <p className="text-gray-400 text-lg mb-8">Essential moderation tools for server management.</p>

            <div className="grid gap-4">
              <CommandCard name="Ban" prefix="+ban @user [reason]" slash="/ban user:@user reason:text" description="Permanently ban a member from the server" aliases={['b']} noprefix />
              <CommandCard name="Unban" prefix="+unban <user_id> [reason]" slash="/unban user_id:text reason:text" description="Unban a previously banned member" aliases={['ub']} noprefix />
              <CommandCard name="Kick" prefix="+kick @user [reason]" slash="/kick user:@user reason:text" description="Kick a member from the server" aliases={['k']} noprefix />
              <CommandCard name="Timeout" prefix="+timeout @user 10m [reason]" slash="/timeout user:@user duration:10m reason:text" description="Timeout a member for specified duration" aliases={['mute', 'tm']} noprefix />
              <CommandCard name="Untimeout" prefix="+untimeout @user [reason]" slash="/untimeout user:@user reason:text" description="Remove timeout from a member" aliases={['unmute', 'utm']} noprefix />
              <CommandCard name="Warn" prefix="+warn @user [reason]" slash="/warn user:@user reason:text" description="Issue a warning to a member" aliases={['w']} noprefix />
              <CommandCard name="Warnings" prefix="+warnings @user" slash="/warnings user:@user" description="View warnings for a member" aliases={['warns']} />
              <CommandCard name="Remove Warning" prefix="+removewarn @user <warn_id>" slash="/removewarn user:@user id:text" description="Remove a specific warning" aliases={['delwarn']} />
              <CommandCard name="Clear Warnings" prefix="+clearwarns @user" slash="/clearwarns user:@user" description="Clear all warnings for a member" />
            </div>
          </div>
        );

      case 'mod-advanced':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Advanced Moderation</h1>
            <p className="text-gray-400 text-lg mb-8">Advanced moderation tools for power users.</p>

            <div className="grid gap-4">
              <CommandCard name="Softban" prefix="+softban @user [reason]" slash="/softban user:@user reason:text" description="Ban and immediately unban to clear messages" aliases={['sb']} noprefix />
              <CommandCard name="Tempban" prefix="+tempban @user 7d [reason]" slash="/tempban user:@user duration:7d reason:text" description="Temporarily ban a member" aliases={['tban']} noprefix premium />
              <CommandCard name="Lockdown" prefix="+lockdown [duration]" slash="/lockdown duration:1h" description="Lockdown the server or channel" aliases={['ld']} noprefix />
              <CommandCard name="Unlock" prefix="+unlock" slash="/unlock" description="Remove lockdown from server/channel" aliases={['ul']} noprefix />
              <CommandCard name="Lock" prefix="+lock [#channel]" slash="/lock channel:#channel" description="Lock a specific channel" noprefix />
              <CommandCard name="Unlock Channel" prefix="+unlock [#channel]" slash="/unlock channel:#channel" description="Unlock a specific channel" noprefix />
              <CommandCard name="Slowmode" prefix="+slowmode 10s" slash="/slowmode duration:10s" description="Set slowmode delay for channel" aliases={['slow']} noprefix />
              <CommandCard name="Nick" prefix="+nick @user <nickname>" slash="/nick user:@user name:text" description="Change a member's nickname" noprefix />
              <CommandCard name="Role" prefix="+role @user @role" slash="/role user:@user role:@role" description="Add or remove a role from member" aliases={['r']} noprefix />
            </div>
          </div>
        );

      case 'mod-mass':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Mass Moderation</h1>
            <p className="text-gray-400 text-lg mb-8">Bulk moderation commands for managing multiple users.</p>

            <div className="grid gap-4">
              <CommandCard name="Purge" prefix="+purge 100" slash="/purge amount:100" description="Bulk delete messages (max 100)" aliases={['clear', 'clean']} noprefix />
              <CommandCard name="Purge User" prefix="+purge @user 50" slash="/purge user:@user amount:50" description="Delete messages from specific user" noprefix />
              <CommandCard name="Purge Bots" prefix="+purge bots 100" slash="/purge bots amount:100" description="Delete bot messages only" noprefix />
              <CommandCard name="Purge Embeds" prefix="+purge embeds 50" slash="/purge embeds amount:50" description="Delete messages with embeds" noprefix />
              <CommandCard name="Purge Links" prefix="+purge links 100" slash="/purge links amount:100" description="Delete messages containing links" noprefix />
              <CommandCard name="Purge Images" prefix="+purge images 50" slash="/purge images amount:50" description="Delete messages with images" noprefix />
              <CommandCard name="Mass Ban" prefix="+massban @user1 @user2 @user3" description="Ban multiple users at once" premium noprefix />
              <CommandCard name="Mass Kick" prefix="+masskick @user1 @user2 @user3" description="Kick multiple users at once" premium noprefix />
              <CommandCard name="Mass Role" prefix="+massrole @role @user1 @user2" description="Add role to multiple users" premium noprefix />
            </div>
          </div>
        );

      case 'antinuke':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Antinuke Protection</h1>
            <p className="text-gray-400 text-lg mb-8">Protect your server from raids and malicious actions.</p>

            <Alert type="warning">
              <strong>⚠️ Important:</strong> Antinuke requires proper configuration and the bot role to be at the top of the role hierarchy.
            </Alert>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Setup Commands</h2>
            <div className="grid gap-4 mb-8">
              <CommandCard name="Antinuke Enable" prefix="+antinuke enable" slash="/antinuke enable" description="Enable antinuke protection" noprefix />
              <CommandCard name="Antinuke Disable" prefix="+antinuke disable" slash="/antinuke disable" description="Disable antinuke protection" noprefix />
              <CommandCard name="Antinuke Config" prefix="+antinuke config" slash="/antinuke config" description="View antinuke configuration" noprefix />
              <CommandCard name="Antinuke Whitelist" prefix="+antinuke whitelist @user" slash="/antinuke whitelist add user:@user" description="Whitelist a trusted user" aliases={['aw', 'wl']} noprefix />
              <CommandCard name="Antinuke Unwhitelist" prefix="+antinuke unwhitelist @user" slash="/antinuke whitelist remove user:@user" description="Remove user from whitelist" aliases={['uwl']} noprefix />
              <CommandCard name="Antinuke Reset" prefix="+antinuke reset" slash="/antinuke reset" description="Reset antinuke configuration" noprefix />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Limit Configuration</h2>
            <div className="grid gap-4">
              <CommandCard name="Ban Limit" prefix="+antinuke banl <limit>" slash="/antinuke limit type:ban amount:3" description="Set max bans per minute (default: 3)" noprefix />
              <CommandCard name="Kick Limit" prefix="+antinuke kickl <limit>" slash="/antinuke limit type:kick amount:5" description="Set max kicks per minute (default: 5)" noprefix />
              <CommandCard name="Role Delete Limit" prefix="+antinuke roledell <limit>" slash="/antinuke limit type:role_delete amount:3" description="Set max role deletions (default: 3)" noprefix />
              <CommandCard name="Channel Delete Limit" prefix="+antinuke channeldell <limit>" slash="/antinuke limit type:channel_delete amount:3" description="Set max channel deletions (default: 3)" noprefix />
              <CommandCard name="Webhook Limit" prefix="+antinuke webhookl <limit>" slash="/antinuke limit type:webhook amount:5" description="Set max webhook creations (default: 5)" noprefix />
            </div>
          </div>
        );

      case 'automod':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Auto Moderation</h1>
            <p className="text-gray-400 text-lg mb-8">Automatically moderate messages with powerful filters.</p>

            <h2 className="text-2xl font-bold text-white mb-4">Configuration</h2>
            <div className="grid gap-4 mb-8">
              <CommandCard name="Automod Enable" prefix="+automod enable" slash="/automod enable" description="Enable auto-moderation system" noprefix />
              <CommandCard name="Automod Disable" prefix="+automod disable" slash="/automod disable" description="Disable auto-moderation system" noprefix />
              <CommandCard name="Automod Config" prefix="+automod config" slash="/automod config" description="View current automod configuration" noprefix />
              <CommandCard name="Automod Log" prefix="+automod log #channel" slash="/automod log channel:#channel" description="Set automod logging channel" noprefix />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Spam Protection</h2>
            <div className="grid gap-4 mb-8">
              <CommandCard name="Anti-Spam" prefix="+automod antispam <limit> <time>" slash="/automod antispam limit:5 window:10s" description="Detect repetitive messages (e.g., 5 msgs in 10s)" noprefix />
              <CommandCard name="Anti-Duplicate" prefix="+automod antidup <limit>" slash="/automod antidup limit:3" description="Detect duplicate messages" noprefix />
              <CommandCard name="Caps Limit" prefix="+automod caps <percentage>" slash="/automod caps limit:70" description="Limit excessive caps (default: 70%)" noprefix />
              <CommandCard name="Mention Limit" prefix="+automod mentions <limit>" slash="/automod mentions limit:5" description="Limit mass mentions (default: 5)" noprefix />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Content Filters</h2>
            <div className="grid gap-4">
              <CommandCard name="Bad Words" prefix="+automod badwords add <word>" slash="/automod badwords add word:text" description="Add word to filter list" aliases={['bw']} noprefix />
              <CommandCard name="Remove Bad Word" prefix="+automod badwords remove <word>" slash="/automod badwords remove word:text" description="Remove word from filter" noprefix />
              <CommandCard name="Bad Words List" prefix="+automod badwords list" slash="/automod badwords list" description="View filtered words list" noprefix />
              <CommandCard name="Link Protection" prefix="+automod links <enable|disable>" slash="/automod links toggle:true" description="Block all links" noprefix />
              <CommandCard name="Invite Protection" prefix="+automod invites <enable|disable>" slash="/automod invites toggle:true" description="Block Discord invites" noprefix />
              <CommandCard name="Whitelist Link" prefix="+automod whitelist <domain>" slash="/automod whitelist add domain:text" description="Whitelist a domain" premium noprefix />
            </div>
          </div>
        );

      case 'antibot':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Antibot Protection</h1>
            <p className="text-gray-400 text-lg mb-8">Prevent unauthorized bots from joining your server.</p>

            <div className="grid gap-4">
              <CommandCard name="Antibot Enable" prefix="+antibot enable" slash="/antibot enable" description="Enable bot protection" noprefix />
              <CommandCard name="Antibot Disable" prefix="+antibot disable" slash="/antibot disable" description="Disable bot protection" noprefix />
              <CommandCard name="Whitelist Bot" prefix="+antibot whitelist @bot" slash="/antibot whitelist add bot:@bot" description="Whitelist a trusted bot" noprefix />
              <CommandCard name="Unwhitelist Bot" prefix="+antibot unwhitelist @bot" slash="/antibot whitelist remove bot:@bot" description="Remove bot from whitelist" noprefix />
              <CommandCard name="Antibot Action" prefix="+antibot action <kick|ban>" slash="/antibot action type:kick" description="Set action for unauthorized bots" noprefix />
              <CommandCard name="Antibot Log" prefix="+antibot log #channel" slash="/antibot log channel:#channel" description="Set antibot logging channel" noprefix />
            </div>
          </div>
        );

      case 'autorole':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Autorole</h1>
            <p className="text-gray-400 text-lg mb-8">Automatically assign roles to new members.</p>

            <div className="grid gap-4">
              <CommandCard name="Autorole Setup" prefix="+autorole @role" slash="/autorole setup role:@role" description="Set autorole for new members" noprefix />
              <CommandCard name="Autorole Add" prefix="+autorole add @role" slash="/autorole add role:@role" description="Add another autorole" noprefix />
              <CommandCard name="Autorole Remove" prefix="+autorole remove @role" slash="/autorole remove role:@role" description="Remove an autorole" noprefix />
              <CommandCard name="Autorole List" prefix="+autorole list" slash="/autorole list" description="View all autoroles" noprefix />
              <CommandCard name="Autorole Clear" prefix="+autorole clear" slash="/autorole clear" description="Remove all autoroles" noprefix />
              <CommandCard name="Autorole Bots" prefix="+autorole bots @role" slash="/autorole bots role:@role" description="Set autorole for bots" premium noprefix />
            </div>
          </div>
        );

      case 'autoreact':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Autoreact</h1>
            <p className="text-gray-400 text-lg mb-8">Automatically add reactions to messages in specific channels.</p>

            <div className="grid gap-4">
              <CommandCard name="Autoreact Add" prefix="+autoreact add #channel 👍" slash="/autoreact add channel:#channel emoji:👍" description="Add autoreact to a channel" noprefix premium />
              <CommandCard name="Autoreact Remove" prefix="+autoreact remove #channel 👍" slash="/autoreact remove channel:#channel emoji:👍" description="Remove autoreact from channel" noprefix premium />
              <CommandCard name="Autoreact List" prefix="+autoreact list" slash="/autoreact list" description="View all autoreacts" premium />
              <CommandCard name="Autoreact Clear" prefix="+autoreact clear #channel" slash="/autoreact clear channel:#channel" description="Clear all autoreacts in channel" premium />
            </div>
          </div>
        );

      case 'auto-responder':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Auto Responder</h1>
            <p className="text-gray-400 text-lg mb-8">Create automatic responses to specific keywords or triggers.</p>

            <div className="grid gap-4">
              <CommandCard name="Autoresponder Add" prefix="+ar add <trigger> <response>" slash="/autoresponder add trigger:text response:text" description="Create auto response" aliases={['ar']} noprefix premium />
              <CommandCard name="Autoresponder Remove" prefix="+ar remove <trigger>" slash="/autoresponder remove trigger:text" description="Delete auto response" premium />
              <CommandCard name="Autoresponder List" prefix="+ar list" slash="/autoresponder list" description="View all autoresponders" premium />
              <CommandCard name="Autoresponder Edit" prefix="+ar edit <trigger> <new_response>" slash="/autoresponder edit trigger:text response:text" description="Edit existing response" premium />
              <CommandCard name="Autoresponder Clear" prefix="+ar clear" slash="/autoresponder clear" description="Delete all autoresponders" premium />
            </div>
          </div>
        );

      case 'sticky-messages':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Sticky Messages</h1>
            <p className="text-gray-400 text-lg mb-8">Pin important messages that stay at the bottom of channels.</p>

            <div className="grid gap-4">
              <CommandCard name="Sticky Add" prefix="+sticky add <message>" slash="/sticky add message:text" description="Create a sticky message in current channel" noprefix premium />
              <CommandCard name="Sticky Remove" prefix="+sticky remove" slash="/sticky remove" description="Remove sticky message from channel" premium />
              <CommandCard name="Sticky Edit" prefix="+sticky edit <message>" slash="/sticky edit message:text" description="Edit sticky message" premium />
              <CommandCard name="Sticky List" prefix="+sticky list" slash="/sticky list" description="View all sticky messages" premium />
            </div>
          </div>
        );

      case 'welcome-messages':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Welcome Messages</h1>
            <p className="text-gray-400 text-lg mb-8">Greet new members with custom welcome messages.</p>

            <div className="grid gap-4">
              <CommandCard name="Welcome Channel" prefix="+welcome channel #channel" slash="/welcome channel channel:#channel" description="Set welcome message channel" noprefix />
              <CommandCard name="Welcome Message" prefix="+welcome message <text>" slash="/welcome message text:message" description="Set welcome message text" noprefix />
              <CommandCard name="Welcome Embed" prefix="+welcome embed" slash="/welcome embed" description="Configure welcome embed" noprefix />
              <CommandCard name="Welcome Image" prefix="+welcome image <url>" slash="/welcome image url:text" description="Set welcome image background" premium />
              <CommandCard name="Welcome Test" prefix="+welcome test" slash="/welcome test" description="Test your welcome message" noprefix />
              <CommandCard name="Welcome Disable" prefix="+welcome disable" slash="/welcome disable" description="Disable welcome messages" noprefix />
              <CommandCard name="Welcome Variables" prefix="+welcome variables" slash="/welcome variables" description="View available variables" />
            </div>

            <div className="mt-8 bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/40 hover:border-cyan-500/30 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-3">Available Variables</h3>
              <code className="text-sm text-gray-300 font-mono block space-y-1">
                <div className="text-sky-400 hover:text-sky-300 transition-colors">{`{user}`}</div> - Mentions the user<br />
                <div className="text-sky-400 hover:text-sky-300 transition-colors">{`{username}`}</div> - User's name<br />
                <div className="text-sky-400 hover:text-sky-300 transition-colors">{`{user.tag}`}</div> - User's name#discriminator<br />
                <div className="text-sky-400 hover:text-sky-300 transition-colors">{`{server}`}</div> - Server name<br />
                <div className="text-sky-400 hover:text-sky-300 transition-colors">{`{membercount}`}</div> - Total members<br />
                <div className="text-sky-400 hover:text-sky-300 transition-colors">{`{server.owner}`}</div> - Server owner
              </code>
            </div>
          </div>
        );

      case 'boost-messages':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Boost Messages</h1>
            <p className="text-gray-400 text-lg mb-8">Thank your server boosters with custom boost messages.</p>

            <div className="grid gap-4">
              <CommandCard name="Boost Channel" prefix="+boost channel #channel" slash="/boost channel channel:#channel" description="Set boost message channel" noprefix />
              <CommandCard name="Boost Message" prefix="+boost message <text>" slash="/boost message text:message" description="Set boost message text" noprefix />
              <CommandCard name="Boost Embed" prefix="+boost embed" slash="/boost embed" description="Configure boost embed" noprefix />
              <CommandCard name="Boost Test" prefix="+boost test" slash="/boost test" description="Test boost message" noprefix />
              <CommandCard name="Boost Disable" prefix="+boost disable" slash="/boost disable" description="Disable boost messages" noprefix />
            </div>
          </div>
        );

      case 'leave-messages':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Leave Messages</h1>
            <p className="text-gray-400 text-lg mb-8">Say goodbye to members who leave your server.</p>

            <div className="grid gap-4">
              <CommandCard name="Leave Channel" prefix="+leave channel #channel" slash="/leave channel channel:#channel" description="Set leave message channel" noprefix premium />
              <CommandCard name="Leave Message" prefix="+leave message <text>" slash="/leave message text:message" description="Set leave message text" premium />
              <CommandCard name="Leave Test" prefix="+leave test" slash="/leave test" description="Test leave message" premium />
              <CommandCard name="Leave Disable" prefix="+leave disable" slash="/leave disable" description="Disable leave messages" premium />
            </div>
          </div>
        );

      case 'voice-master':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Voice Master</h1>
            <p className="text-gray-400 text-lg mb-8">Create and manage temporary voice channels.</p>

            <h2 className="text-2xl font-bold text-white mb-4">Setup</h2>
            <div className="grid gap-4 mb-8">
              <CommandCard name="Voice Master Setup" prefix="+voicemaster setup" slash="/voicemaster setup" description="Create Voice Master channel" noprefix />
              <CommandCard name="Voice Master Delete" prefix="+voicemaster delete" slash="/voicemaster delete" description="Delete Voice Master setup" noprefix />
              <CommandCard name="Voice Master Config" prefix="+voicemaster config" slash="/voicemaster config" description="View Voice Master configuration" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Voice Channel Commands</h2>
            <div className="grid gap-4">
              <CommandCard name="VC Lock" prefix="+vc lock" slash="/vc lock" description="Lock your voice channel" noprefix />
              <CommandCard name="VC Unlock" prefix="+vc unlock" slash="/vc unlock" description="Unlock your voice channel" noprefix />
              <CommandCard name="VC Hide" prefix="+vc hide" slash="/vc hide" description="Hide your voice channel" noprefix />
              <CommandCard name="VC Unhide" prefix="+vc unhide" slash="/vc unhide" description="Unhide your voice channel" noprefix />
              <CommandCard name="VC Rename" prefix="+vc rename <name>" slash="/vc rename name:text" description="Rename your voice channel" noprefix />
              <CommandCard name="VC Limit" prefix="+vc limit <number>" slash="/vc limit amount:5" description="Set user limit" noprefix />
              <CommandCard name="VC Bitrate" prefix="+vc bitrate <kbps>" slash="/vc bitrate amount:64" description="Change voice bitrate" premium />
              <CommandCard name="VC Claim" prefix="+vc claim" slash="/vc claim" description="Claim ownership of channel" noprefix />
              <CommandCard name="VC Transfer" prefix="+vc transfer @user" slash="/vc transfer user:@user" description="Transfer channel ownership" noprefix />
              <CommandCard name="VC Permit" prefix="+vc permit @user" slash="/vc permit user:@user" description="Grant access to user" noprefix />
              <CommandCard name="VC Reject" prefix="+vc reject @user" slash="/vc reject user:@user" description="Deny access to user" noprefix />
              <CommandCard name="VC Delete" prefix="+vc delete" slash="/vc delete" description="Delete your voice channel" noprefix />
            </div>
          </div>
        );

      case 'voice-roles':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Voice Roles</h1>
            <p className="text-gray-400 text-lg mb-8">Automatically assign roles when users join voice channels.</p>

            <div className="grid gap-4">
              <CommandCard name="Voice Role Add" prefix="+voicerole add <voice_channel> @role" slash="/voicerole add channel:voice role:@role" description="Add voice role for channel" noprefix premium />
              <CommandCard name="Voice Role Remove" prefix="+voicerole remove <voice_channel>" slash="/voicerole remove channel:voice" description="Remove voice role" premium />
              <CommandCard name="Voice Role List" prefix="+voicerole list" slash="/voicerole list" description="View all voice roles" premium />
              <CommandCard name="Voice Role Clear" prefix="+voicerole clear" slash="/voicerole clear" description="Remove all voice roles" premium />
            </div>
          </div>
        );

      case 'role-management':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Role Management</h1>
            <p className="text-gray-400 text-lg mb-8">Manage server roles and permissions.</p>

            <div className="grid gap-4">
              <CommandCard name="Role Create" prefix="+role create <name>" slash="/role create name:text" description="Create a new role" noprefix />
              <CommandCard name="Role Delete" prefix="+role delete @role" slash="/role delete role:@role" description="Delete a role" noprefix />
              <CommandCard name="Role Edit" prefix="+role edit @role <option> <value>" slash="/role edit role:@role" description="Edit role properties" noprefix />
              <CommandCard name="Role Info" prefix="+roleinfo @role" slash="/roleinfo role:@role" description="View role information" aliases={['ri']} />
              <CommandCard name="Role Members" prefix="+role members @role" slash="/role members role:@role" description="List members with role" />
              <CommandCard name="Role All" prefix="+roleall @role" slash="/roleall role:@role" description="Give role to all members" premium vote />
              <CommandCard name="Role Humans" prefix="+rolehumans @role" slash="/rolehumans role:@role" description="Give role to all humans" premium vote />
              <CommandCard name="Role Bots" prefix="+rolebots @role" slash="/rolebots role:@role" description="Give role to all bots" premium vote />
              <CommandCard name="Remove Role All" prefix="+removeroleall @role" slash="/removeroleall role:@role" description="Remove role from everyone" premium vote />
            </div>
          </div>
        );

      case 'custom-roles':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Custom Roles</h1>
            <p className="text-gray-400 text-lg mb-8">Create and manage custom roles with special features.</p>

            <div className="grid gap-4">
              <CommandCard name="Custom Role Create" prefix="+customrole create <name>" slash="/customrole create name:text" description="Create a custom role with color picker" premium />
              <CommandCard name="Custom Role Color" prefix="+customrole color @role #hex" slash="/customrole color role:@role hex:#FF0000" description="Change role color" premium />
              <CommandCard name="Custom Role Icon" prefix="+customrole icon @role <emoji>" slash="/customrole icon role:@role emoji:🔥" description="Set role icon" premium />
            </div>
          </div>
        );

      case 'reaction-roles':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Reaction Roles</h1>
            <p className="text-gray-400 text-lg mb-8">Let members self-assign roles via reactions.</p>

            <div className="grid gap-4">
              <CommandCard name="Reaction Role Setup" prefix="+rr setup" slash="/reactionrole setup" description="Interactive reaction role setup" noprefix premium />
              <CommandCard name="Reaction Role Add" prefix="+rr add <message_id> <emoji> @role" slash="/reactionrole add message:id emoji:emoji role:@role" description="Add reaction role" premium />
              <CommandCard name="Reaction Role Remove" prefix="+rr remove <message_id> <emoji>" slash="/reactionrole remove message:id emoji:emoji" description="Remove reaction role" premium />
              <CommandCard name="Reaction Role List" prefix="+rr list" slash="/reactionrole list" description="View all reaction roles" premium />
              <CommandCard name="Reaction Role Clear" prefix="+rr clear <message_id>" slash="/reactionrole clear message:id" description="Clear all reactions from message" premium />
            </div>
          </div>
        );

      case 'utility-info':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Information Commands</h1>
            <p className="text-gray-400 text-lg mb-8">Get information about users, servers, and more.</p>

            <div className="grid gap-4">
              <CommandCard name="User Info" prefix="+userinfo [@user]" slash="/userinfo user:@user" description="View user information" aliases={['ui', 'whois']} />
              <CommandCard name="Server Info" prefix="+serverinfo" slash="/serverinfo" description="View server information" aliases={['si', 'guildinfo']} />
              <CommandCard name="Avatar" prefix="+avatar [@user]" slash="/avatar user:@user" description="View user's avatar" aliases={['av', 'pfp']} />
              <CommandCard name="Banner" prefix="+banner [@user]" slash="/banner user:@user" description="View user's banner" premium />
              <CommandCard name="Role Info" prefix="+roleinfo @role" slash="/roleinfo role:@role" description="View role information" aliases={['ri']} />
              <CommandCard name="Channel Info" prefix="+channelinfo [#channel]" slash="/channelinfo channel:#channel" description="View channel information" aliases={['ci']} />
              <CommandCard name="Emoji Info" prefix="+emojiinfo <emoji>" slash="/emojiinfo emoji:emoji" description="View emoji information" aliases={['ei']} />
              <CommandCard name="Bot Info" prefix="+botinfo" slash="/botinfo" description="View bot statistics and information" aliases={['bi', 'stats']} />
              <CommandCard name="Ping" prefix="+ping" slash="/ping" description="Check bot latency" />
              <CommandCard name="Uptime" prefix="+uptime" slash="/uptime" description="Check bot uptime" />
            </div>
          </div>
        );

      case 'utility-tools':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Utility Tools</h1>
            <p className="text-gray-400 text-lg mb-8">Helpful utility commands for server management.</p>

            <div className="grid gap-4">
              <CommandCard name="Embed" prefix="+embed <json>" slash="/embed json:text" description="Create custom embed message" premium />
              <CommandCard name="Say" prefix="+say <message>" slash="/say message:text" description="Make bot say something" noprefix />
              <CommandCard name="Announce" prefix="+announce #channel <message>" slash="/announce channel:#channel message:text" description="Send announcement" noprefix premium />
              <CommandCard name="Poll" prefix="+poll <question>" slash="/poll question:text" description="Create a poll" premium />
              <CommandCard name="Giveaway" prefix="+giveaway" slash="/giveaway" description="Start a giveaway" premium vote />
              <CommandCard name="Remind" prefix="+remind <time> <message>" slash="/remind time:1h message:text" description="Set a reminder" vote />
              <CommandCard name="Translate" prefix="+translate <lang> <text>" slash="/translate language:es text:message" description="Translate text" vote />
              <CommandCard name="Calculator" prefix="+calc <expression>" slash="/calc expression:2+2" description="Calculate math expression" aliases={['calculate']} />
              <CommandCard name="Invite Tracker" prefix="+invites [@user]" slash="/invites user:@user" description="Track member invites" premium />
              <CommandCard name="Afk" prefix="+afk [reason]" slash="/afk reason:text" description="Set AFK status" />
            </div>
          </div>
        );

      case 'utility-fun':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Fun Commands</h1>
            <p className="text-gray-400 text-lg mb-8">Entertainment and fun commands for your server.</p>

            <div className="grid gap-4">
              <CommandCard name="8ball" prefix="+8ball <question>" slash="/8ball question:text" description="Ask the magic 8ball" />
              <CommandCard name="Meme" prefix="+meme" slash="/meme" description="Get a random meme" />
              <CommandCard name="Joke" prefix="+joke" slash="/joke" description="Get a random joke" />
              <CommandCard name="Dog" prefix="+dog" slash="/dog" description="Get a random dog picture" />
              <CommandCard name="Cat" prefix="+cat" slash="/cat" description="Get a random cat picture" />
              <CommandCard name="Flip" prefix="+flip" slash="/flip" description="Flip a coin" aliases={['coinflip']} />
              <CommandCard name="Dice" prefix="+dice" slash="/dice" description="Roll a dice" aliases={['roll']} />
              <CommandCard name="Slap" prefix="+slap @user" slash="/slap user:@user" description="Slap a user" vote />
              <CommandCard name="Hug" prefix="+hug @user" slash="/hug user:@user" description="Hug a user" vote />
              <CommandCard name="Kiss" prefix="+kiss @user" slash="/kiss user:@user" description="Kiss a user" vote />
            </div>
          </div>
        );

      case 'server-config':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Server Configuration</h1>
            <p className="text-gray-400 text-lg mb-8">Configure bot settings for your server.</p>

            <div className="grid gap-4">
              <CommandCard name="Prefix" prefix="+prefix <new_prefix>" slash="/prefix new:!" description="Change bot command prefix" noprefix />
              <CommandCard name="Setup" prefix="+setup" slash="/setup" description="Interactive server setup wizard" noprefix />
              <CommandCard name="Config" prefix="+config" slash="/config" description="View current server configuration" aliases={['settings']} />
              <CommandCard name="Language" prefix="+language <lang>" slash="/language code:en" description="Change bot language" premium />
              <CommandCard name="Timezone" prefix="+timezone <zone>" slash="/timezone zone:UTC" description="Set server timezone" premium />
              <CommandCard name="Reset" prefix="+reset" slash="/reset" description="Reset all bot settings" noprefix />
            </div>
          </div>
        );

      case 'logging':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Server Logging</h1>
            <p className="text-gray-400 text-lg mb-8">Track and log server events.</p>

            <div className="grid gap-4">
              <CommandCard name="Log Channel" prefix="+log channel #channel" slash="/log channel channel:#channel" description="Set main logging channel" noprefix />
              <CommandCard name="Log Message" prefix="+log message #channel" slash="/log message channel:#channel" description="Set message log channel" noprefix premium />
              <CommandCard name="Log Member" prefix="+log member #channel" slash="/log member channel:#channel" description="Set member log channel" noprefix premium />
              <CommandCard name="Log Server" prefix="+log server #channel" slash="/log server channel:#channel" description="Set server log channel" noprefix premium />
              <CommandCard name="Log Voice" prefix="+log voice #channel" slash="/log voice channel:#channel" description="Set voice log channel" premium />
              <CommandCard name="Log Disable" prefix="+log disable <type>" slash="/log disable type:message" description="Disable specific log type" noprefix />
              <CommandCard name="Log Config" prefix="+log config" slash="/log config" description="View logging configuration" />
            </div>
          </div>
        );

      case 'ignore-channels':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Ignore Channels</h1>
            <p className="text-gray-400 text-lg mb-8">Exclude channels from bot moderation and commands.</p>

            <div className="grid gap-4">
              <CommandCard name="Ignore Add" prefix="+ignore #channel" slash="/ignore add channel:#channel" description="Ignore channel from moderation" noprefix />
              <CommandCard name="Unignore" prefix="+unignore #channel" slash="/ignore remove channel:#channel" description="Remove channel from ignore list" noprefix />
              <CommandCard name="Ignore List" prefix="+ignore list" slash="/ignore list" description="View ignored channels" />
              <CommandCard name="Ignore Clear" prefix="+ignore clear" slash="/ignore clear" description="Clear all ignored channels" />
            </div>
          </div>
        );

      case 'extra-access':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Extra Access</h1>
            <p className="text-gray-400 text-lg mb-8">Grant extra permissions to specific users or roles.</p>

            <div className="grid gap-4">
              <CommandCard name="Extra Owner Add" prefix="+extraowner add @user" slash="/extraowner add user:@user" description="Add extra owner (full permissions)" noprefix premium />
              <CommandCard name="Extra Owner Remove" prefix="+extraowner remove @user" slash="/extraowner remove user:@user" description="Remove extra owner" premium />
              <CommandCard name="Extra Admin Add" prefix="+extraadmin add @user" slash="/extraadmin add user:@user" description="Add extra admin" noprefix premium />
              <CommandCard name="Extra Admin Remove" prefix="+extraadmin remove @user" slash="/extraadmin remove user:@user" description="Remove extra admin" premium />
              <CommandCard name="Extra List" prefix="+extra list" slash="/extra list" description="View all extra access users" premium />
              <CommandCard name="Extra Clear" prefix="+extra clear" slash="/extra clear" description="Remove all extra access" premium />
            </div>
          </div>
        );

      case 'no-prefix':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">No Prefix (NP) Mode</h1>
            <p className="text-gray-400 text-lg mb-8">Allow specific users to use commands without prefix.</p>

            <Alert type="info">
              <strong>💡 Note:</strong> No Prefix mode is a premium feature that allows trusted users to execute commands without typing the prefix.
            </Alert>

            <div className="grid gap-4">
              <CommandCard name="NP Add" prefix="+np add @user" slash="/noprefix add user:@user" description="Grant no-prefix access to user" noprefix premium />
              <CommandCard name="NP Remove" prefix="+np remove @user" slash="/noprefix remove user:@user" description="Revoke no-prefix access" premium />
              <CommandCard name="NP List" prefix="+np list" slash="/noprefix list" description="View users with no-prefix access" premium />
              <CommandCard name="NP Clear" prefix="+np clear" slash="/noprefix clear" description="Remove all no-prefix users" premium />
            </div>
          </div>
        );

      case 'premium-features':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4 flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-400 animate-pulse" />
              Premium Features
            </h1>
            <p className="text-gray-400 text-lg mb-8">Unlock advanced features with Zyphra Premium.</p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { title: 'No Prefix Mode', desc: 'Allow trusted users to use commands without prefix', icon: <Zap /> },
                { title: 'Custom Embeds', desc: 'Create beautiful custom embed messages', icon: <Sparkles /> },
                { title: 'Advanced Automod', desc: 'Enhanced spam protection and filters', icon: <Shield /> },
                { title: 'Reaction Roles', desc: 'Unlimited reaction role setups', icon: <Star /> },
                { title: 'Autoreact', desc: 'Automatic reactions on messages', icon: <Smile /> },
                { title: 'Voice Roles', desc: 'Auto-assign roles in voice channels', icon: <Volume2 /> },
                { title: 'Leave Messages', desc: 'Custom goodbye messages', icon: <MessageSquare /> },
                { title: 'Welcome Images', desc: 'Custom welcome card backgrounds', icon: <Image /> },
                { title: 'Priority Support', desc: '24/7 priority support', icon: <Heart /> },
                { title: 'No Ads', desc: 'Ad-free experience', icon: <Ban /> },
                { title: 'Extra Limits', desc: 'Higher limits for all features', icon: <Trophy /> },
                { title: 'Custom Branding', desc: 'Personalize bot appearance', icon: <Crown /> },
              ].map((feature, idx) => (
                <div key={idx} className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-yellow-500/30 rounded-2xl p-6 hover:border-yellow-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/25 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-black text-white mb-3">Upgrade to Premium</h2>
              <p className="text-gray-400 mb-6">Starting at $4.99/month • 7-day free trial</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="https://zyphra.xyz/premium"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/40 active:scale-95"
                >
                  <Crown className="w-5 h-5" />
                  Get Premium
                </a>
                <a
                  href="https://zyphra.xyz/premium#pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        );

      case 'premium-commands':
        return (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-white mb-4">Premium Commands</h1>
            <p className="text-gray-400 text-lg mb-8">Exclusive commands available only for premium servers.</p>

            <Alert type="info">
              <strong>👑 Premium Required:</strong> These commands are only available after upgrading to Zyphra Premium. <a href="https://zyphra.xyz/premium" className="text-sky-400 hover:underline">Learn more</a>
            </Alert>

            <div className="grid gap-4">
              <CommandCard name="Custom Bot" prefix="+custombot" slash="/custombot" description="Customize bot name and avatar" premium />
              <CommandCard name="Custom Embed" prefix="+embed builder" slash="/embed builder" description="Visual embed builder" premium />
              <CommandCard name="Advanced Stats" prefix="+stats advanced" slash="/stats advanced" description="Detailed server analytics" premium />
              <CommandCard name="Backup Create" prefix="+backup create" slash="/backup create" description="Create server backup" premium />
              <CommandCard name="Backup Load" prefix="+backup load <id>" slash="/backup load id:text" description="Load server backup" premium />
              <CommandCard name="Custom Commands" prefix="+customcmd add" slash="/customcmd add" description="Create custom commands" premium />
              <CommandCard name="AI Moderation" prefix="+aimod enable" slash="/aimod enable" description="AI-powered content moderation" premium />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-20 animate-fadeIn">
            <Package className="w-20 h-20 text-gray-600 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Section Coming Soon</h2>
            <p className="text-gray-500">This documentation section is currently being written.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background System - Black with #493fff Circle and Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main #493fff circle glow */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-40"
          style={{
            background: 'radial-gradient(circle, #493fff 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Glassmorphism overlay - white to light black gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.6) 100%)'
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(73,63,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(73,63,255,0.3) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-[#493fff]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-[#493fff] to-[#7c6fff] rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-[#493fff]/50">
                <img src={logo} alt="Zyphra Logo" className="w-12 h-12 text" />
              </div>
              <div>
                <h1 className="text-xl font-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#493fff] group-hover:to-[#7c6fff] transition-all duration-300">Zyphra Docs</h1>
                <p className="text-xs text-gray-400">v2.0.0</p>
              </div>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:scale-105 transition-all duration-300 hover:bg-gray-800/70"
                />

                {showSearchResults && searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                    <div className="p-2">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchSelect(result.id)}
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">{result.title}</p>
                              <p className="text-gray-400 text-xs">{result.section}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://discord.gg/zyphra"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#493fff] to-[#7c6fff] hover:from-[#5a4fff] hover:to-[#8a7fff] rounded-lg font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-[#493fff]/50 active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                Discord
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar with Collapsible Sections */}
          <aside className={`
            ${mobileMenuOpen ? 'block' : 'hidden'} md:block
            fixed md:sticky top-16 left-0 right-0 md:top-24 h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]
            w-full md:w-64 flex-shrink-0
            bg-black/95 md:bg-transparent
            z-40 md:z-0
            overflow-y-auto
            p-4 md:p-0
          `}>
            <nav className="space-y-2">
              {navigation.map((section) => (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-500 group
                      ${activeSection === section.id || section.children?.some(c => c.id === activeSection)
                        ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50 hover:text-white hover:scale-105'
                      }
                    `}
                  >
                    <div className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                      {section.icon}
                    </div>
                    <span className="flex-1 text-left">{section.title}</span>
                    {section.children && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${expandedSections.has(section.id) ? 'rotate-180' : 'rotate-0'
                        }`} />
                    )}
                  </button>

                  {/* Collapsible Children */}
                  {section.children && (
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.has(section.id)
                          ? 'max-h-96 opacity-100 mt-2'
                          : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="ml-4 space-y-1 border-l-2 border-gray-800 pl-4">
                        {section.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setActiveSection(child.id)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105
                              ${activeSection === child.id
                                ? 'text-sky-400 font-semibold bg-blue-500/10 scale-105 shadow-md shadow-blue-500/10'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                              }
                            `}
                          >
                            {child.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-invert max-w-none">
              {renderContent()}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <p>© 2025 Zyphra. All rights reserved.</p>
                <div className="flex gap-4">
                  <a href="https://zyphra.xyz/terms" className="hover:text-sky-400 transition-all duration-300 hover:scale-110">Terms</a>
                  <a href="https://zyphra.xyz/privacy" className="hover:text-sky-400 transition-all duration-300 hover:scale-110">Privacy</a>
                  <a href="https://discord.gg/zyphra" className="hover:text-sky-400 transition-all duration-300 hover:scale-110">Support</a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Documentation;
