import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import axios from 'axios';
import ZyphraLoader from './ZyphraLoader';
import { useTheme } from '../context/ThemeContext';
import { secureStorage } from '../utils/secureStorage';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'authenticating' | 'success' | 'error'>('authenticating');
  const { mode, colors } = useTheme();

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('No authorization code received');
      setStatus('error');
      setTimeout(() => navigate('/dashboard/login'), 3000);
      return;
    }

    // Exchange code for access token
    const authenticateUser = async () => {
      try {
        setStatus('authenticating');

        // Send code to your backend API
        const response = await api.post('/auth/discord', {
          code,
          redirect_uri: `${window.location.origin}/auth/callback`
        });

        // Store token and user data with consistent keys
        secureStorage.setItem('discord_token', response.data.access_token);

        // Store user in BOTH keys for backward compatibility
        const userData = response.data.user;
        secureStorage.setItem('user', JSON.stringify(userData));
        secureStorage.setItem('discord_user', JSON.stringify(userData));

        setStatus('success');

        // Small delay to show success state
        setTimeout(() => {
          // Redirect to server selector
          navigate('/dashboard/servers');
        }, 1000);

      } catch (err: any) {
        console.error('Auth error:', err);

        // More descriptive error messages
        let errorMessage = 'Authentication failed. Please try again.';
        if (err.response?.status === 401) {
          errorMessage = 'Invalid authorization code. Please try logging in again.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Cannot connect to server. Please check if the API is running.';
        }

        setError(errorMessage);
        setStatus('error');
        setTimeout(() => navigate('/dashboard/login'), 4000);
      }
    };

    authenticateUser();
  }, [searchParams, navigate]);

  // Show custom loader for authenticating state
  if (status === 'authenticating') {
    return (
      <ZyphraLoader
        text="Authenticating"
        subText="Connecting to Discord..."
        variant="premium"
      />
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1a3a] to-[#0a0f1e] text-white flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Welcome!
          </h2>
          <p className="text-white/60">Redirecting to dashboard...</p>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1a3a] to-[#0a0f1e] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4 animate-fadeIn">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-red-400">Authentication Failed</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <div className="flex items-center justify-center gap-2 text-white/40">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <span className="ml-2">Redirecting to login...</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AuthCallback;
