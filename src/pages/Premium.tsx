import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Menu, X, Zap, Crown, Sparkles, Check, Star, ChevronDown,
    Shield, Users, MessageCircle, Gift, Home, FileText, Headphones,
    AlertTriangle, Pen, Award, Lock, Siren, Bot, Bolt, Heart
} from 'lucide-react';
import Modal from '../components/Modal';
import { secureStorage } from '../utils/secureStorage';
import logo from '../assests/logo.png';
// ────────────────────────────────────────────────────────────────
// Currency data with exchange rates (1 INR = X of target currency)
// Rates as of March 2026
// ────────────────────────────────────────────────────────────────
interface Currency {
    code: string;
    symbol: string;
    name: string;
    country: string;
    flag: string;
    rate: number; // 1 INR = rate * targetCurrency
}

const currencies: Currency[] = [
    { code: 'INR', symbol: '₹', name: 'INR', country: 'India', flag: 'IN', rate: 1 },
    { code: 'USD', symbol: '$', name: 'USD', country: 'United States', flag: 'US', rate: 0.0109 },
    { code: 'BRL', symbol: 'R$', name: 'BRL', country: 'Brazil', flag: 'BR', rate: 0.0574 },
    { code: 'PHP', symbol: '₱', name: 'PHP', country: 'Philippines', flag: 'PH', rate: 0.6427 },
    { code: 'IDR', symbol: 'Rp', name: 'IDR', country: 'Indonesia', flag: 'ID', rate: 183.45 },
    { code: 'GBP', symbol: '£', name: 'GBP', country: 'United Kingdom', flag: 'GB', rate: 0.0082 },
    { code: 'EUR', symbol: '€', name: 'EUR', country: 'European Union', flag: 'EU', rate: 0.0094 },
    { code: 'CAD', symbol: 'C$', name: 'CAD', country: 'Canada', flag: 'CA', rate: 0.0148 },
    { code: 'SGD', symbol: 'S$', name: 'SGD', country: 'Singapore', flag: 'SG', rate: 0.0138 },
    { code: 'TRY', symbol: '₺', name: 'TRY', country: 'Turkey', flag: 'TR', rate: 0.4796 },
    { code: 'PKR', symbol: 'Rs', name: 'PKR', country: 'Pakistan', flag: 'PK', rate: 3.0448 },
    { code: 'JPY', symbol: '¥', name: 'JPY', country: 'Japan', flag: 'JP', rate: 1.7027 },
];

// ────────────────────────────────────────────────────────────────
// Duration options for plan cards
// ────────────────────────────────────────────────────────────────
interface DurationOption {
    label: string;
    months: number;
    multiplier: number; // price multiplier (with discount)
}

const durationOptions: DurationOption[] = [
    { label: '1 Month', months: 1, multiplier: 1 },
    { label: '3 Months', months: 3, multiplier: 2.7 },    // 10% off
    { label: '6 Months', months: 6, multiplier: 4.8 },    // 20% off
    { label: '12 Months', months: 12, multiplier: 8.4 },  // 30% off
];

// ────────────────────────────────────────────────────────────────
// Plan data from screenshots
// ────────────────────────────────────────────────────────────────
interface PlanFeature {
    icon: React.ReactNode;
    text: string;
}

interface Plan {
    id: string;
    name: string;
    badge: string;
    badgeColor: string;
    priceINR: number;
    period: string;
    periodLabel: string;
    features: PlanFeature[];
    description?: string;
    cardBg: string;
    priceBg: string;
    buttonStyle: string;
    buttonText: string;
    hasDuration?: boolean; // whether the card shows a duration dropdown
}

