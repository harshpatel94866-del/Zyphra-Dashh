import React, { useState, useEffect } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, serverTimestamp, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Menu, X, Zap, Home, FileText, Users, Headphones, Crown } from 'lucide-react';
import { secureStorage } from '../utils/secureStorage';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  provider: 'email' | 'google' | 'discord';
  discordId?: string;
  createdAt?: any;
}

interface Response {
  message: string;
  author: string;
  authorRole: 'user' | 'admin';
  timestamp: any;
}

interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'resolved';
  responses?: Response[];
  createdAt: any;
  updatedAt: any;
}

const DISCORD_CONFIG = {
  clientId: process.env.REACT_APP_DISCORD_CLIENT_ID || '1335133474226438176',
  redirectUri: `${window.location.origin}/auth/discord/callback`,
  scope: 'identify email guilds',
};

const getDiscordAuthUrl = () => {
  return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CONFIG.clientId}&redirect_uri=${encodeURIComponent(DISCORD_CONFIG.redirectUri)}&response_type=code&scope=${encodeURIComponent(DISCORD_CONFIG.scope)}`;
};

const DiscordSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [ticketForm, setTicketForm] = useState({
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    subject: '',
    description: ''
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [discordProcessing, setDiscordProcessing] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const supportCategories = [
    { icon: '⚙️', name: 'Bot Settings', value: 'bot-settings' },
    { icon: '📝', name: 'Button Roles', value: 'button-roles' },
    { icon: '✉️', name: 'Thread Messages', value: 'thread-messages' },
    { icon: '🤖', name: 'Auto Moderation', value: 'auto-moderation' },
    { icon: '🔔', name: 'Verification', value: 'verification' },
    { icon: '💰', name: 'Premium', value: 'premium' },
    { icon: '👑', name: 'Premium Purchase', value: 'premium-purchase' },
  ];

  // Discord OAuth handler
  useEffect(() => {
    const handleDiscordCallback = async () => {
      const code = searchParams.get('code');
      if (code && !discordProcessing) {
        setDiscordProcessing(true);
        setLoading(true);

        try {
          const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: DISCORD_CONFIG.clientId,
              client_secret: 'YOUR_DISCORD_CLIENT_SECRET',
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: DISCORD_CONFIG.redirectUri,
            }),
          });

          if (!tokenResponse.ok) {
            throw new Error('Failed to exchange Discord code for token');
          }

          const tokenData = await tokenResponse.json();

          const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch Discord user info');
          }

          const discordUser = await userResponse.json();

          const userDocRef = doc(db, 'users', discordUser.id);
          const userDoc = await getDoc(userDocRef);

          const userData = {
            email: discordUser.email || `${discordUser.username}@discord.user`,
            displayName: discordUser.global_name || discordUser.username,
            photoURL: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : `https://ui-avatars.com/api/?name=${discordUser.username}&background=5865F2&color=fff`,
            role: userDoc.exists() ? userDoc.data().role : 'user',
            provider: 'discord',
            discordId: discordUser.id,
            createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await setDoc(userDocRef, userData, { merge: true });

          setCurrentUser({
            uid: discordUser.id,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            role: userData.role as 'user' | 'admin',
            provider: 'discord',
            discordId: discordUser.id
          });

          toast.success('Logged in with Discord!');
          navigate('/', { replace: true });
        } catch (error: any) {
          console.error('Discord auth error:', error);
          toast.error(error.message || 'Discord login failed');
          navigate('/', { replace: true });
        } finally {
          setDiscordProcessing(false);
          setLoading(false);
        }
      }
    };

    handleDiscordCallback();
  }, [searchParams, navigate, discordProcessing]);
 const handleDashboardClick = () => {
    const token = secureStorage.getItem('discord_token');
    if (!token) {
      navigate('/dashboard/login');
      return;
    }
    const selectedGuild = secureStorage.getItem('selected_guild');
    navigate(selectedGuild ? '/dashboard' : '/dashboard/servers');
  };

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !discordProcessing) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          if (!userDoc.exists()) {
            const newUserData = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=3b82f6&color=fff`,
              role: 'user',
              provider: firebaseUser.providerData[0]?.providerId.includes('google') ? 'google' : 'email',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);

            setCurrentUser({
              uid: firebaseUser.uid,
              email: newUserData.email,
              displayName: newUserData.displayName,
              photoURL: newUserData.photoURL,
              role: 'user',
              provider: newUserData.provider as 'email' | 'google'
            });
          } else {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              updatedAt: serverTimestamp()
            });

            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || userData?.email || '',
              displayName: userData?.displayName || firebaseUser.displayName || 'User',
              photoURL: userData?.photoURL || firebaseUser.photoURL || `https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff`,
              role: userData?.role || 'user',
              provider: userData?.provider || 'email',
              discordId: userData?.discordId
            });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          toast.error('Failed to load user data');
        }
      } else if (!discordProcessing) {
        setCurrentUser(null);
      }

      if (!discordProcessing) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [discordProcessing]);

  useEffect(() => {
    if (currentUser && !discordProcessing) {
      loadTickets();
      if (currentUser.role === 'admin') {
        loadAllUsers();
      }
    }
  }, [currentUser, discordProcessing]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle purchase query params from Premium page
  useEffect(() => {
    const purchaseId = searchParams.get('purchase');
    const planName = searchParams.get('plan');
    const planPrice = searchParams.get('price');

    if (purchaseId && currentUser && !discordProcessing) {
      // Auto-fill the ticket form for premium purchase
      setTicketForm({
        category: 'premium-purchase',
        priority: 'high',
        subject: `Premium Purchase: ${planName || purchaseId}`,
        description: `I would like to purchase the ${planName || purchaseId} plan (${planPrice || 'N/A'} per month).\n\nPlease provide payment details and complete my order.\n\n---\nPlan ID: ${purchaseId}\nPlan Name: ${planName || 'N/A'}\nPrice: ${planPrice || 'N/A'}/month`
      });
      setShowTicketModal(true);
      // Clear the URL params after processing
      navigate('/support', { replace: true });
    }
  }, [searchParams, currentUser, discordProcessing, navigate]);

  const loadTickets = async () => {
    if (!currentUser) return;

    try {
      const ticketsRef = collection(db, 'tickets');
      let ticketsData: Ticket[] = [];

      if (currentUser.role === 'admin') {
        try {
          const q = query(ticketsRef, orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          ticketsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Ticket[];
        } catch (error: any) {
          if (error.code === 'failed-precondition') {
            const querySnapshot = await getDocs(ticketsRef);
            ticketsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Ticket[];

            ticketsData.sort((a, b) => {
              const aTime = a.createdAt?.toMillis?.() || 0;
              const bTime = b.createdAt?.toMillis?.() || 0;
              return bTime - aTime;
            });
          } else {
            throw error;
          }
        }
      } else {
        try {
          const q = query(ticketsRef,
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          ticketsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Ticket[];
        } catch (error: any) {
          if (error.code === 'failed-precondition') {
            const q = query(ticketsRef, where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            ticketsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Ticket[];

            ticketsData.sort((a, b) => {
              const aTime = a.createdAt?.toMillis?.() || 0;
              const bTime = b.createdAt?.toMillis?.() || 0;
              return bTime - aTime;
            });
          } else {
            throw error;
          }
        }
      }

      setTickets(ticketsData);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast.error(`Failed to load tickets: ${error.message}`);
    }
  };

  const loadAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      setAllUsers(usersData);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(`Failed to load users: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          provider: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      toast.success('Logged in with Google!');
      setShowAuthModal(false);
    } catch (error: any) {
      setAuthError(error.message);
      toast.error(`Google login failed: ${error.message}`);
    }
  };

  const handleDiscordLogin = () => {
    try {
      setAuthError(null);
      window.location.href = getDiscordAuthUrl();
    } catch (error: any) {
      setAuthError(error.message);
      toast.error(`Discord login failed: ${error.message}`);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        if (!authForm.name || !authForm.email || !authForm.password) {
          throw new Error('All fields are required');
        }

        if (authForm.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const result = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);

        await updateProfile(result.user, {
          displayName: authForm.name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(authForm.name)}&background=3b82f6&color=fff`
        });

        await setDoc(doc(db, 'users', result.user.uid), {
          email: authForm.email,
          displayName: authForm.name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(authForm.name)}&background=3b82f6&color=fff`,
          role: 'user',
          provider: 'email',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        toast.success('Account created!');
      } else {
        if (!authForm.email || !authForm.password) {
          throw new Error('Email and password required');
        }

        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        toast.success('Logged in!');
      }

      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error: any) {
      setAuthError(error.message);
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentUser?.provider === 'discord') {
        setCurrentUser(null);
      } else {
        await signOut(auth);
      }

      setTickets([]);
      setAllUsers([]);
      toast.success('Logged out');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      toast.info('Creating ticket...');

      const ticketDoc = await addDoc(collection(db, 'tickets'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        category: ticketForm.category,
        priority: ticketForm.priority,
        subject: ticketForm.subject,
        description: ticketForm.description,
        status: 'open',
        responses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Flag for bot to pick up - will create Discord ticket channel
        discordTicketCreated: false
      });

      toast.success('Ticket created!');
      setShowTicketModal(false);
      setTicketForm({ category: '', priority: 'medium', subject: '', description: '' });

      setTimeout(() => loadTickets(), 500);
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const handleAddResponse = async () => {
    if (!selectedTicket || !responseMessage.trim() || !currentUser) {
      toast.error('Enter a response');
      return;
    }

    try {
      const newResponse: Response = {
        message: responseMessage,
        author: currentUser.displayName,
        authorRole: currentUser.role,
        timestamp: new Date().toISOString() // Can't use serverTimestamp() inside arrayUnion()
      };

      await updateDoc(doc(db, 'tickets', selectedTicket.id), {
        responses: arrayUnion(newResponse),
        status: currentUser.role === 'admin' ? 'pending' : selectedTicket.status,
        updatedAt: serverTimestamp()
      });

      toast.success('Response added!');
      setShowResponseModal(false);
      setResponseMessage('');
      setSelectedTicket(null);
      setTimeout(() => loadTickets(), 500);
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Delete this ticket?')) return;

    try {
      await deleteDoc(doc(db, 'tickets', ticketId));
      toast.success('Ticket deleted!');
      setShowDropdown(null);
      setTimeout(() => loadTickets(), 300);
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: 'open' | 'pending' | 'resolved') => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success('Status updated!');
      setShowDropdown(null);
      setTimeout(() => loadTickets(), 300);
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role to ${newRole}?`)) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      toast.success(`Role updated to ${newRole}!`);
      setTimeout(() => loadAllUsers(), 300);
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStats = () => {
    const userTickets = currentUser?.role === 'admin' ? tickets : tickets.filter(t => t.userId === currentUser?.uid);
    return {
      total: userTickets.length,
      active: userTickets.filter(t => t.status === 'open').length,
      resolved: userTickets.filter(t => t.status === 'resolved').length,
      pending: userTickets.filter(t => t.status === 'pending').length,
    };
  };

  const stats = getStats();

  const getTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  if (loading || discordProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0118] via-[#0e1a3e] to-[#0a0118]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-white mt-4 font-semibold">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>

        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden pt-20">
          {/* New Background System - Black with #493fff Circle and Glassmorphism */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black">
            {/* Main #493fff circle glow */}
            <div className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-50" style={{
              background: 'radial-gradient(circle, #493fff 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} />

            {/* Glassmorphism overlay - white to light black gradient */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
            }} />

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'linear-gradient(rgba(73,63,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(73,63,255,0.3) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }} />
          </div>

          <div className="max-w-md w-full relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-5xl shadow-lg shadow-blue-500/50 animate-bounce">
                  🎫
                </div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  Support System
                </h1>
                <p className="text-white/60 text-sm">Advanced Ticket Management</p>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
                  <span>⚠️</span>
                  <div className="flex-1">
                    {authError}
                    <button onClick={() => setAuthError(null)} className="float-right text-red-400 hover:text-red-300 font-bold text-lg leading-none">×</button>
                  </div>
                </div>
              )}

              {/* Auth Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-lg"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={handleDiscordLogin}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-lg"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Continue with Discord
                </button>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-lg"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Continue with Email
                </button>
              </div>

              {/* Features */}
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                  <span>✨</span> Features
                </h4>
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span>🎯</span>
                    <span>Easy ticket management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📊</span>
                    <span>Real-time conversation thread</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>👑</span>
                    <span>Admin panel included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🔐</span>
                    <span>Secure authentication</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0e1a3e] border border-white/10 rounded-2xl max-w-md w-full p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </h2>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthError(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  {authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>

                <p className="text-center text-white/60 text-sm">
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <span
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setAuthError(null);
                    }}
                    className="text-blue-400 font-semibold cursor-pointer hover:text-blue-300"
                  >
                    {authMode === 'login' ? 'Sign up' : 'Sign in'}
                  </span>
                </p>
              </form>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" theme="dark" aria-label="Notification messages" />
      </>
    );
  }

  // MAIN DASHBOARD
  return (
    <>      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-500 bg-black/60 backdrop-blur-xl border-b border-[#493fff]/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#493fff] to-[#7c6fff] rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Zyphra</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[
                { name: 'Home', icon: <Home className="w-4 h-4" /> },
                { name: 'Docs', icon: <FileText className="w-4 h-4" /> },
                { name: 'Team', icon: <Users className="w-4 h-4" /> },
                { name: 'Support', icon: <Headphones className="w-4 h-4" /> },
                { name: 'Premium', icon: <Crown className="w-4 h-4" /> }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`}
                  className="relative flex items-center gap-2 text-white/60 hover:text-white transition-colors py-2 group"
                >
                  {item.icon}
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#493fff] to-[#7c6fff] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
              <button
                onClick={handleDashboardClick}
                className="px-6 py-2.5 bg-gradient-to-r from-[#493fff] to-[#7c6fff] rounded-full font-semibold text-white hover:shadow-lg hover:shadow-[#493fff]/30 transition-all duration-300 hover:scale-105"
              >
                Dashboard
              </button>
            </div>

            <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-[#493fff]/20 animate-slideDown">
            <div className="px-6 py-6 space-y-4">
              {[
                { name: 'Home', icon: <Home className="w-4 h-4" /> },
                { name: 'Docs', icon: <FileText className="w-4 h-4" /> },
                { name: 'Team', icon: <Users className="w-4 h-4" /> },
                { name: 'Support', icon: <Headphones className="w-4 h-4" /> },
                { name: 'Premium', icon: <Crown className="w-4 h-4" /> }
              ].map((item) => (
                <Link key={item.name} to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`} className="flex items-center gap-2 text-white/80 hover:text-white py-2">
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <button onClick={handleDashboardClick} className="w-full py-3 bg-gradient-to-r from-[#493fff] to-[#7c6fff] rounded-xl font-semibold">Dashboard</button>
            </div>
          </div>
        )}
      </nav>

      <div className="min-h-screen p-4 md:p-8 relative overflow-hidden pt-20">
        {/* New Background System - Black with #493fff Circle and Glassmorphism */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black">
          {/* Main #493fff circle glow */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-50"
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
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
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

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Profile Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={currentUser.photoURL}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full border-2 border-blue-500/40"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0e1a3e]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg truncate">{currentUser.displayName}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1 ${currentUser.role === 'admin'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                      {currentUser.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Provider</span>
                    <span className="text-white font-semibold capitalize">{currentUser.provider}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Tickets</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg font-bold">{stats.total}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full p-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded-xl text-red-400 font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span>🚪</span> Logout
                </button>
              </div>

              {/* Categories Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>📚</span> Categories
                </h4>
                <div className="space-y-2">
                  {supportCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="flex-1 text-white/80 text-sm font-medium">{cat.name}</span>
                      <span className="px-2 py-1 bg-white/10 rounded-lg text-white/60 text-xs font-bold">
                        {tickets.filter(t => t.category === cat.value).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      {currentUser.role === 'admin' ? '👑 Admin Dashboard' : 'Support Center'}
                    </h1>
                    <p className="text-white/60 text-sm md:text-base">
                      {currentUser.role === 'admin' ? 'Manage all tickets & users' : 'Your support tickets'}
                    </p>
                  </div>
                  {currentUser.role !== 'admin' && (
                    <button
                      onClick={() => {
                        setShowTicketModal(true);
                        setTicketForm({ category: '', priority: 'medium', subject: '', description: '' });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                    >
                      + New Ticket
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-white mb-1">{stats.active}</div>
                    <div className="text-white/60 text-xs font-semibold uppercase tracking-wide">Active</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-green-400 mb-1">{stats.resolved}</div>
                    <div className="text-white/60 text-xs font-semibold uppercase tracking-wide">Resolved</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-yellow-400 mb-1">{stats.pending}</div>
                    <div className="text-white/60 text-xs font-semibold uppercase tracking-wide">Pending</div>
                  </div>
                </div>
              </div>

              {/* Admin Users Table */}
              {currentUser.role === 'admin' && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <span>👥</span> Users ({allUsers.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/70 font-semibold p-3 text-sm">User</th>
                          <th className="text-left text-white/70 font-semibold p-3 text-sm hidden md:table-cell">Email</th>
                          <th className="text-left text-white/70 font-semibold p-3 text-sm hidden sm:table-cell">Provider</th>
                          <th className="text-left text-white/70 font-semibold p-3 text-sm">Role</th>
                          <th className="text-left text-white/70 font-semibold p-3 text-sm">Tickets</th>
                          <th className="text-left text-white/70 font-semibold p-3 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user) => (
                          <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
                                <span className="text-white font-medium text-sm">{user.displayName}</span>
                              </div>
                            </td>
                            <td className="p-3 text-white/70 text-sm hidden md:table-cell">{user.email}</td>
                            <td className="p-3 hidden sm:table-cell">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-semibold capitalize">
                                {user.provider}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'
                                }`}>
                                {user.role === 'admin' ? '👑' : '👤'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-white/10 text-white rounded-lg text-xs font-bold">
                                {tickets.filter(t => t.userId === user.uid).length}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleUserRole(user.uid, user.role)}
                                disabled={user.uid === currentUser.uid}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${user.uid === currentUser.uid
                                  ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                  : user.role === 'admin'
                                    ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                    : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                  }`}
                              >
                                {user.role === 'admin' ? 'Remove' : 'Make Admin'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tickets */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <span>📋</span> Tickets ({filteredTickets.length})
                  </h3>

                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tickets..."
                      className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl flex-wrap sm:flex-nowrap">
                      {(['all', 'open', 'pending', 'resolved'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all ${filterStatus === status
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4 opacity-40">🎫</div>
                      <h4 className="text-white text-xl font-bold mb-2">No tickets found</h4>
                      <p className="text-white/60 mb-6">Create your first ticket to get started</p>
                      {currentUser.role !== 'admin' && (
                        <button
                          onClick={() => setShowTicketModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold hover:shadow-lg hover:scale-105 transition-all"
                        >
                          + Create Ticket
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <span className="text-blue-400 font-mono font-bold text-xs">
                                #{ticket.id.slice(-6)}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                ticket.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                  'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                }`}>
                                {ticket.status}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                ticket.priority === 'medium' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                {ticket.priority}
                              </span>
                            </div>

                            {/* Content */}
                            <h5 className="text-white font-bold text-base md:text-lg mb-2">{ticket.subject}</h5>
                            <p className="text-white/70 mb-4 line-clamp-2 text-sm">{ticket.description}</p>

                            {/* Responses Count */}
                            {ticket.responses && ticket.responses.length > 0 && (
                              <div className="mb-4">
                                <button
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setShowViewModal(true);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-2"
                                >
                                  💬 {ticket.responses.length} Response{ticket.responses.length > 1 ? 's' : ''}
                                  <span>→</span>
                                </button>
                              </div>
                            )}

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-white/50 text-xs flex-wrap">
                              {currentUser.role === 'admin' && (
                                <>
                                  <span>👤 {ticket.userName}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{supportCategories.find(c => c.value === ticket.category)?.name}</span>
                              <span>•</span>
                              <span>{getTimeAgo(ticket.createdAt)}</span>
                            </div>
                          </div>

                          {/* Actions Dropdown */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(showDropdown === ticket.id ? null : ticket.id);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>

                            {showDropdown === ticket.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-[#0e1a3e] border border-white/10 rounded-xl shadow-2xl z-20">
                                <button
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setShowViewModal(true);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-white/10 text-white font-medium rounded-t-xl transition-all text-sm"
                                >
                                  👁️ View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setShowResponseModal(true);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-white/10 text-white font-medium transition-all text-sm"
                                >
                                  💬 Add Response
                                </button>
                                {currentUser.role === 'admin' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(ticket.id, 'open')}
                                      className="w-full text-left px-4 py-3 hover:bg-white/10 text-white font-medium transition-all text-sm"
                                    >
                                      🟢 Mark Open
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(ticket.id, 'pending')}
                                      className="w-full text-left px-4 py-3 hover:bg-white/10 text-white font-medium transition-all text-sm"
                                    >
                                      ⏳ Mark Pending
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(ticket.id, 'resolved')}
                                      className="w-full text-left px-4 py-3 hover:bg-white/10 text-white font-medium transition-all text-sm"
                                    >
                                      ✅ Mark Resolved
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTicket(ticket.id)}
                                      className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 font-medium rounded-b-xl transition-all text-sm"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1a3e] border border-white/10 rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Ticket</h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    {supportCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Brief description"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={5}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  placeholder="Detailed information..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Response Modal */}
      {showResponseModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1a3e] border border-white/10 rounded-2xl max-w-2xl w-full p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Response</h2>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage('');
                  setSelectedTicket(null);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <h4 className="text-white font-bold mb-2">{selectedTicket.subject}</h4>
              <p className="text-white/70 text-sm">{selectedTicket.description}</p>
            </div>

            <div className="mb-4">
              <label className="block text-white/80 text-sm font-medium mb-2">Your Response</label>
              <textarea
                rows={5}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                placeholder="Type your response..."
                required
              />
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleAddResponse}
                className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                Send Response
              </button>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage('');
                  setSelectedTicket(null);
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Details Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1a3e] border border-white/10 rounded-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Ticket Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTicket(null);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Ticket Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-blue-400 font-mono font-bold text-sm">
                  #{selectedTicket.id.slice(-6)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  selectedTicket.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                  {selectedTicket.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedTicket.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  selectedTicket.priority === 'medium' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                  {selectedTicket.priority}
                </span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{selectedTicket.subject}</h3>
              <p className="text-white/70 mb-4">{selectedTicket.description}</p>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <span>👤 {selectedTicket.userName}</span>
                <span>•</span>
                <span>{supportCategories.find(c => c.value === selectedTicket.category)?.name}</span>
                <span>•</span>
                <span>{getTimeAgo(selectedTicket.createdAt)}</span>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <span>💬</span> Conversation ({selectedTicket.responses?.length || 0})
              </h3>

              {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                selectedTicket.responses.map((response, idx) => (
                  <div key={idx} className={`p-4 rounded-xl ${response.authorRole === 'admin'
                    ? 'bg-blue-500/10 border-l-4 border-blue-500'
                    : 'bg-white/5 border-l-4 border-gray-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-bold ${response.authorRole === 'admin' ? 'text-blue-400' : 'text-white'
                        }`}>
                        {response.authorRole === 'admin' ? '👑' : '👤'} {response.author}
                      </span>
                      <span className="text-white/40 text-xs">
                        • {getTimeAgo(response.timestamp)}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">{response.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <p className="text-white/60">No responses yet</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setShowResponseModal(true);
                }}
                className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                💬 Add Response
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTicket(null);
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" theme="dark" aria-label="Notification messages" />
    </>
  );
};

export default DiscordSupportPage;
