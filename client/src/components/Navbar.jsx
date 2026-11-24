import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Globe, 
  UserCircle, 
  RotateCcw, 
  Bell, 
  Sparkles, 
  CheckCircle2,
  ChevronDown,
  Building2,
  Lock,
  LogOut
} from 'lucide-react';

export function Navbar({ onOpenAiModal, onOpenLedgerModal }) {
  const { user, allUsers, switchUser, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset all sample tenders, bids, and ledger to default state?')) return;
    setResetting(true);
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      alert('Reset failed');
    } finally {
      setResetting(false);
    }
  };

  const notifications = [
    { id: 1, title: 'Technical Bid Deadline Approaching', desc: 'TDR-2026-001 technical bid evaluation due tomorrow', time: '10m ago' },
    { id: 2, title: 'Corrigendum 1 Issued', desc: 'Delivery extended for GPU Workstations', time: '1h ago' },
    { id: 3, title: 'New Pre-Bid Query', desc: 'Apex Facilities posted a query on TDR-2026-003', time: '3h ago' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1c110f] border-b border-[#36211d] text-[#f8f4ee] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8f3621] via-[#9e462e] to-[#b86144] flex items-center justify-center shadow-lg shadow-[#8f3621]/30 text-white font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-[#f3ebe4] to-[#eed9be] bg-clip-text text-transparent">
                UniTender
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3 h-3 mr-1" />
                GFR 2017 & CVC
              </span>
            </div>
            <p className="text-[11px] text-[#baa197] hidden sm:block">
              {t('portalSubtitle')}
            </p>
          </div>
        </div>

        {/* Center: AI Assistant & Blockchain Ledger Quick Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#8f3621]/25 to-[#b86144]/20 text-[#e8a394] border border-[#8f3621]/40 hover:bg-[#8f3621]/35 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8a394]" />
            <span>AI Procurement Assistant</span>
          </button>

          <button
            onClick={onOpenLedgerModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#291714] text-[#dfd0c5] border border-[#422621] hover:bg-[#361e1a] transition"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>SHA-256 Ledger</span>
          </button>
        </div>

        {/* Right: Actions (Language, Notifications, Role Switcher) */}
        <div className="flex items-center space-x-3">
          
          {/* Language Switcher */}
          <div className="flex items-center bg-[#291714] rounded-lg p-0.5 border border-[#422621]">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-xs rounded font-medium transition ${lang === 'en' ? 'bg-[#9e462e] text-white shadow-xs' : 'text-[#baa197] hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 text-xs rounded font-medium transition ${lang === 'hi' ? 'bg-[#9e462e] text-white shadow-xs' : 'text-[#baa197] hover:text-white'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLang('mr')}
              className={`px-2 py-1 text-xs rounded font-medium transition ${lang === 'mr' ? 'bg-[#9e462e] text-white shadow-xs' : 'text-[#baa197] hover:text-white'}`}
            >
              मराठी
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-[#baa197] hover:text-white hover:bg-[#2b1814] transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#221310] border border-[#3d241f] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-[#3d241f] pb-2 mb-2">
                  <span className="text-xs font-bold text-[#eed9be]">System Notifications</span>
                  <span className="text-[10px] text-[#e89b8d]">3 Unread</span>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-[#2d1a16]/70 hover:bg-[#2d1a16] text-xs">
                      <p className="font-semibold text-[#f8f4ee]">{n.title}</p>
                      <p className="text-[11px] text-[#baa197] mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-[#8e746d] block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#291714] hover:bg-[#361e1a] border border-[#422621] text-xs transition"
            >
              <div className="w-6 h-6 rounded-full bg-[#9e462e]/30 text-[#e89b8d] border border-[#9e462e]/40 flex items-center justify-center font-bold text-[10px]">
                {user?.role?.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-[#f8f4ee] leading-tight">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-[#baa197] capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#baa197]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#201311] border border-[#3d241f] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-[#3d241f] mb-1">
                  <p className="text-xs font-bold text-[#eed9be]">Switch User Role Simulator</p>
                  <p className="text-[10px] text-[#baa197]">Test all institutional roles with 1 click</p>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        u.id === user?.id 
                          ? 'bg-[#9e462e]/25 text-[#e89b8d] border border-[#9e462e]/40' 
                          : 'hover:bg-[#2c1a16] text-[#dfd0c5]'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-[#f8f4ee]">{u.name}</p>
                        <p className="text-[10px] text-[#baa197]">{u.roleTitle || u.role}</p>
                      </div>
                      {u.twoFactorEnabled && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          2FA
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Reset and Sign Out buttons inside menu */}
                <div className="mt-2 pt-2 border-t border-[#3d241f] space-y-1">
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{resetting ? 'Resetting...' : 'Reset Demo Seed Data'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs text-[#dfd0c5] hover:text-white hover:bg-[#2c1a16] rounded-lg transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out to Login Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Sign Out Button */}
          <button
            onClick={logout}
            title="Sign Out to Login Page"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#852718]/40 hover:bg-[#852718]/70 border border-[#852718]/60 text-red-200 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5 text-red-300" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

        </div>

      </div>
    </header>
  );
}
