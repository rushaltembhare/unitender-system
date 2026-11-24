import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users2, 
  ShieldCheck, 
  Star, 
  AlertOctagon, 
  PlusCircle, 
  FileCheck, 
  CheckCircle2, 
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react';

export function VendorPortal() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form fields
  const [vendorName, setVendorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('IT & Hardware Equipment');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [msmeRegistered, setMsmeRegistered] = useState(true);
  const [msmeUdyam, setMsmeUdyam] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleRegisterVendor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vendorName,
          contactPerson,
          email,
          phone,
          category,
          gstin,
          pan,
          msmeRegistered,
          msmeUdyam
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Vendor registered and KYC verified successfully!');
        setShowRegisterModal(false);
        fetchVendors();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Error during registration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateVendor = async (vendorId) => {
    const rating = prompt('Enter performance score (1 to 5 stars):', '5');
    if (!rating) return;
    const feedback = prompt('Enter delivery & SLA feedback:');

    try {
      const res = await fetch(`/api/vendors/${vendorId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin-1'
        },
        body: JSON.stringify({ rating, feedback })
      });
      const data = await res.json();
      if (data.success) fetchVendors();
    } catch (err) {
      alert('Rating failed');
    }
  };

  const handleBlacklistVendor = async (vendorId) => {
    const reason = prompt('Enter official debarment reason under GFR Rule 151:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/vendors/${vendorId}/blacklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin-1'
        },
        body: JSON.stringify({ reason, periodMonths: 24 })
      });
      const data = await res.json();
      if (data.success) fetchVendors();
    } catch (err) {
      alert('Blacklisting failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Vendor Management & KYC Repository</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified vendor profiles, MSME Udyam status, performance scorecards, and institutional debarment registry
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Vendor Self-Registration (KYC)</span>
        </button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map((v) => (
          <div 
            key={v.id}
            className={`p-6 rounded-2xl border transition shadow-xs space-y-4 ${
              v.isBlacklisted ? 'bg-red-50/40 border-red-200' : 'bg-white border-slate-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">{v.name}</h3>
                  {v.isBlacklisted ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                      DEBARRED / BLACKLISTED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      KYC Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Category: <strong className="text-slate-700">{v.category}</strong>
                </p>
              </div>

              {/* Performance Scorecard */}
              <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                <span className="font-extrabold text-xs">{v.rating || 4.5}</span>
                <span className="text-[10px] text-amber-600 ml-0.5">/5</span>
              </div>
            </div>

            {/* KYC Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">GSTIN</span>
                <code className="font-mono text-slate-800 text-[11px]">{v.gstin}</code>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Permanent Account (PAN)</span>
                <code className="font-mono text-slate-800 text-[11px]">{v.pan}</code>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">MSME Udyam Registration</span>
                {v.msmeRegistered ? (
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    {v.msmeUdyam || 'Udyam Verified (EMD Exempt)'}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">Standard Commercial Enterprise</span>
                )}
              </div>
            </div>

            {v.isBlacklisted && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="font-bold flex items-center">
                  <AlertOctagon className="w-4 h-4 mr-1 text-red-700" />
                  <span>Debarment Notice under GFR Rule 151:</span>
                </div>
                <p className="text-[11px]">{v.blacklistReason}</p>
              </div>
            )}

            {/* Actions for Admin */}
            {(user?.role === 'admin' || user?.role === 'approver') && (
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleRateVendor(v.id)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                >
                  Rate Performance
                </button>
                {!v.isBlacklisted && (
                  <button
                    onClick={() => handleBlacklistVendor(v.id)}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg transition border border-rose-200"
                  >
                    Debar / Blacklist
                  </button>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Self-Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Vendor Self-Registration & KYC</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter government compliance numbers to activate bidding eligibility
            </p>

            <form onSubmit={handleRegisterVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Firm Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Apex High-Tech Solutions Ltd"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27AABCT1234K1ZM"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="AABCT1234K"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Procurement Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="IT & Hardware Equipment">IT & Hardware Equipment</option>
                  <option value="Scientific & Laboratory Equipment">Scientific & Laboratory Equipment</option>
                  <option value="Furniture & Classroom Desks">Furniture & Classroom Desks</option>
                  <option value="AMC & Campus Facilities">AMC & Campus Facilities</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={msmeRegistered}
                    onChange={(e) => setMsmeRegistered(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>MSME / Udyam Registered (GFR EMD Exemption Eligible)</span>
                </label>

                {msmeRegistered && (
                  <input
                    type="text"
                    value={msmeUdyam}
                    onChange={(e) => setMsmeUdyam(e.target.value)}
                    placeholder="UDYAM-MH-01-XXXXXXX"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  {submitting ? 'Registering...' : 'Complete KYC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
