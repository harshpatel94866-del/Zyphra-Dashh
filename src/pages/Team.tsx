import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, Crown, Code, DollarSign, Heart, Users, Home, FileText, Headphones } from 'lucide-react';
import { secureStorage } from '../utils/secureStorage';
import logo from '../assests/logo.png';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  roleIcon: React.ReactNode;
  description: string;
  socials?: {
    discord?: string;
    github?: string;
    twitter?: string;
  };
  gradient: string;
  glowColor: string;
}

const TeamPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  // Track scroll for effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

 const handleDashboardClick = () => {
    const token = secureStorage.getItem('discord_token');
    if (!token) {
      navigate('/dashboard/login');
      return;
    }
    const selectedGuild = secureStorage.getItem('selected_guild');
    navigate(selectedGuild ? '/dashboard' : '/dashboard/servers');
  };

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Harsh Vaishnani',
      role: 'Bot Owner',
      avatar: 'https://cdn.discordapp.com/attachments/1386219227886653460/1479385733293674496/8ee17baed8dfbe7ac3551fa72d07237b.png?ex=69abd8d4&is=69aa8754&hm=3279ca93bf52d41fdf42e90975748994b822146b99e9f59a95e9d8da75ec1081&size=256',
      roleIcon: <Crown className="w-5 h-5" />,
      description: 'Founder and visionary behind Zyphra Bot. Leading the development and community.',
      gradient: 'from-yellow-400 via-amber-500 to-orange-500',
      glowColor: 'rgba(251, 191, 36, 0.4)',
    },
    {
      id: '2',
      name: 'Dev Team Lead',
      role: 'Bot Developer',
      avatar: 'https://cdn.discordapp.com/attachments/1386219227886653460/1479384941367267359/4c9c5383ac52f35a72edcbc7f66af4db.png?ex=69abd817&is=69aa8697&hm=8ab21540de87efc38c8b40345cb938a82073efb0023c4a99ed90cb47a64737df&size=256',
      roleIcon: <Code className="w-5 h-5" />,
      description: 'Core developer responsible for implementing features and maintaining the codebase.',
      gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
      glowColor: 'rgba(14, 165, 233, 0.4)',
    },
    {
      id: '3',
      name: 'Investor',
      role: 'Investor',
      avatar: 'https://cdn.discordapp.com/attachments/1386219227886653460/1479386209435385969/68b6ce606b16da32b19d22958225b7e1.png?ex=69abd945&is=69aa87c5&hm=957078f79fccd616144a6eba1a86716ff42622f5ab527fe40a3f0d2bbfebd19a&&size=256',
      roleIcon: <DollarSign className="w-5 h-5" />,
      description: 'Supporting the project financially and helping it grow to new heights.',
      gradient: 'from-emerald-400 via-green-500 to-teal-500',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    },
    {
      id: '4',
      name: 'Support Helper',
      role: 'Helper',
      avatar: 'https://ui-avatars.com/api/?name=HLP&background=ec4899&color=fff&size=256',
      roleIcon: <Heart className="w-5 h-5" />,
      description: 'Dedicated to helping users with their questions and providing excellent support.',
      gradient: 'from-pink-400 via-rose-500 to-red-500',
      glowColor: 'rgba(236, 72, 153, 0.4)',
    },
    {
      id: '5',
      name: 'Cybernatics Team',
      role: 'Cybernatics Development Team',
      avatar: 'https://cdn.discordapp.com/attachments/1386219227886653460/1479386548477759671/0bf00ee16beb918cf9413a726e87c3be.png?ex=69abd996&is=69aa8816&hm=cc37217c7b03ff0338bf6ab0d3cd52ac45bffcfae04218991cd1f56701ea6d26&&size=256',
      roleIcon: <Users className="w-5 h-5" />,
      description: 'The elite development team behind the advanced features and innovations.',
      gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
      glowColor: 'rgba(139, 92, 246, 0.4)',
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* New Background System - Black with #493fff Circle and Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 transition-all duration-500 bg-black/60 backdrop-blur-xl border-b border-[#493fff]/20">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                  <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#493fff] to-[#7c6fff] rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <img src={logo} alt="Zyphra Logo" className="w-12 h-12 text" />
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

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6 animate-fadeIn">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Meet Our Amazing Team</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 animate-fadeInUp">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              The Team Behind
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Zyphra Bot
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            A passionate group of developers, designers, and innovators dedicated to creating the best Discord bot experience.
          </p>
        </div>
      </section>

      {/* Team Cards Section */}
      <section className="py-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teamMembers.map((member, index) => (
              <TeamCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-sky-500/10 backdrop-blur-xl border border-white/10 rounded-3xl"></div>

            {/* Animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl animate-pulse"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Want to Join Our Team?
              </h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                We're always looking for talented individuals to help us grow. If you're passionate about Discord bots and community building, we'd love to hear from you!
              </p>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 rounded-full text-white font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105 group"
              >
                <span>Apply Now</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional Multi-Section Footer */}
      <footer className="relative z-50 bg-gradient-to-b from-black to-[#0a0a0a] border-t border-[#493fff]/30 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Section with Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#493fff] to-[#7c6fff] rounded-xl flex items-center justify-center shadow-lg shadow-[#493fff]/40">
            <img src={logo} alt="Zyphra Logo" className="w-12 h-12 text" />
                </div>
                <span className="font-bold text-2xl text-white">Zyphra</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                The ultimate Discord bot for server management, moderation, music, and entertainment. Trusted by thousands of servers worldwide.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a href="https://discord.gg/zyphra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#493fff]/20 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-[#493fff] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                </a>
                <a href="https://github.com/zyphra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#493fff]/20 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-[#493fff] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a href="https://twitter.com/zyphra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#493fff]/20 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-[#493fff] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Home</Link></li>
                <li><Link to="/docs" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Documentation</Link></li>
                <li><Link to="/premium" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Premium Plans</Link></li>
                <li><Link to="/team" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Our Team</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3">
                <li><Link to="/support" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Get Support</Link></li>
                <li><a href="https://discord.gg/zyphra" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Discord Server</a></li>
                <li><a href="mailto:support@zyphra.site" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Email Us</a></li>
                <li><Link to="/docs" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Terms of Service</Link></li>
                <li><Link to="/refund" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/40 text-sm">© 2025 Cybernatics Development. All rights reserved.</p>
              <p className="text-white/30 text-xs">Made with 💜 for Discord communities</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float { animation: float 6s infinite ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-cardFloat { animation: cardFloat 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

// 3D Team Card Component
interface TeamCardProps {
  member: TeamMember;
  index: number;
}

const TeamCard: React.FC<TeamCardProps> = ({ member, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = (e.clientY - centerY) / 15;
    const rotateY = (centerX - e.clientX) / 15;
    setCardRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setCardRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="relative group perspective-1000"
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card Container with 3D Transform */}
      <div
        className="relative w-full transition-all duration-200 ease-out"
        style={{
          transform: `rotateX(${cardRotation.x * 0.5}deg) rotateY(${cardRotation.y * 0.5}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow Effect */}
        <div
          className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-md"
          style={{ background: member.glowColor }}
        ></div>

        {/* Card */}
        <div className="relative p-4 rounded-lg overflow-hidden backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
          {/* Glassmorphism shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent" style={{
              background: `linear-gradient(135deg, ${member.glowColor}, transparent) border-box`,
              WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Avatar with rotating border */}
            <div className="relative w-16 h-16 mx-auto mb-2 group-hover:scale-105 transition-transform duration-300">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${member.gradient} p-[3px] group-hover:animate-spin-slow`}>
                <div className="w-full h-full rounded-full bg-[#0c1a3a] p-[3px]">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.name}&background=3b82f6&color=fff&size=256`;
                    }}
                  />
                </div>
              </div>

              {/* Role badge */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${member.gradient} flex items-center gap-1 shadow-lg text-white text-xs font-bold whitespace-nowrap`}>
                {member.roleIcon}
                <span>{member.role}</span>
              </div>
            </div>

            {/* Name */}
            <h3 className="text-base font-bold text-white text-center mt-4 mb-1 group-hover:text-[#493fff] transition-colors duration-200">
              {member.name}
            </h3>

            {/* Description */}
            <p className="text-white/50 text-xs text-center leading-relaxed line-clamp-2">
              {member.description}
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/30 flex items-center justify-center text-white/60 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/30 flex items-center justify-center text-white/60 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/30 flex items-center justify-center text-white/60 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .group-hover\\:animate-spin-slow:hover {
          animation: spin-slow 3s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default TeamPage;
