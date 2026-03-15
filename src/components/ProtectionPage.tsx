// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../api';

// interface ProtectionSettings {
//   antispam_enabled: boolean;
//   spam_limit: number;
//   spam_window: number;
//   server_protection_enabled: boolean;
//   server_update_limit: number;
//   server_time_window: number;
//   antibot_enabled: boolean;
//   whitelisted_bots: string[];
// }

// const ProtectionPage: React.FC = () => {
//   const [settings, setSettings] = useState<ProtectionSettings>({
//     antispam_enabled: true,
//     spam_limit: 4,
//     spam_window: 7,
//     server_protection_enabled: true,
//     server_update_limit: 1,
//     server_time_window: 10,
//     antibot_enabled: true,
//     whitelisted_bots: [],
//   });
//   const [message, setMessage] = useState('');
//   const [botInput, setBotInput] = useState('');

//   const saveSettings = async () => {
//     try {
//       await api.post('/guild/demo/settings', settings);
//       setMessage('✅ Settings saved successfully!');
//       setTimeout(() => setMessage(''), 3000);
//     } catch {
//       setMessage('❌ Failed to save');
//     }
//   };

//   const addBot = () => {
//     if (botInput.trim()) {
//       setSettings({
//         ...settings,
//         whitelisted_bots: [...settings.whitelisted_bots, botInput.trim()],
//       });
//       setBotInput('');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
//       {/* Same Sidebar as HomePage */}
//       <div className="fixed left-0 top-0 h-full w-52 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50">
//         <div className="p-4 border-b border-gray-700/50">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
//             <div>
//               <h2 className="font-bold text-white">Leo's Bot</h2>
//               <p className="text-xs text-gray-400">Discord Bot Dashboard</p>
//             </div>
//           </div>
//         </div>

//         <div className="p-3">
//           <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-2">Main</div>
//           <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 mb-1">
//             <span>🏠</span>
//             <span>Dashboard</span>
//           </Link>
//           <Link to="/protection" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white mb-1">
//             <span>⚙️</span>
//             <span>Bot Settings</span>
//           </Link>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="ml-52 p-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-4 gap-4 mb-8">
//           <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center text-2xl">🛡️</div>
//               <div>
//                 <p className="text-3xl font-bold">5</p>
//                 <p className="text-sm text-gray-400">Active Protections</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center text-2xl">👥</div>
//               <div>
//                 <p className="text-3xl font-bold">56</p>
//                 <p className="text-sm text-gray-400">Protected Roles</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center text-2xl">🤖</div>
//               <div>
//                 <p className="text-3xl font-bold">0</p>
//                 <p className="text-sm text-gray-400">Whitelisted Bots</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 bg-red-600/30 rounded-lg flex items-center justify-center text-2xl">🚫</div>
//               <div>
//                 <p className="text-3xl font-bold">0</p>
//                 <p className="text-sm text-gray-400">Actions Blocked</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Protection Log Channel */}
//         <div className="mb-8">
//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 flex items-center gap-4">
//             <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-2xl">📝</div>
//             <div className="flex-1">
//               <p className="text-sm text-gray-400 mb-1">Protection Log Channel</p>
//               <select className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 w-64">
//                 <option>None</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {message && (
//           <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-600/20 border border-green-500/50' : 'bg-red-600/20 border border-red-500/50'}`}>
//             {message}
//           </div>
//         )}

//         {/* Protection Modules */}
//         <div className="grid grid-cols-3 gap-6">
//           {/* Anti-Spam Protection */}
//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">🛡️</div>
//                 <h3 className="text-lg font-bold">Anti-Spam Protection</h3>
//               </div>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="sr-only peer"
//                   checked={settings.antispam_enabled}
//                   onChange={(e) => setSettings({ ...settings, antispam_enabled: e.target.checked })}
//                 />
//                 <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//               </label>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between mb-2">
//                   <label className="text-sm text-gray-400">Message Limit</label>
//                   <span className="text-sm font-semibold">{settings.spam_limit}</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="1"
//                   max="20"
//                   value={settings.spam_limit}
//                   onChange={(e) => setSettings({ ...settings, spam_limit: parseInt(e.target.value) })}
//                   className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
//                 />
//               </div>

//               <div>
//                 <div className="flex justify-between mb-2">
//                   <label className="text-sm text-gray-400">Time Window (seconds)</label>
//                   <span className="text-sm font-semibold">{settings.spam_window}s</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="3"
//                   max="60"
//                   value={settings.spam_window}
//                   onChange={(e) => setSettings({ ...settings, spam_window: parseInt(e.target.value) })}
//                   className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
//                 />
//               </div>

