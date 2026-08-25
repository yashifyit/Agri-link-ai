import React, { useState } from 'react';
import { X, Lock, Mail, Phone, ArrowRight, UserCheck, Sprout, Building2, Factory, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login, demoLogin, registerUser } = useAuth();
  const { setRole } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER_STEP_1' | 'REGISTER_STEP_2'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');

  const [loginInput, setLoginInput] = useState({ mobileOrEmail: '', password: '' });
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    state: 'Maharashtra',
    district: 'Nashik',
    village: '',
    businessName: '',
    gstin: '',
    fpoRegNo: '',
    memberCount: 150
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginInput.mobileOrEmail || 'ramesh@kisanlink.in', loginInput.password);
    onClose();
  };

  const handleDemoClick = (role: UserRole) => {
    demoLogin(role);
    setRole(role);
    onClose();
  };

  const handleRegComplete = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser({
      name: regData.name || (selectedRole === 'BUYER' ? regData.businessName : 'New Producer'),
      phone: regData.phone,
      email: regData.email,
      role: selectedRole,
      location: `${regData.district}, ${regData.state}`,
      businessName: regData.businessName,
      fpoRegNo: regData.fpoRegNo
    });
    setRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-modal border border-agriBorder relative overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: ARTISTIC AGRITECH HERO VISUAL */}
        <div className="w-full md:w-5/12 bg-forest text-white p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600"
              alt="Farmer background"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-agriGreen text-white flex items-center justify-center font-bold">
              KL
            </div>
            <h2 className="text-xl font-black text-white">KisanLink Portal</h2>
            <p className="text-xs text-white/80">Know the market. Find the right buyer. Sell at the right price.</p>
          </div>

          {/* Quick Demo Login Shortcut Buttons (Requirement 6) */}
          <div className="relative z-10 pt-6 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amberGold block">Judge Demo Instant Access:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => handleDemoClick('FARMER')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white border border-white/15 text-left transition-all"
              >
                👨‍🌾 Farmer View
              </button>
              <button
                onClick={() => handleDemoClick('BUYER')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white border border-white/15 text-left transition-all"
              >
                🏢 Buyer View
              </button>
              <button
                onClick={() => handleDemoClick('FPO')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white border border-white/15 text-left transition-all"
              >
                🚜 FPO View
              </button>
              <button
                onClick={() => handleDemoClick('ADMIN')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white border border-white/15 text-left transition-all"
              >
                📊 Command Ctr
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION / REGISTRATION FORMS */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-charcoal">Welcome back</h3>
                <p className="text-xs text-charcoal-muted">Sign in to your KisanLink producer/buyer portal</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Mobile Number or Email</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210 or ramesh@kisanlink.in"
                    value={loginInput.mobileOrEmail}
                    onChange={e => setLoginInput({ ...loginInput, mobileOrEmail: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginInput.password}
                    onChange={e => setLoginInput({ ...loginInput, password: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-agriGreen hover:bg-agriGreen-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                Sign In to KisanLink <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-charcoal-muted">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_STEP_1')}
                  className="font-bold text-forest hover:underline"
                >
                  Create account
                </button>
              </div>
            </form>
          ) : mode === 'REGISTER_STEP_1' ? (
            /* STEP 1: WHO ARE YOU? ROLE SELECTION (Requirement 3) */
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-charcoal">Who are you?</h3>
                <p className="text-xs text-charcoal-muted">Select your primary role on KisanLink</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'FARMER' as UserRole, icon: Sprout, title: '👨‍🌾 Farmer', desc: 'Sell harvested crops, view market intelligence & get direct buyer offers.' },
                  { id: 'FPO' as UserRole, icon: Building2, title: '🏢 Farmer Producer Org (FPO)', desc: 'Aggregate member lots for collective bargaining & bulk buyer deals.' },
                  { id: 'BUYER' as UserRole, icon: Factory, title: '🏭 Buyer / Processor', desc: 'Post procurement specs, discover verified supply lots & manage delivery.' }
                ].map((roleOpt) => (
                  <div
                    key={roleOpt.id}
                    onClick={() => setSelectedRole(roleOpt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === roleOpt.id
                        ? 'bg-agriGreen-light border-agriGreen shadow-md'
                        : 'bg-cream border-agriBorder hover:bg-white'
                    }`}
                  >
                    <h4 className="text-xs font-extrabold text-charcoal">{roleOpt.title}</h4>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">{roleOpt.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-xs font-semibold text-charcoal-muted"
                >
                  Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_STEP_2')}
                  className="px-5 py-2.5 bg-forest text-white text-xs font-bold rounded-xl shadow-sm hover:bg-forest-hover transition-all flex items-center gap-1"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: ROLE DETAILS FORM */
            <form onSubmit={handleRegComplete} className="space-y-3">
              <div>
                <h3 className="text-lg font-extrabold text-charcoal">Enter {selectedRole} Details</h3>
                <p className="text-xs text-charcoal-muted">Complete your KisanLink profile registration</p>
              </div>

              {selectedRole === 'FARMER' ? (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number"
                    value={regData.phone}
                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="State"
                      value={regData.state}
                      onChange={e => setRegData({ ...regData, state: e.target.value })}
                      className="bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="District"
                      value={regData.district}
                      onChange={e => setRegData({ ...regData, district: e.target.value })}
                      className="bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                    />
                  </div>
                </>
              ) : selectedRole === 'BUYER' ? (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Business / Company Name"
                    value={regData.businessName}
                    onChange={e => setRegData({ ...regData, businessName: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="GSTIN Number (Optional)"
                    value={regData.gstin}
                    onChange={e => setRegData({ ...regData, gstin: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none font-mono"
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    placeholder="FPO Name"
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="FPO Registration Number"
                    value={regData.fpoRegNo}
                    onChange={e => setRegData({ ...regData, fpoRegNo: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none font-mono"
                  />
                </>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_STEP_1')}
                  className="text-xs font-semibold text-charcoal-muted"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-agriGreen text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-agriGreen-hover transition-all"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