const mainPlans: Plan[] = [
    {
        id: 'plus',
        name: 'Plus Plan',
        badge: 'Popular',
        badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black',
        priceINR: 299,
        period: '/month',
        periodLabel: '1 Month',
        cardBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
        priceBg: 'bg-gradient-to-r from-yellow-300 to-amber-400',
        buttonStyle: 'bg-black text-white hover:bg-gray-900',
        buttonText: 'Buy Now',
        features: [
            { icon: <Shield className="w-4 h-4" />, text: 'Limit System (advanced security)' },
            { icon: <Bot className="w-4 h-4" />, text: 'Automod (Anti Token Spam)' },
            { icon: <Lock className="w-4 h-4" />, text: 'Secure Channel Protection' },
            { icon: <Users className="w-4 h-4" />, text: 'Anti Betray System' },
            { icon: <AlertTriangle className="w-4 h-4" />, text: 'Auto Emergency Mode' },
            { icon: <Headphones className="w-4 h-4" />, text: '24/7 Support' },
        ],
        hasDuration: true,
    },
    {
        id: 'pro',
        name: 'Pro Plan',
        badge: 'Best Value',
        badgeColor: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
        priceINR: 499,
        period: '/month',
        periodLabel: '1 Month',
        cardBg: 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700',
        priceBg: 'bg-gradient-to-r from-violet-400 to-purple-500',
        buttonStyle: 'bg-black text-white hover:bg-gray-900',
        buttonText: 'Buy Now',
        features: [
            { icon: <Shield className="w-4 h-4" />, text: 'Limit System (advanced security)' },
            { icon: <Bot className="w-4 h-4" />, text: 'Automod (Anti Token Spam)' },
            { icon: <Lock className="w-4 h-4" />, text: 'Secure Channel Protection' },
            { icon: <Users className="w-4 h-4" />, text: 'Anti Betray System' },
            { icon: <AlertTriangle className="w-4 h-4" />, text: 'Auto Emergency Mode' },
            { icon: <Star className="w-4 h-4" />, text: 'Vanity Protection' },
            { icon: <Pen className="w-4 h-4" />, text: 'No-Prefix Access' },
            { icon: <Gift className="w-4 h-4" />, text: 'Advanced Giveaway System' },
            { icon: <Crown className="w-4 h-4" />, text: '24/7 Priority Support' },
        ],
        hasDuration: true,
    },
    {
        id: 'ultra-pro',
        name: 'Ultra Pro',
        badge: 'Premium',
        badgeColor: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        priceINR: 749,
        period: '/month',
        periodLabel: '1 Month',
        cardBg: 'bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-700',
        priceBg: 'bg-gradient-to-r from-yellow-300 to-amber-400',
        buttonStyle: 'bg-black text-white hover:bg-gray-900',
        buttonText: 'Buy Now',
        features: [
            { icon: <Shield className="w-4 h-4" />, text: 'Limit System (advanced security)' },
            { icon: <Bot className="w-4 h-4" />, text: 'Automod (Anti Token Spam)' },
            { icon: <Lock className="w-4 h-4" />, text: 'Secure Channel Protection' },
            { icon: <Users className="w-4 h-4" />, text: 'Anti Betray System' },
            { icon: <AlertTriangle className="w-4 h-4" />, text: 'Auto Emergency Mode' },
            { icon: <Star className="w-4 h-4" />, text: 'Vanity Protection' },
            { icon: <Pen className="w-4 h-4" />, text: 'No-Prefix Access' },
            { icon: <Gift className="w-4 h-4" />, text: 'Advanced Giveaway System' },
            { icon: <Crown className="w-4 h-4" />, text: '24/7 Priority Support' },
            { icon: <Siren className="w-4 h-4" />, text: 'Auto Member Recovery (Server Insurance)' },
        ],
        hasDuration: true,
    },
];

