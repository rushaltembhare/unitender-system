import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  UserPlus,
  LogIn
} from 'lucide-react';

export function LoginPage() {
  const { 
    allUsers, 
    loginWithCredentials, 
    signUp, 
    verify2faLogin, 
    cancel2fa, 
    is2faRequired, 
    pendingUser, 
    simulatedOtp 
  } = useAuth();
  const { lang, setLang, t } = useLanguage();

  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');
  
  // Sign In Form States with Persistent "Remember Me"
  const [username, setUsername] = useState(() => localStorage.getItem('unitender_saved_username') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('unitender_saved_password') || '');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('unitender_remember_me') === 'true');
  const [signInError, setSignInError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  // Sign Up Form States (First-Time User Registration)
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('vendor'); // 'vendor' | 'department'
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regPhone, setRegPhone] = useState('+91 98980 12345');
  const [regGstin, setRegGstin] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regMsme, setRegMsme] = useState(true);
  const [regUdyam, setRegUdyam] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  // 2FA Verification States
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInError('');
    setSigningIn(true);

    // Save or clear remembered credentials
    if (rememberMe) {
      localStorage.setItem('unitender_saved_username', username);
      localStorage.setItem('unitender_saved_password', password);
      localStorage.setItem('unitender_remember_me', 'true');
    } else {
      localStorage.removeItem('unitender_saved_username');
      localStorage.removeItem('unitender_saved_password');
      localStorage.setItem('unitender_remember_me', 'false');
    }

    const result = await loginWithCredentials(username, password);
    setSigningIn(false);

    if (!result.success) {
      setSignInError(result.message || 'Invalid username or password.');
    } else {
      setOtpInput('');
      setOtpError('');
    }
  };

  // Handle First-Time Sign Up Submit
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');

    if (regPassword !== regConfirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }

    setSigningUp(true);
    const result = await signUp({
      name: regFullName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      role: regRole,
      department: regRole === 'vendor' ? 'Commercial Bidder' : regDepartment,
      phone: regPhone,
      gstin: regGstin,
      pan: regPan,
      msmeRegistered: regMsme,
      msmeUdyam: regUdyam
    });
    setSigningUp(false);

    if (!result.success) {
      setSignUpError(result.message || 'Registration failed.');
    } else {
      setOtpInput('');
      setOtpError('');
    }
  };

  // Handle 2FA Verification Submit
  const handleVerify2fa = async (e) => {
    e.preventDefault();
    if (!otpInput) {
      setOtpError('Please enter the 6-digit OTP passcode');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    const result = await verify2faLogin(otpInput);
    setVerifyingOtp(false);

    if (!result.success) {
      setOtpError(result.message || 'Incorrect OTP code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#180e0c] via-[#241512] to-[#120807] flex flex-col justify-between text-stone-100 font-sans selection:bg-[#9e462e] selection:text-white">
      
      {/* Top Header Bar */}
      <header className="border-b border-[#3b231e]/80 bg-[#1e110f]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#833824] via-[#9e462e] to-[#b86144] flex items-center justify-center shadow-lg shadow-[#833824]/30 text-white font-bold">
              <Building2 className="w-6 h-6 drop-shadow-sm" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#fbf7f2]">
                UniTender
              </span>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#2b1814] rounded-lg p-0.5 border border-[#452721]">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${lang === 'en' ? 'bg-[#9e462e] text-white shadow-xs' : 'text-stone-300 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${lang === 'hi' ? 'bg-[#9e462e] text-white shadow-xs' : 'text-stone-300 hover:text-white'}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang('mr')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${lang === 'mr' ? 'bg-[#9e462e] text-white shadow-xs' : 'text-stone-300 hover:text-white'}`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-[#fdfbf7] text-[#2c1d1a] shadow-2xl border border-[#452721]/30 overflow-hidden">
          
          {/* Left Hero Panel with University Graphic in Rich Brown & Shadow (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#1c0f0d] via-[#261512] to-[#140a08] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_70px_rgba(0,0,0,0.9)] border-r border-[#3a221d]/80">
            
            {/* Ambient Vignette & Warm Brick Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#9e462e]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-between h-full text-center space-y-6">
              
              {/* Universal Academic Portal Emblem */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#b86144] via-[#d4af37] to-[#833824] p-0.5 shadow-[0_10px_25px_rgba(0,0,0,0.85)]">
                  <div className="w-full h-full rounded-full bg-[#180d0b] border border-[#d4af37]/35 flex items-center justify-center p-2 text-[#e8cda2] shadow-inner">
                    <Building2 className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  </div>
                </div>
                <div className="text-center pt-1">
                  <h3 className="text-sm font-extrabold tracking-widest text-[#eed9be] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    University Tender Portal
                  </h3>
                  <p className="text-[10px] text-[#c29f7f] tracking-wider uppercase font-semibold">
                    Academic e-Procurement Gateway
                  </p>
                </div>
              </div>

              {/* University Campus Graphic in Deep Shadow */}
              <div className="w-full max-w-[310px] my-auto py-2">
                <div className="relative p-2.5 rounded-2xl bg-[#140a08]/85 shadow-[0_25px_50px_rgba(0,0,0,0.95)] border border-[#42251f]/80 backdrop-blur-sm group overflow-hidden">
                  <img
                    src="/university_building.png"
                    alt="University Tender Portal"
                    className="w-full h-auto object-contain rounded-xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)] transition transform group-hover:scale-[1.02] duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140a08]/50 via-transparent to-transparent pointer-events-none rounded-2xl" />
                </div>
              </div>

              {/* Universal Portal Title */}
              <div className="space-y-1 text-center">
                <h2 className="text-base font-bold text-[#f5ece3] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  UniTender
                </h2>
                <p className="text-[11px] text-[#baa197]">
                  Online Tender Management System for Schools & Universities
                </p>
              </div>

            </div>

          </div>

          {/* Right Workspace (7 cols) */}
          <div className="lg:col-span-7 bg-[#fffdfa] p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            {/* Step 2: Two-Factor Authentication View */}
            {is2faRequired && pendingUser ? (
              <div className="max-w-md mx-auto w-full space-y-5 animate-in fade-in zoom-in-95 my-auto">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-[#fbf3ef] border border-[#f2d8cd] text-[#9e462e] flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2c1d1a] pt-2">Two-Factor Authentication</h3>
                  <p className="text-xs text-[#78615c]">
                    Signing in as <strong className="text-[#2c1d1a]">{pendingUser.name}</strong> ({pendingUser.roleTitle || pendingUser.role})
                  </p>
                </div>

                {/* Demo OTP Helper Box */}
                <div className="bg-[#fbf5eb] border border-[#ebd7be] rounded-xl p-3 text-xs text-[#784617] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] block text-[#8d541f]">Test Authorization OTP:</span>
                    <strong className="text-sm font-mono tracking-widest">{simulatedOtp}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpInput(simulatedOtp)}
                    className="px-2.5 py-1 bg-[#9e462e] hover:bg-[#833824] text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Auto-fill
                  </button>
                </div>

                <form onSubmit={handleVerify2fa} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#45312d] mb-1.5 text-center">
                      Enter 6-Digit One-Time Passcode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="742910"
                      className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 border border-[#dfd4c8] rounded-xl focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none bg-[#fdfbf8] text-[#2c1d1a]"
                    />
                    {otpError && (
                      <p className="text-xs text-red-600 font-semibold mt-1.5 text-center flex items-center justify-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        {otpError}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={cancel2fa}
                      className="flex-1 py-2.5 px-4 border border-[#dfd4c8] text-stone-700 font-bold rounded-xl text-xs hover:bg-[#fbf7f2] transition"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={verifyingOtp}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#8f3621] to-[#b34c34] hover:from-[#7c2e1b] hover:to-[#9e3f28] text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify & Enter Portal'}
                    </button>
                  </div>
                </form>

                <p className="text-[11px] text-[#937b75] text-center">
                  Protected under Session Inactivity Timeout and Cryptographic Re-Authentication Rules.
                </p>
              </div>
            ) : (
              /* Step 1: Sign In vs Sign Up Tabs */
              <div className="space-y-5 my-auto">
                
                {/* Mode Selector Tabs */}
                <div className="flex border-b border-[#ebdcd0]">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setSignInError(''); }}
                    className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center space-x-1.5 ${
                      authMode === 'signin'
                        ? 'border-[#9e462e] text-[#9e462e] bg-[#fbf5f2]'
                        : 'border-transparent text-[#78615c] hover:text-[#2c1d1a]'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setSignUpError(''); }}
                    className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center space-x-1.5 ${
                      authMode === 'signup'
                        ? 'border-[#9e462e] text-[#9e462e] bg-[#fbf5f2]'
                        : 'border-transparent text-[#78615c] hover:text-[#2c1d1a]'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>First-Time Sign Up</span>
                  </button>
                </div>

                {/* MODE 1: SIGN IN WITH USERNAME & PASSWORD */}
                {authMode === 'signin' && (
                  <div className="space-y-4">
                    <form onSubmit={handleSignInSubmit} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Username / Institutional Email / GSTIN</label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. admin or procurement@univ.edu.in"
                          className="w-full p-2.5 border border-[#dfd4c8] rounded-xl focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Password</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full p-2.5 border border-[#dfd4c8] rounded-xl focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none font-mono bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>

                      {/* Remember Me Option */}
                      <div className="flex items-center justify-between py-1">
                        <label className="flex items-center space-x-2 text-xs text-[#5c4742] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded text-[#9e462e] border-[#dfd4c8] focus:ring-[#9e462e]"
                          />
                          <span className="font-medium text-[#45312d]">Remember login and password</span>
                        </label>
                      </div>

                      {signInError && (
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{signInError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={signingIn}
                        className="w-full py-2.5 bg-gradient-to-r from-[#8f3621] to-[#b34c34] hover:from-[#7c2e1b] hover:to-[#9e3f28] text-white font-bold rounded-xl shadow-lg shadow-[#8f3621]/25 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                      >
                        <span>{signingIn ? 'Authenticating...' : 'Sign In with Credentials'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="text-center pt-2 text-xs text-[#78615c]">
                      <span>Don't have an account yet? </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className="text-[#9e462e] font-bold hover:underline hover:text-[#7c2e1b]"
                      >
                        Sign Up as New Bidder or Staff
                      </button>
                    </div>
                  </div>
                )}

                {/* MODE 2: FIRST-TIME USER SIGN UP */}
                {authMode === 'signup' && (
                  <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs max-h-[58vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Full Name / Entity Name</label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Apex High-Tech Systems Ltd"
                          className="w-full p-2 border border-[#dfd4c8] rounded-lg focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Desired Username</label>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="e.g. apexsystems"
                          className="w-full p-2 border border-[#dfd4c8] rounded-lg focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="bid@apexsystems.in"
                          className="w-full p-2 border border-[#dfd4c8] rounded-lg focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Contact Phone</label>
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98980 12345"
                          className="w-full p-2 border border-[#dfd4c8] rounded-lg focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Password</label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full p-2 border border-[#dfd4c8] rounded-lg focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none font-mono bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#45312d] mb-1">Confirm Password</label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full p-2 border border-[#dfd4c8] rounded-lg focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none font-mono bg-[#fdfbf8] text-[#2c1d1a]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#45312d] mb-1">Account Role</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full p-2 border border-[#dfd4c8] rounded-lg focus:ring-2 focus:ring-[#9e462e] focus:border-[#9e462e] focus:outline-none bg-[#fdfbf8] text-[#2c1d1a]"
                      >
                        <option value="vendor">Registered Bidder / Vendor (Supplies, Services, Works)</option>
                        <option value="department">University Department Requester / Lab In-Charge</option>
                      </select>
                    </div>

                    {/* Vendor Specific KYC Fields */}
                    {regRole === 'vendor' && (
                      <div className="p-3 bg-[#fbf7f2] rounded-xl border border-[#e8ded3] space-y-2.5">
                        <span className="font-bold text-[#45312d] block text-[11px]">Vendor Identification</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#5c4742] mb-0.5">GSTIN (15 Chars)</label>
                            <input
                              type="text"
                              maxLength={15}
                              value={regGstin}
                              onChange={(e) => setRegGstin(e.target.value.toUpperCase())}
                              placeholder="27AABCT9988D1ZM"
                              className="w-full p-1.5 border border-[#dfd4c8] rounded-lg font-mono text-xs bg-white text-[#2c1d1a]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#5c4742] mb-0.5">PAN Card Number</label>
                            <input
                              type="text"
                              maxLength={10}
                              value={regPan}
                              onChange={(e) => setRegPan(e.target.value.toUpperCase())}
                              placeholder="AABCT9988D"
                              className="w-full p-1.5 border border-[#dfd4c8] rounded-lg font-mono text-xs bg-white text-[#2c1d1a]"
                            />
                          </div>
                        </div>

                        <label className="flex items-center space-x-2 font-bold text-[#45312d] cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={regMsme}
                            onChange={(e) => setRegMsme(e.target.checked)}
                            className="rounded text-[#9e462e] border-[#dfd4c8] focus:ring-[#9e462e]"
                          />
                          <span>MSME / Udyam Registered (EMD & Tender Fee Waiver)</span>
                        </label>

                        {regMsme && (
                          <input
                            type="text"
                            value={regUdyam}
                            onChange={(e) => setRegUdyam(e.target.value)}
                            placeholder="UDYAM-MH-01-0012345"
                            className="w-full p-1.5 border border-[#dfd4c8] rounded-lg bg-white font-mono text-xs text-[#2c1d1a]"
                          />
                        )}
                      </div>
                    )}

                    {signUpError && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{signUpError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={signingUp}
                      className="w-full py-2.5 bg-gradient-to-r from-[#8f3621] to-[#b34c34] hover:from-[#7c2e1b] hover:to-[#9e3f28] text-white font-bold rounded-xl shadow-lg shadow-[#8f3621]/25 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{signingUp ? 'Creating Account...' : 'Complete Sign Up & Continue'}</span>
                    </button>

                    <div className="text-center pt-1 text-xs text-[#78615c]">
                      <span>Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="text-[#9e462e] font-bold hover:underline hover:text-[#7c2e1b]"
                      >
                        Sign In with Username & Password
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3b231e] bg-[#120807] py-4 px-6 text-center text-xs text-[#a38a83]">
        <p>© 2026 UniTender • Online Tender Management System</p>
      </footer>

    </div>
  );
}