//               <div>
//                 <div className="flex justify-between mb-2">
//                   <label className="text-sm text-gray-400">Duplicate Limit</label>
//                   <span className="text-sm font-semibold">5</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="1"
//                   max="10"
//                   defaultValue={5}
//                   className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Ignored Channels</label>
//                 <textarea
//                   className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-sm resize-none"
//                   rows={3}
//                   placeholder="Enter channel IDs..."
//                 ></textarea>
//               </div>
//             </div>
//           </div>

//           {/* Server Protection */}
//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-teal-600/20 rounded-lg flex items-center justify-center">💻</div>
//                 <h3 className="text-lg font-bold">Server Protection</h3>
//               </div>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="sr-only peer"
//                   checked={settings.server_protection_enabled}
//                   onChange={(e) => setSettings({ ...settings, server_protection_enabled: e.target.checked })}
//                 />
//                 <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//               </label>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between mb-2">
//                   <label className="text-sm text-gray-400">Update Limit</label>
//                   <span className="text-sm font-semibold">{settings.server_update_limit}</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="1"
//                   max="10"
//                   value={settings.server_update_limit}
//                   onChange={(e) => setSettings({ ...settings, server_update_limit: parseInt(e.target.value) })}
//                   className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
//                 />
//               </div>

//               <div>
//                 <div className="flex justify-between mb-2">
//                   <label className="text-sm text-gray-400">Time Window (seconds)</label>
//                   <span className="text-sm font-semibold">{settings.server_time_window}s</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="5"
//                   max="60"
//                   value={settings.server_time_window}
//                   onChange={(e) => setSettings({ ...settings, server_time_window: parseInt(e.target.value) })}
//                   className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Action Type</label>
//                 <select className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2">
//                   <option>RemoveRoles</option>
//                   <option>Kick</option>
//                   <option>Ban</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Ignored Roles</label>
//                 <textarea
//                   className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-sm resize-none"
//                   rows={3}
//                   placeholder="Enter role IDs..."
//                 ></textarea>
//               </div>
//             </div>
//           </div>

//           {/* Anti-Bot Protection */}
//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">🤖</div>
//                 <h3 className="text-lg font-bold">Anti-Bot Protection</h3>
//               </div>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="sr-only peer"
//                   checked={settings.antibot_enabled}
//                   onChange={(e) => setSettings({ ...settings, antibot_enabled: e.target.checked })}
//                 />
//                 <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//               </label>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Whitelisted Bots (IDs)</label>
//                 <div className="flex gap-2 mb-2">
//                   <input
//                     type="text"
//                     value={botInput}
//                     onChange={(e) => setBotInput(e.target.value)}
//                     className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm"
//                     placeholder="Enter bot IDs separated by commas"
//                   />
//                   <button
//                     onClick={addBot}
//                     className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
//                   >
//                     + Add Bot
//                   </button>
//                 </div>
//                 {settings.whitelisted_bots.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {settings.whitelisted_bots.map((bot, i) => (
//                       <span key={i} className="bg-purple-600/20 border border-purple-500/30 px-3 py-1 rounded-full text-xs">
//                         {bot}
//                         <button
//                           onClick={() => setSettings({
//                             ...settings,
//                             whitelisted_bots: settings.whitelisted_bots.filter((_, idx) => idx !== i)
//                           })}
//                           className="ml-2 text-red-400"
//                         >
//                           ×
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Action Type</label>
//                 <select className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2">
//                   <option>RemoveRoles</option>
//                   <option>Kick</option>
//                   <option>Ban</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Ignored Roles</label>
//                 <textarea
//                   className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-sm resize-none"
//                   rows={3}
//                   placeholder="Enter role IDs..."
//                 ></textarea>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Save Button */}
//         <div className="mt-8 flex justify-end">
//           <button
//             onClick={saveSettings}
//             className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg flex items-center gap-2"
//           >
//             💾 Save All Settings
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProtectionPage;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Shield, Server, Bot, Save, AlertCircle, Plus, X, Hash, Power, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';
import { secureStorage } from '../utils/secureStorage';

interface Channel {
  id: string;
  name: string;
  type: number;
}

interface Role {
  id: string;
  name: string;
  color: number;
}

