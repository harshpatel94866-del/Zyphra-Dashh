import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Shield, Music, Users, Crown, ArrowRight, Menu, X, ChevronDown, Sparkles, Star, Home, FileText, Headphones } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import anime from 'animejs';
import { secureStorage } from '../utils/secureStorage';
import { useTheme } from '../context/ThemeContext';
import logo from '../assests/logo.png';

// ─── Animated Counter Component (Anime.js) ─────────────────────────────────
const AnimatedCounter: React.FC<{ target: string; color: string }> = ({ target, color }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && ref.current && !hasAnimated.current) {
      hasAnimated.current = true;
      const numericPart = parseFloat(target.replace(/[^0-9.]/g, ''));
      const suffix = target.replace(/[0-9.]/g, '');
      const obj = { val: 0 };

      anime({
        targets: obj,
        val: numericPart,
        round: target.includes('.') ? 10 : 1,
        duration: 2000,
        easing: 'easeOutExpo',
        update: () => {
          if (ref.current) {
            const display = target.includes('.')
              ? obj.val.toFixed(1)
              : Math.round(obj.val).toString();
            ref.current.textContent = display + suffix;
          }
        }
      });
    }
  }, [isInView, target]);

  return (
    <div
      ref={ref}
      className={`text-6xl md:text-7xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent mb-4`}
    >
      0
    </div>
  );
};

// ─── Floating Particles Background (Anime.js) ──────────────────────────────
const ParticleField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const particles = containerRef.current.querySelectorAll('.particle');

    particles.forEach((particle, i) => {
      anime({
        targets: particle,
        translateY: [anime.random(0, 40), anime.random(-600, -200)],
        translateX: [anime.random(-30, 30), anime.random(-60, 60)],
        opacity: [0, { value: 0.6, duration: 800 }, { value: 0, duration: 800 }],
        scale: [0.5, anime.random(0.8, 1.5)],
        duration: anime.random(4000, 8000),
        delay: anime.random(0, 5000) + i * 200,
        loop: true,
        easing: 'easeInOutQuad',
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: `radial-gradient(circle, ${['#493fff', '#7c6fff', '#3b82f6', '#06b6d4'][Math.floor(Math.random() * 4)]}, transparent)`,
            opacity: 0,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};

// ─── Stagger Animation Wrapper ──────────────────────────────────────────────
const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const fadeUpItem: any = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const scaleUpItem: any = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 14 }
  }
};

