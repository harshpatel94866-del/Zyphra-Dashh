import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import HomePage from './components/HomePage';
import SettingsPageLegacy from './components/SettingPage';
import ProtectionPage from './components/ProtectionPage';
import CodingBackground from './components/CodingBackground';
import AuthCallback from './components/authcallback';
import DashboardLogin from './components/dashboardlogin';
import DashboardPage from './components/dashboard';
import ServerSelector from './pages/ServerSelector';
import Documentation from './components/Documentation';
import DiscordSupportPage from './pages/Support';
import TeamPage from './pages/Team';
import ProfilePage from './pages/Profile';
import PremiumPage from './pages/Premium';

// Dashboard Sub-Pages
import AntinukePage from './pages/dashboard/AntinukePage';
import AutomodPage from './pages/dashboard/AutomodPage';
import EmergencyPage from './pages/dashboard/EmergencyPage';
import WelcomerPage from './pages/dashboard/WelcomerPage';
import LimitSystemPage from './pages/dashboard/LimitSystemPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ModSetupPage from './pages/dashboard/ModSetupPage';
import AdminSetupPage from './pages/dashboard/AdminSetupPage';
import CustomRolePage from './pages/dashboard/CustomRolePage';
import AutorolePage from './pages/dashboard/AutorolePage';
import AutoRespondersPage from './pages/dashboard/AutoRespondersPage';
import AutoReactPage from './pages/dashboard/AutoReactPage';
import GiveawayPage from './pages/dashboard/GiveawayPage';
import TicketsPage from './pages/dashboard/TicketsPage';
import LoggingPage from './pages/dashboard/LoggingPage';
import AuditLogsPage from './pages/dashboard/AuditLogsPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Global animated theme background */}
        <CodingBackground />
        
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/support" element={<DiscordSupportPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/dashboard/login" element={<DashboardLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard/servers" element={<ServerSelector />} />

          {/* Dashboard — Overview + All Module Pages */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/antinuke" element={<AntinukePage />} />
          <Route path="/dashboard/automod" element={<AutomodPage />} />
          <Route path="/dashboard/emergency" element={<EmergencyPage />} />
          <Route path="/dashboard/welcomer" element={<WelcomerPage />} />
          <Route path="/dashboard/limit-system" element={<LimitSystemPage />} />
          <Route path="/dashboard/mod-setup" element={<ModSetupPage />} />
          <Route path="/dashboard/admin-setup" element={<AdminSetupPage />} />
          <Route path="/dashboard/custom-role" element={<CustomRolePage />} />
          <Route path="/dashboard/autorole" element={<AutorolePage />} />
          <Route path="/dashboard/auto-responders" element={<AutoRespondersPage />} />
          <Route path="/dashboard/auto-react" element={<AutoReactPage />} />
          <Route path="/dashboard/giveaway" element={<GiveawayPage />} />
          <Route path="/dashboard/tickets" element={<TicketsPage />} />
          <Route path="/dashboard/logging" element={<LoggingPage />} />
          <Route path="/dashboard/audit-logs" element={<AuditLogsPage />} />

          {/* Legacy routes */}
          <Route path="/protection" element={<ProtectionPage />} />
          <Route path="/settings" element={<SettingsPageLegacy />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