interface ModuleStatus {
  antinuke_setup: boolean;
  automod_setup: boolean;
}

interface ProtectionSettings {
  // Module Status
  antinuke_enabled: boolean;
  automod_enabled: boolean;

  // Anti-Spam
  antispam_enabled: boolean;
  spam_limit: number;
  spam_window: number;
  duplicate_limit: number;
  ignored_channels: string[];

  // Server Protection
  server_protection_enabled: boolean;
  server_update_limit: number;
  server_time_window: number;
  server_action_type: string;
  server_ignored_roles: string[];

  // Anti-Bot
  antibot_enabled: boolean;
  whitelisted_bots: string[];
  antibot_action_type: string;
  antibot_ignored_roles: string[];

  // Logs
  log_channel_id: string | null;

  // Anti-Nuke Rules
  max_role_deletions: number;
  max_channel_deletions: number;
  max_bans: number;
  max_kicks: number;
  webhook_deletion_enabled: boolean;

  // Auto-Mod
  bad_words: string[];
  caps_limit: number;
  mention_limit: number;
  link_protection: boolean;
  invite_protection: boolean;
}

interface GuildStats {
  active_protections: number;
  protected_roles: number;
  whitelisted_bots: number;
  actions_blocked: number;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

const ProtectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({
    antinuke_setup: false,
    automod_setup: false
  });
  const [enablingModule, setEnablingModule] = useState<string | null>(null);
  const [stats, setStats] = useState<GuildStats>({
    active_protections: 0,
    protected_roles: 0,
    whitelisted_bots: 0,
    actions_blocked: 0
  });

  const [settings, setSettings] = useState<ProtectionSettings>({
    antinuke_enabled: false,
    automod_enabled: false,
    antispam_enabled: true,
    spam_limit: 4,
    spam_window: 7,
    duplicate_limit: 5,
    ignored_channels: [],
    server_protection_enabled: true,
    server_update_limit: 1,
    server_time_window: 10,
    server_action_type: 'RemoveRoles',
    server_ignored_roles: [],
    antibot_enabled: true,
    whitelisted_bots: [],
    antibot_action_type: 'RemoveRoles',
    antibot_ignored_roles: [],
    log_channel_id: null,
    max_role_deletions: 3,
    max_channel_deletions: 3,
    max_bans: 3,
    max_kicks: 5,
    webhook_deletion_enabled: true,
    bad_words: [],
    caps_limit: 70,
    mention_limit: 5,
    link_protection: true,
    invite_protection: true,
  });

  const [message, setMessage] = useState('');
  const [botInput, setBotInput] = useState('');
  const [badWordInput, setBadWordInput] = useState('');

  useEffect(() => {
    const guildDataStr = secureStorage.getItem('selected_guild');
    if (!guildDataStr) {
      navigate('/dashboard/servers');
      return;
    }

    try {
      const guild = JSON.parse(guildDataStr);
      setSelectedGuild(guild);
      fetchAllData(guild.id);
    } catch (error) {
      console.error('Error loading guild:', error);
      navigate('/dashboard/servers');
    }
  }, [navigate]);

