import React, { useState } from 'react';
import { Sparkles, Bot, AlertTriangle, ShieldCheck, FileCheck, ArrowRight, X, Cpu } from 'lucide-react';

export function AiAssistantModal({ isOpen, onClose, onApplySpecs }) {
  const [activeTab, setActiveTab] = useState('drafter'); // 'drafter' | 'radar' | 'summarizer'

  // Spec drafter states
  const [requirementText, setRequirementText] = useState('60 High Performance Core i9 AI GPU Workstations for Deep Learning Lab');
  const [estimatedBudget, setEstimatedBudget] = useState('3600000');
  const [drafting, setDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState(null);

  // Radar states
  const [selectedTenderId, setSelectedTenderId] = useState('TDR-2026-001');
  const [scanning, setScanning] = useState(false);
  const [radarResult, setRadarResult] = useState(null);

  if (!isOpen) return null;

  const handleDraftSpecs = async () => {
    setDrafting(true);
    try {
      const res = await fetch('/api/ai/draft-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: requirementText, estimatedBudget })
      });
      const data = await res.json();
      if (data.success) {
        setDraftResult(data.generated);
      }
    } catch (err) {
      alert('AI Spec generation failed');
    } finally {
      setDrafting(false);
    }
  };

  const handleScanCollusion = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/ai/scan-collusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenderId: selectedTenderId })
      });
      const data = await res.json();
      if (data.success) {
        setRadarResult(data);
      }
    } catch (err) {
      alert('Collusion scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center">
                UniTender AI Procurement Intelligence Suite
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  Gemini Powered
                </span>
              </h2>
              <p className="text-xs text-indigo-200/70">
                Automated Spec Generation • Cartel & Collusion Radar • Bid Proposal Synthesis
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab('drafter')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'drafter'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Smart Spec Drafter (GFR 2017)</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'radar'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Anti-Collusion & Cartel Radar</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Smart Spec Drafter */}
          {activeTab === 'drafter' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900">
                Enter your department's purchase requirement in plain language. The AI assistant will draft standard technical parameters, suggest eligibility criteria, calculate EMD, and verify GFR 2017 compliance clauses.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Procurement Requirement</label>
                  <input
                    type="text"
                    value={requirementText}
                    onChange={(e) => setRequirementText(e.target.value)}
                    placeholder="e.g. 50 High-End Workstations for AI Lab or Campus Wi-Fi 6 Access Points"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleDraftSpecs}
                  disabled={drafting}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{drafting ? 'Synthesizing Specifications...' : 'Generate Tender Specifications'}</span>
                </button>
              </div>

              {/* Result Preview */}
              {draftResult && (
                <div className="mt-4 border border-indigo-200 rounded-xl p-5 bg-gradient-to-b from-white to-slate-50 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">AI Generated Draft</span>
                      <h4 className="text-sm font-bold text-slate-900">{draftResult.title}</h4>
                      <p className="text-xs text-slate-500">Suggested Category: <span className="font-semibold text-slate-700">{draftResult.suggestedCategory}</span> | Suggested EMD (2%): <span className="font-semibold text-emerald-600">₹{draftResult.suggestedEmd.toLocaleString('en-IN')}</span></p>
                    </div>
                    {onApplySpecs && (
                      <button
                        onClick={() => {
                          onApplySpecs(draftResult);
                          onClose();
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Apply to Tender Form</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-2">Technical Specifications Matrix</h5>
                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 w-1/3">Parameter</th>
                            <th className="py-2 px-3">Mandatory Specification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {draftResult.specifications.map((spec, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-semibold text-slate-800">{spec.item}</td>
                              <td className="py-2 px-3 text-slate-600">{spec.requirement}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 mb-1.5">Standard Eligibility Clauses</h5>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                        {draftResult.eligibilityCriteria.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                      <h5 className="text-xs font-bold text-blue-900 mb-1.5">GFR 2017 Compliance Checklist</h5>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800">
                        {draftResult.gfrChecklist.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Anti-Collusion Radar */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                The Anti-Collusion Radar scans bids for suspicious cartel indicators, matching submission IP addresses, duplicate cryptographic document hashes, and predatory/cover-bidding quote anomalies.
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Active Tender to Analyze</label>
                  <select
                    value={selectedTenderId}
                    onChange={(e) => setSelectedTenderId(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="TDR-2026-001">TDR-2026-001: 60 High-Performance GPU Workstations</option>
                    <option value="TDR-2026-002">TDR-2026-002: HPLC & UV-Vis Spectrophotometer</option>
                    <option value="TDR-2026-003">TDR-2026-003: Comprehensive AMC for Campus Elevators</option>
                  </select>
                </div>
                <div className="pt-5">
                  <button
                    onClick={handleScanCollusion}
                    disabled={scanning}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{scanning ? 'Running Algorithmic Radar...' : 'Scan Submitted Bids'}</span>
                  </button>
                </div>
              </div>

              {radarResult && (
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{radarResult.tenderTitle}</h4>
                      <p className="text-xs text-slate-500">Total Bids Evaluated: <span className="font-semibold text-slate-800">{radarResult.bidsCount}</span></p>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        radarResult.riskScore === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                        radarResult.riskScore === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        Risk Level: {radarResult.riskScore}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900 mb-1">AI Executive Narrative Analysis:</p>
                    <p>{radarResult.aiNarrative}</p>
                  </div>

                  {radarResult.flags.length > 0 ? (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-800">Detected Collusion Markers:</h5>
                      {radarResult.flags.map((flag, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-red-200 bg-red-50/50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-red-900 flex items-center">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 mr-1.5" />
                              {flag.title}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-red-600 px-1.5 py-0.5 rounded bg-red-100">
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-slate-600">{flag.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Zero collusion markers detected. All submissions have distinct IPs and independent hash digests.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
