import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertOctagon, X, RefreshCw, Hash, Cpu } from 'lucide-react';

export function HashChainModal({ isOpen, onClose }) {
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.success) {
        setTrail(data.auditTrail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/audit/verify');
      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
      }
    } catch (err) {
      alert('Verification request failed');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuditData();
      handleVerify();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                Cryptographic SHA-256 Audit Ledger
                {verification && (
                  <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    verification.valid 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {verification.valid ? 'Chain Integrity: 100% Valid' : 'Corrupted Chain'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Tamper-evident hash chaining ensuring non-repudiation for university vigilance & CAG audits
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-700">
              Blocks in Ledger: <strong className="text-slate-900">{trail.length}</strong> | Algorithm: <strong className="font-mono text-slate-900">SHA-256 (256-bit Digest)</strong>
            </span>
          </div>
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md font-semibold text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Verifying Hashes...' : 'Re-verify Hashes'}</span>
          </button>
        </div>

        {/* Block List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 font-sans">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading cryptographic chain...</div>
          ) : (
            trail.map((block, idx) => (
              <div 
                key={block.hash}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs text-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      #{block.index}
                    </span>
                    <span className="font-bold text-slate-900">{block.action}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {block.entityType}: {block.entityId}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(block.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Actor:</span>{' '}
                    <strong className="text-slate-800">{block.actorName}</strong> ({block.actorRole})
                  </div>
                  <div>
                    <span className="text-slate-500">IP Address:</span>{' '}
                    <code className="font-mono text-slate-700">{block.ipAddress}</code>
                  </div>
                </div>

                <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  {block.details}
                </p>

                <div className="pt-1 space-y-1 font-mono text-[10px] text-slate-500">
                  <div className="truncate">
                    <span className="text-slate-400 font-bold">PREV_HASH:</span> {block.prevHash}
                  </div>
                  <div className="truncate text-emerald-700 font-semibold">
                    <span className="text-emerald-800 font-bold">BLOCK_HASH:</span> {block.hash}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">Compliant with Central Vigilance Commission (CVC) audit guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