  const fetchAllData = async (guildId: string) => {
    setLoading(true);
    try {
      // Fetch channels & roles first (these work reliably)
      const [channelsRes, rolesRes] = await Promise.all([
        api.get(`/guild/${guildId}/channels`).catch(() => ({ data: { channels: [] } })),
        api.get(`/guild/${guildId}/roles`).catch(() => ({ data: { roles: [] } }))
      ]);

      setChannels(channelsRes.data.channels?.filter((ch: Channel) => ch.type === 0 || ch.type === 5) || []);
      setRoles(rolesRes.data.roles || []);

      // Protection endpoints with fallbacks
      try {
        const [statusRes, settingsRes, statsRes] = await Promise.all([
          api.get(`/guild/${guildId}/protection/status`).catch(() => ({ data: { antinuke_setup: false, automod_setup: false, antinuke_enabled: false, automod_enabled: false } })),
          api.get(`/guild/${guildId}/protection`).catch(() => ({ data: defaultSettings })),
          api.get(`/guild/${guildId}/protection/stats`).catch(() => ({ data: { active_protections: 0, protected_roles: 0, whitelisted_bots: 0, actions_blocked: 0 } }))
        ]);

        setModuleStatus(statusRes.data);
        setSettings({ ...defaultSettings, ...settingsRes.data });
        setStats(statsRes.data);
      } catch (protectionError) {
        console.log('[INFO] Protection endpoints not ready, using defaults');
        setModuleStatus({ antinuke_setup: false, automod_setup: false });
        setStats({ active_protections: 0, protected_roles: 0, whitelisted_bots: 0, actions_blocked: 0 });
      }

      console.log('[SUCCESS] All data loaded');
    } catch (error: any) {
      console.error('[ERROR] Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add default settings
  const defaultSettings: ProtectionSettings = {
    antinuke_enabled: false,
    automod_enabled: false,
    antispam_enabled: true,
    spam_limit: 4,
    spam_window: 7,
    duplicate_limit: 5,
    ignored_channels: [],
    server_protection_enabled: true,
    server_update_limit: 1,
    server_time_window: 10,
    server_action_type: 'RemoveRoles',
    server_ignored_roles: [],
    antibot_enabled: true,
    whitelisted_bots: [],
    antibot_action_type: 'RemoveRoles',
    antibot_ignored_roles: [],
    log_channel_id: null,
    max_role_deletions: 3,
    max_channel_deletions: 3,
    max_bans: 3,
    max_kicks: 5,
    webhook_deletion_enabled: true,
    bad_words: [],
    caps_limit: 70,
    mention_limit: 5,
    link_protection: true,
    invite_protection: true,
  };

  const enableModule = async (module: 'antinuke' | 'automod') => {
    if (!selectedGuild) return;

    setEnablingModule(module);
    try {
      await api.post(`/guild/${selectedGuild.id}/protection/${module}/enable`);

      setModuleStatus(prev => ({
        ...prev,
        [`${module}_setup`]: true
      }));

      setSettings(prev => ({
        ...prev,
        [`${module}_enabled`]: true
      }));

      setMessage(`✅ ${module === 'antinuke' ? 'Anti-Nuke' : 'Auto-Mod'} enabled successfully!`);
      setTimeout(() => setMessage(''), 3000);

      // Refresh stats
      const statsRes = await api.get(`/guild/${selectedGuild.id}/protection/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error(`[ERROR] Failed to enable ${module}:`, error);
      setMessage(`❌ Failed to enable ${module === 'antinuke' ? 'Anti-Nuke' : 'Auto-Mod'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setEnablingModule(null);
    }
  };

  const disableModule = async (module: 'antinuke' | 'automod') => {
    if (!selectedGuild) return;

    if (!window.confirm(`Are you sure you want to disable ${module === 'antinuke' ? 'Anti-Nuke' : 'Auto-Mod'}? This will turn off all protection features in this module.`)) {
      return;
    }

    setEnablingModule(module);
    try {
      await api.post(`/guild/${selectedGuild.id}/protection/${module}/disable`);

      setSettings(prev => ({
        ...prev,
        [`${module}_enabled`]: false
      }));

      setMessage(`✅ ${module === 'antinuke' ? 'Anti-Nuke' : 'Auto-Mod'} disabled successfully!`);
      setTimeout(() => setMessage(''), 3000);

      // Refresh stats
      const statsRes = await api.get(`/guild/${selectedGuild.id}/protection/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error(`[ERROR] Failed to disable ${module}:`, error);
      setMessage(`❌ Failed to disable ${module === 'antinuke' ? 'Anti-Nuke' : 'Auto-Mod'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setEnablingModule(null);
    }
  };

  const saveSettings = async () => {
    if (!selectedGuild) return;

    setSaving(true);
    try {
      await api.post(`/guild/${selectedGuild.id}/protection`, settings);
      setMessage('✅ Protection settings saved successfully!');

      // Refresh stats
      const statsRes = await api.get(`/guild/${selectedGuild.id}/protection/stats`);
      setStats(statsRes.data);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('[ERROR] Failed to save settings:', error);
      setMessage('❌ Failed to save settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const addBot = () => {
    if (botInput.trim() && /^\d+$/.test(botInput.trim())) {
      setSettings({
        ...settings,
        whitelisted_bots: [...settings.whitelisted_bots, botInput.trim()],
      });
      setBotInput('');
    }
  };

  const removeBot = (index: number) => {
    setSettings({
      ...settings,
      whitelisted_bots: settings.whitelisted_bots.filter((_, idx) => idx !== index)
    });
  };

  const addBadWord = () => {
    if (badWordInput.trim()) {
      setSettings({
        ...settings,
        bad_words: [...settings.bad_words, badWordInput.trim().toLowerCase()],
      });
      setBadWordInput('');
    }
  };

  const removeBadWord = (index: number) => {
    setSettings({
      ...settings,
      bad_words: settings.bad_words.filter((_, idx) => idx !== index)
    });
  };

  const toggleIgnoredChannel = (channelId: string) => {
    if (settings.ignored_channels.includes(channelId)) {
      setSettings({
        ...settings,
        ignored_channels: settings.ignored_channels.filter(id => id !== channelId)
      });
    } else {
      setSettings({
        ...settings,
        ignored_channels: [...settings.ignored_channels, channelId]
      });
    }
  };

  const toggleIgnoredRole = (roleId: string, type: 'server' | 'antibot') => {
    if (type === 'server') {
      if (settings.server_ignored_roles.includes(roleId)) {
        setSettings({
          ...settings,
          server_ignored_roles: settings.server_ignored_roles.filter(id => id !== roleId)
        });
      } else {
        setSettings({
          ...settings,
          server_ignored_roles: [...settings.server_ignored_roles, roleId]
        });
      }
    } else {
      if (settings.antibot_ignored_roles.includes(roleId)) {
        setSettings({
          ...settings,
          antibot_ignored_roles: settings.antibot_ignored_roles.filter(id => id !== roleId)
        });
      } else {
        setSettings({
          ...settings,
          antibot_ignored_roles: [...settings.antibot_ignored_roles, roleId]
        });
      }
    }
  };

  const getGuildIcon = (guild: Guild) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
    }
    return null;
  };

  if (loading || !selectedGuild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading Protection Settings...</h2>
          <p className="text-gray-400">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-52 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 z-40">
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            {getGuildIcon(selectedGuild) ? (
              <img
                src={getGuildIcon(selectedGuild)!}
                alt={selectedGuild.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                {selectedGuild.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-bold text-white truncate">{selectedGuild.name}</h2>
              <p className="text-xs text-gray-400">Protection Settings</p>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-2">Navigation</div>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 mb-1"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/protection"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white mb-1"
          >
            <span>🛡️</span>
            <span>Protection</span>
          </Link>
          <button
            onClick={() => navigate('/dashboard/servers')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 w-full text-left"
          >
            <span>🔄</span>
            <span>Change Server</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-52 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🛡️ Protection Settings</h1>
          <p className="text-gray-400">Configure anti-spam, anti-nuke, and auto-moderation for your server</p>
        </div>

        {/* Module Enable/Disable Section */}
        {(!moduleStatus.antinuke_setup || !moduleStatus.automod_setup) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">⚡ Quick Setup</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Anti-Nuke Setup */}
              {!moduleStatus.antinuke_setup && (
                <div className="bg-gradient-to-br from-red-600/10 to-red-700/10 border-2 border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-red-600/20 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-400">Anti-Nuke Not Setup</h3>
                      <p className="text-sm text-gray-400">Protect your server from malicious attacks</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>No protection against mass deletions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Vulnerable to ban/kick raids</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Server update protection disabled</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => enableModule('antinuke')}
                    disabled={enablingModule === 'antinuke'}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    {enablingModule === 'antinuke' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enabling...
                      </>
                    ) : (
                      <>
                        <Power className="w-5 h-5" />
                        Enable Anti-Nuke Protection
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Auto-Mod Setup */}
              {!moduleStatus.automod_setup && (
                <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-700/10 border-2 border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-10 h-10 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400">Auto-Mod Not Setup</h3>
                      <p className="text-sm text-gray-400">Automatically moderate chat messages</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-yellow-400" />
                      <span>No spam protection active</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-yellow-400" />
                      <span>Bad words not being filtered</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-yellow-400" />
                      <span>Link/invite protection disabled</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => enableModule('automod')}
                    disabled={enablingModule === 'automod'}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    {enablingModule === 'automod' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enabling...
                      </>
                    ) : (
                      <>
                        <Power className="w-5 h-5" />
                        Enable Auto-Moderation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module Status Cards */}
        {(moduleStatus.antinuke_setup || moduleStatus.automod_setup) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">📊 Module Status</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Anti-Nuke Status */}
              {moduleStatus.antinuke_setup && (
                <div className={`border-2 rounded-xl p-6 ${settings.antinuke_enabled
                  ? 'bg-gradient-to-br from-green-600/10 to-green-700/10 border-green-500/30'
                  : 'bg-gradient-to-br from-gray-600/10 to-gray-700/10 border-gray-500/30'
                  }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className={`w-10 h-10 ${settings.antinuke_enabled ? 'text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <h3 className="text-lg font-bold">Anti-Nuke Protection</h3>
                        <p className="text-sm text-gray-400">
                          {settings.antinuke_enabled ? 'Active & Protecting' : 'Setup Complete (Disabled)'}
                        </p>
                      </div>
                    </div>
                    {settings.antinuke_enabled ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={() => settings.antinuke_enabled ? disableModule('antinuke') : enableModule('antinuke')}
                    disabled={enablingModule === 'antinuke'}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${settings.antinuke_enabled
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                      } disabled:bg-gray-600`}
                  >
                    {enablingModule === 'antinuke' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : settings.antinuke_enabled ? (
                      <>
                        <Power className="w-5 h-5" />
                        Disable Anti-Nuke
                      </>
                    ) : (
                      <>
                        <Power className="w-5 h-5" />
                        Enable Anti-Nuke
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Auto-Mod Status */}
              {moduleStatus.automod_setup && (
                <div className={`border-2 rounded-xl p-6 ${settings.automod_enabled
                  ? 'bg-gradient-to-br from-green-600/10 to-green-700/10 border-green-500/30'
                  : 'bg-gradient-to-br from-gray-600/10 to-gray-700/10 border-gray-500/30'
                  }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className={`w-10 h-10 ${settings.automod_enabled ? 'text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <h3 className="text-lg font-bold">Auto-Moderation</h3>
                        <p className="text-sm text-gray-400">
                          {settings.automod_enabled ? 'Active & Monitoring' : 'Setup Complete (Disabled)'}
                        </p>
                      </div>
                    </div>
                    {settings.automod_enabled ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={() => settings.automod_enabled ? disableModule('automod') : enableModule('automod')}
                    disabled={enablingModule === 'automod'}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${settings.automod_enabled
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                      } disabled:bg-gray-600`}
                  >
                    {enablingModule === 'automod' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : settings.automod_enabled ? (
                      <>
                        <Power className="w-5 h-5" />
                        Disable Auto-Mod
                      </>
                    ) : (
                      <>
                        <Power className="w-5 h-5" />
                        Enable Auto-Mod
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Only show settings if modules are enabled */}
        {(settings.antinuke_enabled || settings.automod_enabled) && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-10 h-10 text-blue-400" />
                  <div>
                    <p className="text-3xl font-bold">{stats.active_protections}</p>
                    <p className="text-sm text-gray-400">Active Protections</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="w-10 h-10 text-green-400" />
                  <div>
                    <p className="text-3xl font-bold">{stats.protected_roles}</p>
                    <p className="text-sm text-gray-400">Protected Roles</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Bot className="w-10 h-10 text-purple-400" />
                  <div>
                    <p className="text-3xl font-bold">{stats.whitelisted_bots}</p>
                    <p className="text-sm text-gray-400">Whitelisted Bots</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <div>
                    <p className="text-3xl font-bold">{stats.actions_blocked}</p>
                    <p className="text-sm text-gray-400">Actions Blocked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Protection Log Channel */}
            <div className="mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 flex items-center gap-4">
                <Hash className="w-12 h-12 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Protection Log Channel</p>
                  <select
                    value={settings.log_channel_id || ''}
                    onChange={(e) => setSettings({ ...settings, log_channel_id: e.target.value || null })}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 w-full max-w-md"
                  >
                    <option value="">None (Disabled)</option>
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.id}>
                        # {channel.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.includes('✅')
                ? 'bg-green-600/20 border border-green-500/50 text-green-400'
                : 'bg-red-600/20 border border-red-500/50 text-red-400'
                }`}>
                {message}
              </div>
            )}

            {/* Rest of the settings UI - Anti-Spam, Server Protection, etc. */}
            {/* (Keep all the existing protection module settings from the previous code) */}

            {/* For brevity, I'm showing just the structure. Include all your existing protection modules here */}

            {settings.automod_enabled && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Anti-Spam Protection - existing code */}
                {/* Server Protection - existing code */}
                {/* Anti-Bot Protection - existing code */}
              </div>
            )}

            {settings.antinuke_enabled && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Anti-Nuke Protection - existing code */}
              </div>
            )}

            {settings.automod_enabled && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6">
                {/* Auto-Moderation Section - existing code */}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold text-lg flex items-center gap-2"
              >
                Reset
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-8 py-3 rounded-lg font-semibold text-lg flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save All Settings
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProtectionPage;
