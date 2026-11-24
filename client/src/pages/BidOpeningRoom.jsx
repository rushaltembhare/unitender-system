import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  DoorOpen, 
  Key, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Users2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ArrowRight,
  Sparkles,
  FileCheck
} from 'lucide-react';

export function BidOpeningRoom({ onNavigateToEvaluation }) {
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState('TDR-2026-001');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dual-Key authorization states
  const [key1Entered, setKey1Entered] = useState(true); // Comm Chair key
  const [key2Entered, setKey2Entered] = useState(false); // Finance Officer key
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedMessage, setUnlockedMessage] = useState(null);

  const fetchTenderData = async () => {
    setLoading(true);
    try {
      const [tRes, bRes] = await Promise.all([
        fetch('/api/tenders'),
        fetch(`/api/bids?tenderId=${selectedTenderId}`)
      ]);
      const tData = await tRes.json();
      const bData = await bRes.json();

      if (tData.success) setTenders(tData.tenders);
      if (bData.success) setBids(bData.bids);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenderData();
  }, [selectedTenderId]);

  const activeTender = tenders.find(t => t.id === selectedTenderId);

  const handleDualKeyUnlock = async () => {
    setUnlocking(true);
    try {
      const res = await fetch(`/api/bids/unlock-financial/${selectedTenderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'comm-1'
        }
      });
      const data = await res.json();
      if (data.success) {
        setUnlockedMessage('Dual-Key Quorum Verified! Financial envelopes decrypted for technically qualified bidders.');
        fetchTenderData();
      } else {
        alert(data.message || 'Unlock failed');
      }
    } catch (err) {
      alert('Error unlocking envelopes');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Transparent Live Session
              </span>
              <span className="text-xs text-slate-400">
                Audited Under CVC Public Procurement Guidelines
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold mt-1 text-white">
              Live Bid Opening & Decryption Room
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Electronic dual-key quorum system requiring joint authorization from Evaluation Committee Chair and Finance Officer before opening sealed tender envelopes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl text-xs py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {tenders.map(t => (
                <option key={t.id} value={t.id}>{t.id} - {t.title.slice(0, 35)}...</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {unlockedMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{unlockedMessage}</span>
          </div>
          <button
            onClick={() => onNavigateToEvaluation(selectedTenderId)}
            className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg text-xs hover:bg-emerald-800 transition"
          >
            Go to Comparative Statement (CSQ) →
          </button>
        </div>
      )}

      {/* Dual-Key Ceremony Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dual-Key Quorum Authorization Gate</h3>
            <p className="text-xs text-slate-500">Two independent administrative cryptographic keys required</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              activeTender?.isFinancialLocked
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {activeTender?.isFinancialLocked ? 'Envelope B: Locked' : 'Envelope B: Decrypted & Open'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Key 1: Committee Chair */}
          <div className={`p-4 rounded-xl border transition ${
            key1Entered ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center">
                <Key className="w-4 h-4 mr-1.5 text-blue-600" />
                Key 1: Evaluation Committee Chair
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Authorized (Dr. Vikram Rao)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Electronic token signed. Affirmation that committee members have submitted non-disclosure and conflict of interest declarations.
            </p>
          </div>

          {/* Key 2: Finance Officer */}
          <div className={`p-4 rounded-xl border transition ${
            key2Entered ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center">
                <Key className="w-4 h-4 mr-1.5 text-purple-600" />
                Key 2: Finance Officer / CAO
              </span>
              <button
                type="button"
                onClick={() => setKey2Entered(!key2Entered)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                  key2Entered 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {key2Entered ? 'Authorized (CA Ramesh Nair)' : 'Click to Authorize Key'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              Finance division authorization verifying EMD records and budget encumbrance readiness before opening commercial quotes.
            </p>
          </div>

        </div>

        {/* Quorum Unlock Action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDualKeyUnlock}
            disabled={!key1Entered || !key2Entered || unlocking || !activeTender?.isFinancialLocked}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            <Unlock className="w-4 h-4" />
            <span>{unlocking ? 'Decrypting Financial Envelopes...' : 'Execute Dual-Key Decryption'}</span>
          </button>
        </div>
      </div>

      {/* Submitted Envelopes Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Submitted Tender Envelopes ({bids.length})</h3>
            <p className="text-xs text-slate-500">Live inspection of sealed cryptographic tokens</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{activeTender?.referenceNumber}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {bids.map((b) => (
            <div key={b.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{b.vendorName}</span>
                    <span className="font-mono text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">{b.id}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Submitted: {new Date(b.submittedAt).toLocaleString('en-IN')} | Signature: <strong className="text-slate-700">{b.digitalSignatureStatus}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {b.emdStatus}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    b.technicalEnvelope?.status === 'QUALIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    b.technicalEnvelope?.status === 'DISQUALIFIED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    Tech: {b.technicalEnvelope?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Two Envelopes Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* Envelope A Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600 mr-1" />
                      Envelope A: Technical Credentials
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Checksum OK</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {(b.technicalEnvelope?.submittedDocs || []).join(', ')}
                  </p>
                  <div className="text-[10px] text-slate-500">
                    Evaluations Logged: <strong>{b.technicalEnvelope?.evaluations?.length || 0} Member(s)</strong>
                  </div>
                </div>

                {/* Envelope B Card */}
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  b.financialEnvelope?.isUnlocked 
                    ? 'bg-emerald-50/50 border-emerald-200' 
                    : 'bg-purple-50/40 border-purple-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center">
                      {b.financialEnvelope?.isUnlocked ? (
                        <Unlock className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-purple-600 mr-1" />
                      )}
                      Envelope B: Financial BOQ
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-32">
                      {b.financialEnvelope?.encryptedDigest?.slice(0, 16)}...
                    </span>
                  </div>

                  <div>
                    {b.financialEnvelope?.isUnlocked ? (
                      <div className="flex items-baseline space-x-2">
                        <span className="text-[11px] text-slate-500">Decrypted Commercial Quote:</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{b.financialEnvelope.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-purple-800 italic">
                        [ENCRYPTED]: Financial contents locked until technical qualification and dual-key quorum.
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
