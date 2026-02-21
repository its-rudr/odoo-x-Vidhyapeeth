import { useNavigate } from 'react-router-dom';
import {
  Truck, Route, Wrench, Fuel, Users, BarChart3,
  ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp,
  ChevronRight, Globe, Phone, Mail, MapPin
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/* ───────────────────── animation hook ───────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ───────────────────── data ───────────────────── */
const features = [
  { icon: BarChart3, title: 'Command Center', desc: 'Real-time KPIs, fleet status charts, and recent activity — all at a glance in a high-density dashboard.', color: '#DD700B' },
  { icon: Truck, title: 'Vehicle Registry', desc: 'Track every asset — type, plate, status, and mileage — with instant search and modular management.', color: '#2563EB' },
  { icon: Route, title: 'Trip Dispatch', desc: 'Assign and monitor trips from origin to destination with live updates and smart route optimization.', color: '#7C3AED' },
  { icon: Wrench, title: 'Maintenance Logs', desc: 'Schedule services and set cost alerts to keep your fleet road-ready and minimize downtime.', color: '#059669' },
  { icon: Fuel, title: 'Expense Tracker', desc: 'Categorize fuel, tolls, and repair costs with detailed visual spending breakdowns per vehicle.', color: '#DC2626' },
  { icon: Users, title: 'Driver Profiles', desc: 'Manage licenses, contact info, and assignment history for your entire driver team seamlessly.', color: '#0891B2' },
];

const stats = [
  { value: '10K+', label: 'Trips Managed' },
  { value: '99.9%', label: 'Systems Uptime' },
  { value: '500+', label: 'Fleets Onboard' },
  { value: '35%', label: 'Cost Savings' },
];

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your account in seconds. Choose your role and set up your lab profile.', icon: Users },
  { num: '02', title: 'Add Fleet', desc: 'Register vehicles, onboarding your driver team, and configure your network.', icon: Truck },
  { num: '03', title: 'Manage', desc: 'Dispatch trips, track expenses, and monitor maintenance live from the dashboard.', icon: TrendingUp },
];

