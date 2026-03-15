import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  member_count: number;
}

interface Settings {
  prefix: string;
  antispam_enabled: boolean;
  spam_limit: number;
  spam_window: number;
}

const SettingsPage: React.FC = () => {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    prefix: '!',
    antispam_enabled: true,
    spam_limit: 5,
    spam_window: 10,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/guilds').then(res => setGuilds(res.data));
  }, []);

  useEffect(() => {
    if (selectedGuild) {
      api.get(`/guild/${selectedGuild}/settings`).then(res => {
        setSettings(res.data);
      });
    }
  }, [selectedGuild]);

  const saveSettings = async () => {
    if (!selectedGuild) return;
    try {
      await api.post(`/guild/${selectedGuild}/settings`, settings);
      setMessage('✅ Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-[var(--theme-primary)] hover:underline mb-4 inline-block">← Back to Home</Link>
        
        <h1 className="text-5xl font-bold mb-8">⚙️ Server Settings</h1>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('✅') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {message}
          </div>
        )}

        <div className="bg-black/5 dark:bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-[var(--theme-primary)]/20 mb-6">
          <h2 className="text-2xl font-bold mb-4">Select Server</h2>
          <select
            className="w-full bg-[var(--theme-bg)] border border-[var(--theme-primary)]/30 rounded-lg p-3 text-[var(--theme-text)]"
            value={selectedGuild || ''}
            onChange={(e) => setSelectedGuild(e.target.value)}
          >
            <option value="">Choose a server...</option>
            {guilds.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.member_count} members)</option>
            ))}
          </select>
        </div>

        {selectedGuild && (
          <div className="bg-black/5 dark:bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-[var(--theme-primary)]/20">
            <h2 className="text-2xl font-bold mb-6">Protection Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-lg mb-2">Command Prefix</label>
                <input
                  type="text"
                  className="w-full bg-[var(--theme-bg)] border border-[var(--theme-primary)]/30 rounded-lg p-3 text-[var(--theme-text)]"
                  value={settings.prefix}
                  onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="antispam"
                  className="w-6 h-6"
                  checked={settings.antispam_enabled}
                  onChange={(e) => setSettings({ ...settings, antispam_enabled: e.target.checked })}
                />
                <label htmlFor="antispam" className="text-lg">Enable Anti-Spam Protection</label>
              </div>

              {settings.antispam_enabled && (
                <>
                  <div>
                    <label className="block text-lg mb-2">Spam Limit (messages): {settings.spam_limit}</label>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      className="w-full"
                      value={settings.spam_limit}
                      onChange={(e) => setSettings({ ...settings, spam_limit: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-lg mb-2">Time Window (seconds): {settings.spam_window}</label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      className="w-full"
                      value={settings.spam_window}
                      onChange={(e) => setSettings({ ...settings, spam_window: parseInt(e.target.value) })}
                    />
                  </div>
                </>
              )}

              <button
                onClick={saveSettings}
                className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white py-3 rounded-lg text-xl font-semibold transition"
              >
                💾 Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