const addonPlans: Plan[] = [
    {
        id: 'server-insurance',
        name: 'Server Insurance',
        badge: 'Protection',
        badgeColor: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        priceINR: 299,
        period: '/month',
        periodLabel: '1 Month',
        cardBg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800',
        priceBg: 'bg-gradient-to-r from-red-400 to-red-500',
        buttonStyle: 'bg-white text-red-700 hover:bg-gray-100 font-bold',
        buttonText: 'Buy Now',
        description: 'Auto Member Recovery (Server Insurance) protects your Discord server by automatically recovering all members if your server gets nuked.\n\nInstead of manually recovering members one by one, Olympus will restore your server\'s member list automatically, eliminating the need for manual intervention. Keep your community safe and restore it instantly with server insurance.',
        features: [],
    },
    {
        id: 'no-prefix',
        name: 'No Prefix',
        badge: 'Smooth',
        badgeColor: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white',
        priceINR: 299,
        period: '/6 months',
        periodLabel: '6 Months',
        cardBg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-green-700',
        priceBg: 'bg-gradient-to-r from-emerald-300 to-green-400',
        buttonStyle: 'bg-white text-green-700 hover:bg-gray-100 font-bold',
        buttonText: 'Buy Now',
        description: 'Allow you to use Olympus Command without prefix, making your experience even more faster and smoother.\n\nWith No Prefix, every command becomes effortless, saving time while managing your server faster.',
        features: [],
    },
    {
        id: 'vanity-protection',
        name: 'Vanity Protection Only',
        badge: 'Protect',
        badgeColor: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
        priceINR: 265,
        period: '',
        periodLabel: '1 Month Only',
        cardBg: 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-800',
        priceBg: 'bg-gradient-to-r from-purple-400 to-violet-500',
        buttonStyle: 'bg-white/20 border border-white/30 text-white hover:bg-white/30 font-bold',
        buttonText: 'Join Support to Purchase',
        description: 'Protect your Discord Server Vanity (custom server invite link) with Olympus. Except the server owner, anyone trying to change it will be banned instantly, and your original vanity will be restored within a microsecond.\n\nStay protected and keep your brand identity safe with instant vanity recovery.',
        features: [],
    },
];

// ────────────────────────────────────────────────────────────────
// Price conversion helper
// ────────────────────────────────────────────────────────────────
function convertPrice(inrPrice: number, currency: Currency): string {
    const converted = inrPrice * currency.rate;
    // For currencies with large values (IDR, PKR), show no decimals
    if (currency.rate >= 1) {
        return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
    }
    // For small currencies show 2 decimal places
    return `${currency.symbol}${converted.toFixed(2)}`;
}