/* ───────────────────── component ───────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Scroll Spy Logic
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    const sections = ['features', 'how-it-works'];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          } else {
            setActiveSection(prev => prev === id ? '' : prev);
          }
        },
        { threshold: 0.2, rootMargin: '-10% 0px -20% 0px' }
      );
      observer.observe(el);
      return observer;
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observers.forEach(obs => obs?.disconnect());
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white font-bricolage overflow-x-hidden relative text-slate-800">
      {/* Visual Texture - Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #DD700B 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* ──────── Navbar ──────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-white/95 backdrop-blur-2xl shadow-xl shadow-black/[.05] border-slate-300/70' : 'bg-slate-50/30 backdrop-blur-md border-slate-200/40'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-xl shadow-black/[0.05] border border-slate-100 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 cursor-pointer">
              <img src="/logo.png" alt="FleetFlow" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">FleetFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-base font-black text-slate-700">
            <button 
              onClick={() => scrollTo('features')} 
              className={`transition relative group uppercase tracking-widest text-sm ${activeSection === 'features' ? 'text-[#DD700B]' : 'hover:text-[#DD700B]'}`}
            >
              Features
              <span className={`absolute -bottom-2 left-0 h-1 bg-[#DD700B] transition-all rounded-full ${activeSection === 'features' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => scrollTo('how-it-works')} 
              className={`transition relative group uppercase tracking-widest text-sm ${activeSection === 'how-it-works' ? 'text-[#DD700B]' : 'hover:text-[#DD700B]'}`}
            >
              How It Works
              <span className={`absolute -bottom-2 left-0 h-1 bg-[#DD700B] transition-all rounded-full ${activeSection === 'how-it-works' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="text-base font-black text-white px-8 py-3.5 rounded-2xl shadow-2xl shadow-[#DD700B]/30 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide" style={{ backgroundColor: '#DD700B' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ──────── Hero ──────── */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 bg-white overflow-hidden">
        {/* Layered Mesh Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-[0.08]" style={{ backgroundColor: '#DD700B' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-[0.12]" style={{ backgroundColor: '#FCF8D8' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] opacity-[0.03]" style={{ background: 'radial-gradient(circle, #DD700B 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 pt-20 pb-16">
          {/* Large Logo Display */}
          <div className="mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="inline-block p-2 rounded-3xl bg-white shadow-2xl border border-slate-100">
              <img src="/logo.png" alt="FleetFlow Logo" className="w-40 h-40 md:w-34 md:h-34 object-contain" />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 text-xs font-bold uppercase tracking-[0.2em] opacity-0 animate-fade-in-up shadow-sm" style={{ borderColor: 'rgba(221,112,11,.3)', backgroundColor: 'rgba(252,248,216,.5)', color: '#DD700B' }}>
            <BarChart3 size={14} className="animate-float" /> Next-Generation Logistics — Built for Performance
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Fleet Management <br/>
            <span className="relative inline-block">
              <span style={{ color: '#DD700B' }}>Reimagined</span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed font-medium opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            Streamline your vehicles, trips, and expenses in one powerful, unified platform. Zero complexity, maximum results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <button
              onClick={() => navigate('/login')}
              className="group flex items-center gap-3 px-8 py-4 text-white font-black rounded-xl shadow-2xl shadow-[#DD700B]/30 transition-all hover:scale-105 active:scale-95 text-base animate-glow-pulse"
              style={{ backgroundColor: '#DD700B' }}
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="px-8 py-4 text-slate-800 font-black rounded-xl border-2 border-slate-200 bg-white/70 backdrop-blur-md hover:border-[#DD700B]/30 hover:bg-white transition-all text-base shadow-sm"
            >
              Learn More
            </button>
          </div>

          {/* Multi-Image Showcase Section */}
          <div className="mt-16 relative max-w-6xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <div className="text-center mb-10">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#DD700B]/60">Operational Excellence</span>
              <h2 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">Live Fleet Operations</h2>
            </div>

            <div className="grid grid-cols-12 gap-4 auto-rows-[200px]">
              {/* Primary Large Highlight */}
              <div className="col-span-12 md:col-span-8 row-span-2 relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
                <img src="/Images/truck.webp" alt="Main Fleet" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-8 text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <p className="font-black text-xl tracking-tight leading-none mb-1">Heavy Logistics</p>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Global Network</p>
                </div>
              </div>

              {/* Secondary Vertical Stack */}
              <div className="col-span-12 md:col-span-4 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white group">
                <img src="/Images/Fleet.webp" alt="Fleet Overview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-[#DD700B]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="col-span-12 md:col-span-4 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white group">
                <img src="/Images/truck1.webp" alt="Distribution Fleet" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-[#DD700B]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Decorative Polish */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#DD700B]/5 rounded-full blur-3xl animate-pulse -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float -z-10" />
          </div>

          {/* Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-10 text-sm text-slate-500 font-bold uppercase tracking-widest opacity-80 opacity-0 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
            <span className="flex items-center gap-2.5 tracking-widest"><Shield size={18} className="text-[#DD700B]"/> Enterprise Security</span>
            <span className="flex items-center gap-2.5 tracking-widest"><Clock size={18} className="text-[#DD700B]"/> 5 Min Setup</span>
            <span className="flex items-center gap-2.5 tracking-widest"><Globe size={18} className="text-[#DD700B]"/> Cloud Native</span>
          </div>
        </div>
      </section>

      {/* ──────── Stats Bar ──────── */}
      <StatsBar />

      {/* ──────── Features (LIGHT & DENSE) ──────── */}
      <FeaturesSection />

      {/* ──────── How It Works ──────── */}
      <HowItWorks navigate={navigate} />

      {/* ──────── Final CTA ──────── */}
      <CTASection navigate={navigate} />

      {/* ──────── Footer ──────── */}
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  S U B ‑ C O M P O N E N T S                               */
/* ─────────────────────────────────────────────────────────── */

function StatsBar() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="z-10 relative py-8 bg-white/50 backdrop-blur-xl border-y border-slate-200/60 shadow-inner">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
        {stats.map((s, i) => (
          <div key={s.label} className={`text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${i * 100}ms` }}>
            <p className="text-3xl lg:text-5xl font-black tracking-tight" style={{ color: '#DD700B' }}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-2 font-black uppercase tracking-[0.2em] leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, visible] = useInView(0.1);
  return (
    <section id="features" ref={ref} className="py-16 px-6 bg-slate-50/50 overflow-hidden relative">
      {/* Visual Anchor Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #DD700B 0%, transparent 70%)' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-[#DD700B]">Capabilities</span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">Powerful Management Modules</h2>
          <div className="w-20 h-1.5 bg-[#DD700B]/30 mx-auto mt-4 rounded-full" />
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group p-8 rounded-[2rem] border border-slate-200/60 bg-white hover:border-[#DD700B]/40 hover:shadow-2xl hover:shadow-[#DD700B]/10 hover:-translate-y-2 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-md" style={{ backgroundColor: `${f.color}10`, border: `1px solid ${f.color}20` }}>
                <f.icon size={26} style={{ color: f.color }} className="group-hover:animate-float" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-[#DD700B] transition-colors">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ navigate }) {
  const [ref, visible] = useInView();
  return (
    <section id="how-it-works" ref={ref} className="py-16 px-6 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-[#DD700B]">Onboarding</span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">Scale Your Fleet FAST</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[40%] left-0 w-full h-1 border-t-2 border-dashed border-[#DD700B]/10 -translate-y-1/2 -z-10" />
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`group bg-slate-50/40 p-12 rounded-[3rem] border border-slate-100 text-center relative transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center text-white font-black shadow-2xl text-lg group-hover:scale-110 transition-transform">
                {s.num}
              </div>
              <div className="w-24 h-24 rounded-[2rem] mx-auto mb-10 flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-12 rotate-2 group-hover:scale-110" style={{ backgroundColor: '#DD700B' }}>
                <s.icon size={42} className="text-white group-hover:animate-float" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-[#DD700B] transition-colors">{s.title}</h3>
              <p className="text-slate-500 text-base font-medium leading-relaxed max-w-[240px] mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/login')}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 text-lg"
          >
            Access Dashboard Now <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

function CTASection({ navigate }) {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-16 px-6 bg-slate-50/30">
      <div className="max-w-6xl mx-auto relative rounded-[4rem] overflow-hidden px-10 py-16 text-center bg-white border border-slate-200/60 shadow-[0_32px_120px_-20px_rgba(221,112,11,0.1)]">
        {/* Large Decorative Gradients */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#DD700B]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 animate-float" />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">Ready to Dominate Your Logistics?</h2>
          <p className="text-slate-500 text-lg sm:text-2xl font-medium mb-12 opacity-90 max-w-2xl mx-auto">Join the future of fleet management. Scale effortlessly with FleetFlow.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-14 py-6 bg-[#DD700B] text-white font-black rounded-2xl shadow-2xl shadow-[#DD700B]/40 hover:bg-[#C1620A] transition-all hover:scale-105 active:scale-95 text-2xl"
          >
            Sign In Now
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="bg-slate-50 border-t-2 border-slate-200/60 pt-16 pb-12 px-6 relative overflow-hidden">
      {/* Footer Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#DD700B]/5 rounded-full blur-[80px] -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xl shadow-[#DD700B]/20">
                <img src="/logo.png" alt="FleetFlow" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">FleetFlow</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-bold uppercase tracking-widest opacity-60">Engineered for <br/> Modern Logistics 2026</p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-700 font-black tracking-tight">
              <li><button onClick={() => scrollTo('features')} className="hover:text-[#DD700B] transition">Performance</button></li>
              <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-[#DD700B] transition">Scalability</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Modules</h4>
            <ul className="space-y-4 text-sm text-slate-700 font-black tracking-tight">
              <li className="flex items-center gap-2"><Truck size={14} className="text-[#DD700B]/60"/> Vehicles</li>
              <li className="flex items-center gap-2"><Route size={14} className="text-[#DD700B]/60"/> Trips</li>
              <li className="flex items-center gap-2"><Fuel size={14} className="text-[#DD700B]/60"/> Expenses</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Connect</h4>
            <ul className="space-y-4 text-sm text-slate-700 font-black tracking-tight flex flex-col">
              <li className="flex items-center gap-2"><Mail size={16} className="text-[#DD700B]/60"/> team@fleetflow.dev</li>
              <li className="flex items-center gap-2"><MapPin size={16} className="text-[#DD700B]/60"/> India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/60 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] opacity-40">© 2026 FleetFlow — All Rights Reserved</p>
          <div className="flex gap-8 text-xs text-slate-400 font-black uppercase tracking-[0.2em] opacity-40">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
