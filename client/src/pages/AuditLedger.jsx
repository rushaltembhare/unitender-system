import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertOctagon, 
  Search,
  Filter,
  Cpu,
  Layers
} from 'lucide-react';

export function AuditLedger() {
  const { user } = useAuth();
  const [trail, setTrail] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [aRes, vRes] = await Promise.all([
        fetch('/api/audit'),
        fetch('/api/audit/verify')
      ]);
      const aData = await aRes.json();
      const vData = await vRes.json();

      if (aData.success) setTrail(aData.auditTrail);
      if (vData.success) setVerification(vData.verification);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/audit/verify');
      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
      }
    } catch (err) {
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const filtered = trail.filter(b => 
    b.action.toLowerCase().includes(search.toLowerCase()) ||
    b.actorName.toLowerCase().includes(search.toLowerCase()) ||
    b.details.toLowerCase().includes(search.toLowerCase()) ||
    b.entityId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Cryptographic Audit Protocol
              </span>
              <span className="text-xs text-slate-400">
                Non-Repudiation for CAG & Vigilance Inquiries
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold mt-1 text-white">
              Tamper-Evident SHA-256 Audit Ledger
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Every requisition, tender publication, document download, 2-envelope submission, committee evaluation score, and payment is permanently hashed and chained to prior records.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Validating Hashes...' : 'Re-verify Mathematical Integrity'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      {verification && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs ${
          verification.valid 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : 'bg-red-50 text-red-900 border-red-300'
        }`}>
          <div className="flex items-center space-x-3">
            {verification.valid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {verification.valid ? 'Cryptographic Hash Chain: 100% Intact & Untampered' : 'Chain Corruption Detected!'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Verified {verification.count} chained blocks sequentially from Genesis Block #0. All cryptographic mathematical hashes match recorded payloads.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white/70 px-2 py-1 rounded border border-current">
            SHA-256 / UTF-8
          </span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Action, Actor Name, Entity Code or IP Address..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Block Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading cryptographic blocks...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No matching blocks found.
          </div>
        ) : (
          filtered.map((block) => (
            <div 
              key={block.hash}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                    #{block.index}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{block.action}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {block.entityType}: {block.entityId}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(block.timestamp).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Executing Actor</span>
                  <strong className="text-slate-800">{block.actorName}</strong>
                  <span className="text-[10px] text-slate-500 block">({block.actorRole})</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Network Route / IP</span>
                  <code className="font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                    {block.ipAddress}
                  </code>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Action Details</span>
                  <p className="text-slate-700 line-clamp-2">{block.details}</p>
                </div>
              </div>

              {/* Cryptographic Link Hashes */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-[10px] space-y-1">
                <div className="truncate">
                  <span className="text-slate-400 font-bold">PREVIOUS_BLOCK_HASH:</span>{' '}
                  <span className="text-slate-600">{block.prevHash}</span>
                </div>
                <div className="truncate text-emerald-800">
                  <span className="font-bold">CURRENT_BLOCK_HASH:</span>{' '}
                  <span className="font-semibold">{block.hash}</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