// ─── Feature Card with Magnetic Hover ───────────────────────────────────────
const FeatureCard: React.FC<{ feature: any; index: number }> = ({ feature, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.background = `radial-gradient(400px at ${x}px ${y}px, rgba(73,63,255,0.12), transparent 60%)`;
  };

  return (
    <motion.div
      ref={cardRef}
      variants={scaleUpItem}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
      className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors duration-500 overflow-hidden"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-[var(--theme-text)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-[var(--theme-text)]">{feature.title}</h3>
      <p className="text-[var(--theme-text-secondary)]">{feature.desc}</p>

      {/* Cursor-following glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN HOME PAGE
// ════════════════════════════════════════════════════════════════════════════
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { solidBgClass, glowClass, primaryColorClass } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Section refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const featuresInView = useInView(featuresRef, { once: true, amount: 0.15 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const faqInView = useInView(faqRef, { once: true, amount: 0.15 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleDashboardClick = () => {
    const token = secureStorage.getItem('discord_token');
    if (!token) { navigate('/dashboard/login'); return; }
    const selectedGuild = secureStorage.getItem('selected_guild');
    navigate(selectedGuild ? '/dashboard' : '/dashboard/servers');
  };

  const toggleFAQ = (index: number) => setOpenFAQ(openFAQ === index ? null : index);

  const faqs = [
    { question: 'How do I add Zyphra Bot to my server?', answer: 'Click the "Add to Discord" button, select your server, and authorize. The bot will be ready instantly.' },
    { question: 'Is Zyphra Bot safe to use?', answer: 'Yes! We follow Discord\'s ToS and best security practices. Your data is encrypted.' },
    { question: 'How do I get support?', answer: 'Join our support server or contact us at support@zyphra.site. We\'re available 24/7.' },
    { question: 'Does Zyphra Bot offer premium?', answer: 'Yes! Premium includes advanced moderation, custom branding, priority support, and more.' },
    { question: 'Can I use in multiple servers?', answer: 'Absolutely! Add Zyphra to as many servers as you want.' }
  ];

  const features = [
    { icon: <Shield className="w-8 h-8" />, title: 'Anti-Nuke Protection', desc: 'Advanced security from raids and attacks', gradient: 'from-red-500 to-orange-500' },
    { icon: <Users className="w-8 h-8" />, title: 'Auto Moderation', desc: 'Intelligent spam detection and filtering', gradient: 'from-blue-500 to-cyan-500' },
    { icon: <Music className="w-8 h-8" />, title: 'Music Player', desc: 'High-quality streaming with playlists', gradient: 'from-purple-500 to-pink-500' },
    { icon: <Zap className="w-8 h-8" />, title: 'Custom Commands', desc: 'Personalized commands for your server', gradient: 'from-yellow-500 to-amber-500' },
    { icon: <Crown className="w-8 h-8" />, title: 'Premium Features', desc: 'Exclusive tools for power users', gradient: 'from-emerald-500 to-teal-500' },
    { icon: <Shield className="w-8 h-8" />, title: '24/7 Uptime', desc: '99.9% uptime guarantee', gradient: 'from-indigo-500 to-violet-500' }
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] overflow-x-hidden">
      {/* ─── Opening Animation ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--theme-bg)]"
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-8 border-2 border-blue-500/30 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -inset-4 border border-cyan-500/50 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className={`w-24 h-24 ${solidBgClass} rounded-full flex items-center justify-center shadow-2xl ${glowClass}`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-12 h-12 text-[var(--theme-text)]" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Background System ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[var(--theme-bg)]">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-50"
          style={{
            background: 'radial-gradient(circle, #493fff 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            willChange: 'opacity'
          }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 100%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(var(--theme-primary) 1px, transparent 1px), linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* ─── Navigation ────────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-[var(--theme-bg)]/60 backdrop-blur-xl border-b border-[#493fff]/20"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              
                <img src={logo} alt="Zyphra Logo" className="w-12 h-12 text" />
            
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent stroke-white-500">Zyphra</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[
                { name: 'Home', icon: <Home className="w-4 h-4" /> },
                { name: 'Docs', icon: <FileText className="w-4 h-4" /> },
                { name: 'Team', icon: <Users className="w-4 h-4" /> },
                { name: 'Support', icon: <Headphones className="w-4 h-4" /> },
                { name: 'Premium', icon: <Crown className="w-4 h-4" /> }
              ].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                >
                  <Link
                    to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`}
                    className="relative flex items-center gap-2 opacity-60 text-[var(--theme-text)] hover:text-[var(--theme-text)] transition-colors py-2 group"
                  >
                    {item.icon}
                    {item.name}
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${solidBgClass} group-hover:w-full transition-all duration-300`} />
                  </Link>
                </motion.div>
              ))}
              <motion.button
                onClick={handleDashboardClick}
                className={`px-6 py-2.5 ${solidBgClass} rounded-full font-semibold text-[var(--theme-text)] hover:shadow-lg ${glowClass} transition-shadow duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                Dashboard
              </motion.button>
            </div>

            <button className="md:hidden text-[var(--theme-text)] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden bg-[var(--theme-bg)]/95 backdrop-blur-xl border-t border-[#493fff]/20 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="px-6 py-6 space-y-4">
                {[
                  { name: 'Home', icon: <Home className="w-4 h-4" /> },
                  { name: 'Docs', icon: <FileText className="w-4 h-4" /> },
                  { name: 'Team', icon: <Users className="w-4 h-4" /> },
                  { name: 'Support', icon: <Headphones className="w-4 h-4" /> },
                  { name: 'Premium', icon: <Crown className="w-4 h-4" /> }
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`} className="flex items-center gap-2 opacity-80 text-[var(--theme-text)] hover:text-[var(--theme-text)] py-2">
                      {item.icon}
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.button
                  onClick={handleDashboardClick}
                  className={`w-full py-3 ${solidBgClass} rounded-xl font-semibold`}
                  whileTap={{ scale: 0.97 }}
                >
                  Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Badge */}
          <motion.div
            variants={fadeUpItem}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme-primary/10 border border-theme-primary/20 mb-8`}
          >
            <Sparkles className={`w-4 h-4 ${primaryColorClass}`} />
            <span className={`text-sm ${primaryColorClass} font-medium`}>The Ultimate Discord Companion</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={fadeUpItem}
            className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-tight"
          >
            <span className="block text-[var(--theme-text)]">ELEVATE YOUR </span>
            <span className="relative inline-block">
              <motion.span
                className={`relative z-10 text-transparent bg-clip-text ${solidBgClass}`}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 100%' }}
              >
                DISCORD SERVER
              </motion.span>
              <motion.div
                className={`absolute -bottom-2 left-0 w-full h-2 ${solidBgClass} opacity-50 blur-sm`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUpItem}
            className="text-xl md:text-2xl text-[var(--theme-text-secondary)] max-w-3xl mx-auto mb-10"
          >
            Powerful anti-nuke, auto-moderation, custom roles, temp-voice, and 100+ features to transform your community.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUpItem} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="https://discord.com/oauth2/authorize?client_id=1335133474226438176&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.gg%2FQGMYdDfBYj&integration_type=0&scope=guilds.join+bot"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative px-8 py-4 ${solidBgClass} rounded-xl font-bold text-lg overflow-hidden`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Add to Discord
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
              <motion.div
                className={`absolute inset-0 bg-white/20`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/docs"
                className="inline-block px-8 py-4 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/5 hover:border-white/20 transition-all duration-300"
              >
                Documentation
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating Decorative Elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-20 h-20 border border-theme-primary/20 rounded-2xl"
          animate={{
            rotate: [45, 55, 45],
            y: [0, -20, 0],
          }}
          style={{ willChange: 'transform' }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={`absolute bottom-1/4 right-10 w-16 h-16 bg-theme-primary/20 rounded-full blur-sm`}
          animate={{ y: [0, 15, 0] }}
          style={{ willChange: 'transform' }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-theme-primary rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </section>

      {/* ─── Features Section ──────────────────────────────────────────── */}
      <section ref={featuresRef} className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Need</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Section with Anime.js Counters ─────────────────────── */}
      <section ref={statsRef} className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
          >
            {[
              { number: '1K+', label: 'Servers Protected', color: 'from-blue-400 to-cyan-400' },
              { number: '30K+', label: 'Users Served', color: 'from-purple-400 to-pink-400' },
              { number: '99.9%', label: 'Uptime Guarantee', color: 'from-emerald-400 to-teal-400' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleUpItem}
                whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
                className="relative text-center p-10 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden group hover:border-white/10 transition-colors duration-500"
              >
                <AnimatedCounter target={stat.number} color={stat.color} />
                <div className="text-[var(--theme-text-secondary)] text-lg">{stat.label}</div>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ Section with AnimatePresence ──────────────────────────── */}
      <section ref={faqRef} className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked
              <span className={`text-transparent bg-clip-text ${solidBgClass}`}> Questions</span>
            </h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate={faqInView ? 'visible' : 'hidden'}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeUpItem}
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-colors duration-300 hover:border-white/10"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-[var(--theme-text)]">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <ChevronDown className="w-5 h-5 text-[var(--theme-text-secondary)]" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-[var(--theme-text-secondary)]">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────────────── */}
      <section ref={ctaRef} className="relative py-32 px-6">
        <motion.div
          className={`max-w-4xl mx-auto text-center p-12 rounded-3xl ${solidBgClass} bg-opacity-10 border border-theme-primary/20 relative overflow-hidden`}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={ctaInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, type: 'spring', stiffness: 80 }}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            className="text-xl text-[var(--theme-text-secondary)] mb-8"
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25 }}
          >
            Join thousands of servers already using Zyphra
          </motion.p>
          <motion.button
            onClick={handleDashboardClick}
            className={`px-10 py-4 ${solidBgClass} rounded-xl font-bold text-lg`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Open Dashboard
          </motion.button>

          {/* Animated decorative elements */}
          <motion.div
            className="absolute -top-20 -left-20 w-40 h-40 bg-theme-primary/20 rounded-full blur-3xl"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ willChange: 'opacity' }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-40 h-40 bg-theme-primary/20 rounded-full blur-3xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{ willChange: 'opacity' }}
          />
        </motion.div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-50 bg-gradient-to-b from-black to-theme-bg-secondary border-t border-theme-primary/30 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${solidBgClass} rounded-xl flex items-center justify-center shadow-lg ${glowClass}`}>
                  <img src={logo} alt="Zyphra Logo" className="w-12 h-12 text" />
                </div>
                <span className="font-bold text-2xl text-[var(--theme-text)]">Zyphra</span>
              </div>
              <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed mb-6">
                The ultimate Discord bot for server management, moderation, music, and entertainment. Trusted by thousands of servers worldwide.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://discord.gg/zyphra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#493fff]/20 border border-white/10 rounded-lg flex items-center justify-center opacity-60 text-[var(--theme-text)] hover:text-[#493fff] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                </a>
                <a href="https://github.com/zyphra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#493fff]/20 border border-white/10 rounded-lg flex items-center justify-center opacity-60 text-[var(--theme-text)] hover:text-[#493fff] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a href="https://twitter.com/zyphra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#493fff]/20 border border-white/10 rounded-lg flex items-center justify-center opacity-60 text-[var(--theme-text)] hover:text-[#493fff] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[var(--theme-text)] font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Home</Link></li>
                <li><Link to="/docs" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Documentation</Link></li>
                <li><Link to="/premium" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Premium Plans</Link></li>
                <li><Link to="/team" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Our Team</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-[var(--theme-text)] font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3">
                <li><Link to="/support" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Get Support</Link></li>
                <li><a href="https://discord.gg/zyphra" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Discord Server</a></li>
                <li><a href="mailto:support@zyphra.site" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Email Us</a></li>
                <li><Link to="/docs" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-[var(--theme-text)] font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Terms of Service</Link></li>
                <li><Link to="/refund" className="text-[var(--theme-text-secondary)] hover:text-[#493fff] transition-colors text-sm">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Giant Footer Brand */}
          <div className="border-t border-white/10 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <motion.p
                className={`${solidBgClass} bg-clip-text text-transparent text-[164px] font-black tracking-wide`}
                initial={{ opacity: 0.3 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                ZYPHRA
              </motion.p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[var(--theme-text)]/40 text-sm">© 2025 Cybernatics Development. All rights reserved.</p>
              <p className="text-[var(--theme-text)]/30 text-xs">Made with 💜 for Discord communities</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