// ────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────
const PremiumPage: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
    const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);


     const handleDashboardClick = () => {
    const token = secureStorage.getItem('discord_token');
    if (!token) {
      navigate('/dashboard/login');
      return;
    }
    const selectedGuild = secureStorage.getItem('selected_guild');
    navigate(selectedGuild ? '/dashboard' : '/dashboard/servers');
  };


    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setCurrencyDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePurchase = (planId: string, planName: string, planPrice: string) => {
        setSelectedPlan({ id: planId, name: planName, price: planPrice });
        setShowPurchaseModal(true);
    };

    const handleConfirmPurchase = () => {
        if (selectedPlan) {
            navigate(`/support?purchase=${selectedPlan.id}&plan=${encodeURIComponent(selectedPlan.name)}&price=${encodeURIComponent(selectedPlan.price)}`);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-black relative flex flex-col" style={{ overflowX: 'clip' }}>
            {/* Background System */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-50"
                    style={{
                        background: 'radial-gradient(circle, #493fff 0%, transparent 70%)',
                        top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                    }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 100%)' }} />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(73,63,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(73,63,255,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
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
            <section className="pt-32 pb-8 px-4 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-full mb-6">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 text-sm font-medium">Premium Plans</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            Unlock Premium
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                            Features
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8">
                        Choose the perfect plan for your needs. Upgrade anytime and enjoy exclusive benefits.
                    </p>
                </div>
            </section>

            {/* Currency Selector — top right above plans */}
            <section className="px-4 relative z-20 -mb-2">
                <div className="max-w-7xl mx-auto flex justify-end">
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl border-2 border-amber-400 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                        >
                            <span className="text-sm">{selectedCurrency.flag}</span>
                            <span>{selectedCurrency.symbol} {selectedCurrency.code}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {currencyDropdownOpen && (
                            <div className="absolute top-full mt-2 right-0 w-64 max-h-80 overflow-y-auto bg-gradient-to-b from-amber-500 to-yellow-600 text-black rounded-xl shadow-2xl shadow-amber-500/40 border-2 border-amber-400 z-50">
                                {currencies.map((currency) => (
                                    <button
                                        key={currency.code}
                                        onClick={() => {
                                            setSelectedCurrency(currency);
                                            setCurrencyDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-black/10 transition-colors text-left ${selectedCurrency.code === currency.code ? 'bg-black/10 font-bold' : ''}`}
                                    >
                                        <span className="text-sm font-bold">{currency.flag}</span>
                                        <div className="flex-1">
                                            <span className="font-semibold">({currency.symbol} {currency.code})</span>
                                            <span className="ml-1 text-sm opacity-80">{currency.country}</span>
                                        </div>
                                        {selectedCurrency.code === currency.code && (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Plans — Plus, Pro, Ultra Pro */}
            <section id="plans" className="py-8 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                        {mainPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                currency={selectedCurrency}
                                onPurchase={handlePurchase}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Add-on Plans — Insurance, No Prefix, Vanity */}
            <section className="py-8 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                        {addonPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                currency={selectedCurrency}
                                onPurchase={handlePurchase}
                                isAddon
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Premium */}
            <section className="py-20 px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <h2 className="text-3xl font-bold text-white text-center mb-8">
                            Why Choose <span className="text-amber-400">Premium</span>?
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { icon: <Shield />, title: 'Advanced Protection', desc: 'Enhanced anti-nuke and security features' },
                                { icon: <Bolt />, title: 'Faster Response', desc: 'Priority processing for all commands' },
                                { icon: <Gift />, title: 'Exclusive Features', desc: 'Access features before anyone else' },
                                { icon: <Heart />, title: 'Priority Support', desc: '24/7 dedicated support team' },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-white/50 text-sm">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 px-4 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">
                        Frequently Asked <span className="text-amber-400">Questions</span>
                    </h2>
                    <div className="space-y-4">
                        {[
                            { q: 'How do I activate my premium?', a: "After purchase, you'll receive an activation code. Use /premium activate <code> in any server." },
                            { q: 'Can I transfer my premium?', a: 'Yes! Premium can be transferred to another server or user once per billing cycle.' },
                            { q: 'What payment methods are accepted?', a: 'We accept UPI, Credit/Debit cards, PayPal, and cryptocurrency.' },
                            { q: 'Is there a refund policy?', a: "Full refund within 7 days if you're not satisfied. No questions asked." },
                        ].map((faq, i) => (
                            <FAQItem key={i} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 backdrop-blur-xl border border-white/10 rounded-3xl"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 rounded-3xl blur-xl animate-pulse"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Go Premium?</h2>
                            <p className="text-white/60 mb-8 max-w-xl mx-auto">
                                Join thousands of users who upgraded their Discord experience. Start your premium journey today!
                            </p>
                            <button
                                onClick={() => document.querySelector('#plans')?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-full text-black font-bold text-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-500 hover:scale-105"
                            >
                                <Sparkles className="w-5 h-5" />
                                Get Started Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
                .perspective-1000 { perspective: 1000px; }
            `}</style>

            {/* Footer */}
            <footer className="relative z-50 bg-black border-t border-[#493fff]/30 pt-16 pb-8 px-6 mt-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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

                        <div>
                            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><Link to="/" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Home</Link></li>
                                <li><Link to="/docs" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Documentation</Link></li>
                                <li><Link to="/premium" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Premium Plans</Link></li>
                                <li><Link to="/team" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Our Team</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-lg">Support</h4>
                            <ul className="space-y-3">
                                <li><Link to="/support" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Get Support</Link></li>
                                <li><a href="https://discord.gg/zyphra" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Discord Server</a></li>
                                <li><a href="mailto:support@zyphra.bot" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Email Us</a></li>
                                <li><Link to="/support" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-lg">Legal</h4>
                            <ul className="space-y-3">
                                <li><Link to="/privacy" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Terms of Service</Link></li>
                                <li><Link to="/refund" className="text-white/50 hover:text-[#493fff] transition-colors text-sm">Refund Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-white/40 text-sm">© 2025 Cybernatics Development. All rights reserved.</p>
                            <p className="text-white/30 text-xs">Made with 💜 for Discord communities</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Purchase Modal */}
            <Modal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                variant="premium"
                title="Confirm Purchase"
                message={selectedPlan ? `You're about to purchase ${selectedPlan.name} for ${selectedPlan.price}. Click continue to open a support ticket and complete your purchase.` : ''}
                confirmText="Continue to Support"
                cancelText="Cancel"
                showCancel={true}
                onConfirm={handleConfirmPurchase}
            />
        </div>
    );
};

// ────────────────────────────────────────────────────────────────
// PlanCard Component
// ────────────────────────────────────────────────────────────────
interface PlanCardProps {
    plan: Plan;
    currency: Currency;
    onPurchase: (id: string, name: string, price: string) => void;
    isAddon?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, currency, onPurchase, isAddon }) => {
    const [selectedDuration, setSelectedDuration] = useState<DurationOption>(durationOptions[0]);
    const [durationOpen, setDurationOpen] = useState(false);
    const durationRef = useRef<HTMLDivElement>(null);

    // Close duration dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (durationRef.current && !durationRef.current.contains(e.target as Node)) {
                setDurationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate price based on selected duration
    const effectivePrice = plan.priceINR * selectedDuration.multiplier;
    const displayPrice = convertPrice(effectivePrice, currency);
    const displayLabel = plan.hasDuration ? selectedDuration.label : plan.periodLabel;

    return (
        <div className="animate-fadeIn h-full">
            {/* Card */}
            <div className={`relative rounded-2xl ${plan.cardBg} p-1 shadow-2xl h-full flex flex-col hover:shadow-3xl transition-shadow duration-300`}>
                <div className="rounded-xl flex flex-col flex-1">
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-black text-white drop-shadow-lg">{plan.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.badgeColor}`}>
                                {plan.badge}
                            </span>
                        </div>

                        {/* Price Box */}
                        <div className={`${plan.priceBg} rounded-xl p-4 text-center mb-4`}>
                            <div className="text-4xl font-black text-black">{displayPrice}</div>
                            <div className="text-sm text-black/70 font-semibold">{displayLabel}</div>
                        </div>

                        {/* Duration Dropdown */}
                        {plan.hasDuration ? (
                            <div ref={durationRef} className="relative mb-4 z-20">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDurationOpen(!durationOpen);
                                    }}
                                    className="w-full flex items-center justify-between bg-white/90 text-black font-semibold rounded-lg px-4 py-2.5 border-2 border-white/50 cursor-pointer hover:bg-white transition-colors focus:outline-none focus:border-white"
                                >
                                    <span>{selectedDuration.label}</span>
                                    <ChevronDown className={`w-4 h-4 text-black transition-transform duration-200 ${durationOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {durationOpen && (
                                    <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                        {durationOptions.map((opt) => (
                                            <button
                                                key={opt.months}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDuration(opt);
                                                    setDurationOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${selectedDuration.months === opt.months
                                                    ? 'bg-amber-100 text-amber-900'
                                                    : 'text-black hover:bg-gray-100'
                                                    }`}
                                            >
                                                <span>{opt.label}</span>
                                                {opt.months > 1 && (
                                                    <span className="ml-2 text-xs font-bold text-green-600">
                                                        Save {Math.round((1 - opt.multiplier / opt.months) * 100)}%
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative mb-4">
                                <div className="w-full bg-white/90 text-black font-semibold rounded-lg px-4 py-2.5 border-2 border-white/50">
                                    {plan.periodLabel}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Features or Description */}
                    <div className="px-6 pb-4 flex-1">
                        {plan.features.length > 0 ? (
                            <div className="space-y-2.5">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2.5 text-white">
                                        <span className="opacity-80 flex-shrink-0">{feature.icon}</span>
                                        <span className="text-sm font-medium">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-white/90 text-sm leading-relaxed whitespace-pre-line font-medium">
                                {plan.description}
                            </div>
                        )}
                    </div>

                    {/* Buy Button */}
                    <div className="p-6 pt-2 mt-auto">
                        <button
                            onClick={() => onPurchase(plan.id, plan.name, displayPrice)}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 ${plan.buttonStyle}`}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────
// FAQ Component
// ────────────────────────────────────────────────────────────────
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-amber-500/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
                <span className="text-white font-medium">{question}</span>
                <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-6 pb-4 text-white/60 text-sm">{answer}</div>
            </div>
        </div>
    );
};

export default PremiumPage;
