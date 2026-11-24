import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  FileText, 
  Calendar, 
  Download, 
  Send, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Building2,
  Users2,
  CheckCircle2
} from 'lucide-react';

export function TenderDetails({ tender, onClose, onOpenBidModal }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'queries' | 'corrigenda' | 'downloads'
  
  // Q&A states
  const [queryText, setQueryText] = useState('');
  const [askingQuery, setAskingQuery] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeReplyQueryId, setActiveReplyQueryId] = useState(null);

  // Corrigendum states
  const [corrTitle, setCorrTitle] = useState('');
  const [corrDesc, setCorrDesc] = useState('');
  const [corrDeadline, setCorrDeadline] = useState('');
  const [showAddCorr, setShowAddCorr] = useState(false);

  if (!tender) return null;

  const handleAskQuery = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setAskingQuery(true);
    try {
      const res = await fetch(`/api/tenders/${tender.id}/queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'vendor-1'
        },
        body: JSON.stringify({ query: queryText })
      });
      const data = await res.json();
      if (data.success) {
        if (!tender.preBidQueries) tender.preBidQueries = [];
        tender.preBidQueries.push(data.query);
        setQueryText('');
      }
    } catch (err) {
      alert('Failed to submit query');
    } finally {
      setAskingQuery(false);
    }
  };

  const handleAnswerQuery = async (queryId) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/tenders/${tender.id}/queries/${queryId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin-1'
        },
        body: JSON.stringify({ response: replyText })
      });
      const data = await res.json();
      if (data.success) {
        const q = tender.preBidQueries.find(x => x.id === queryId);
        if (q) {
          q.status = 'ANSWERED';
          q.response = replyText;
        }
        setReplyText('');
        setActiveReplyQueryId(null);
      }
    } catch (err) {
      alert('Failed to publish clarification');
    }
  };

  const handleAddCorrigendum = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tenders/${tender.id}/corrigenda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin-1'
        },
        body: JSON.stringify({
          title: corrTitle,
          description: corrDesc,
          newDeadline: corrDeadline || null
        })
      });
      const data = await res.json();
      if (data.success) {
        if (!tender.corrigenda) tender.corrigenda = [];
        tender.corrigenda.push(data.corrigendum);
        setShowAddCorr(false);
        setCorrTitle('');
        setCorrDesc('');
      }
    } catch (err) {
      alert('Failed to issue corrigendum');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded border border-blue-700">
                {tender.referenceNumber}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {tender.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-base font-bold text-white max-w-2xl">{tender.title}</h2>
            <p className="text-xs text-slate-400">
              {tender.departmentName} • Estimated Budget: <strong className="text-slate-200">₹{tender.estimatedCost.toLocaleString('en-IN')}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          {[
            { id: 'specs', label: 'Specifications & Eligibility', icon: FileText },
            { id: 'queries', label: `Pre-Bid Q&A (${tender.preBidQueries?.length || 0})`, icon: MessageSquare },
            { id: 'corrigenda', label: `Corrigenda & Amendments (${tender.corrigenda?.length || 0})`, icon: AlertTriangle },
            { id: 'downloads', label: `Download Audit Ledger (${tender.downloadsCount || 0})`, icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Specifications & Eligibility */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">EMD Deposit</span>
                  <span className="font-bold text-slate-900">₹{tender.emdAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-700 block">MSME/Startup Exempted</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Submission Deadline</span>
                  <span className="font-bold text-slate-900">{new Date(tender.submissionDeadline).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Evaluation Method</span>
                  <span className="font-bold text-slate-900">{tender.evaluationMethod} ({tender.biddingType})</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Technical Specifications</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-1/3">Parameter</th>
                        <th className="py-2.5 px-3">Institutional Specification Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {(tender.specifications || []).map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{s.item}</td>
                          <td className="py-2 px-3 text-slate-600">{s.requirement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Eligibility Criteria</h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {(tender.eligibilityCriteria || []).map((crit, idx) => (
                    <li key={idx}>{crit}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Pre-Bid Queries & Clarifications */}
          {activeTab === 'queries' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-center justify-between">
                <span>All vendor questions and administrative clarifications are publicly visible to ensure equal access and transparency under CVC guidelines.</span>
              </div>

              {/* Ask Question Form for Vendors */}
              {user?.role === 'vendor' && (
                <form onSubmit={handleAskQuery} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Ask a Pre-Bid Clarification</label>
                  <textarea
                    rows={2}
                    required
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Enter technical query or clarification on specifications..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={askingQuery}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{askingQuery ? 'Posting...' : 'Submit Query'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Questions List */}
              <div className="space-y-3">
                {(!tender.preBidQueries || tender.preBidQueries.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No pre-bid questions asked yet.</p>
                ) : (
                  tender.preBidQueries.map((q) => (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center">
                          <HelpCircle className="w-4 h-4 text-blue-600 mr-1.5" />
                          Query by {q.vendorName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.status === 'ANSWERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                        "{q.query}"
                      </p>

                      {q.response ? (
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-0.5">
                          <span className="font-bold text-[11px] text-emerald-900 block">Official University Clarification:</span>
                          <p className="text-xs text-emerald-800">{q.response}</p>
                        </div>
                      ) : user?.role === 'admin' ? (
                        <div className="pt-2">
                          {activeReplyQueryId === q.id ? (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Enter official clarification response..."
                                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAnswerQuery(q.id)}
                                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                                >
                                  Publish Clarification
                                </button>
                                <button
                                  onClick={() => setActiveReplyQueryId(null)}
                                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveReplyQueryId(q.id)}
                              className="text-xs text-blue-600 font-bold hover:underline"
                            >
                              + Post Official Response
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Corrigenda & Amendments */}
          {activeTab === 'corrigenda' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Official Tender Corrigenda</span>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setShowAddCorr(true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    + Issue New Corrigendum
                  </button>
                )}
              </div>

              {showAddCorr && (
                <form onSubmit={handleAddCorrigendum} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3 text-xs">
                  <h5 className="font-bold text-rose-900">Publish Official Tender Amendment</h5>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Corrigendum Title</label>
                    <input
                      type="text"
                      required
                      value={corrTitle}
                      onChange={(e) => setCorrTitle(e.target.value)}
                      placeholder="e.g. Extension of Bid Submission Deadline & GPU Spec Amendment"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Details & Amendments</label>
                    <textarea
                      rows={2}
                      required
                      value={corrDesc}
                      onChange={(e) => setCorrDesc(e.target.value)}
                      placeholder="Specify altered clauses, relaxed conditions, or extended dates..."
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Extended Submission Deadline (Optional)</label>
                    <input
                      type="datetime-local"
                      value={corrDeadline}
                      onChange={(e) => setCorrDeadline(e.target.value)}
                      className="text-xs p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button type="submit" className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded">
                      Publish & Broadcast Corrigendum
                    </button>
                    <button type="button" onClick={() => setShowAddCorr(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {(!tender.corrigenda || tender.corrigenda.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No amendments or corrigenda published for this tender.</p>
                ) : (
                  tender.corrigenda.map((c, i) => (
                    <div key={i} className="p-4 rounded-xl border border-rose-200 bg-white space-y-1.5 text-xs shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 font-mono">{c.number}: {c.title}</span>
                        <span className="text-[10px] text-slate-400">{new Date(c.publishedAt).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-slate-600">{c.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Download Audit Ledger */}
          {activeTab === 'downloads' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
                Tracking every entity that downloaded the tender documents with IP address and timestamp to safeguard against collusive bidder information asymmetry.
              </div>

              <div className="space-y-2">
                {(!tender.downloadLogs || tender.downloadLogs.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No external downloads logged yet.</p>
                ) : (
                  tender.downloadLogs.map((log, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{log.vendorName}</span>
                        <span className="text-[10px] text-slate-400 block">IP: <code className="font-mono text-slate-600">{log.ip}</code></span>
                      </div>
                      <span className="text-[11px] text-slate-500">{new Date(log.downloadedAt).toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition">
            Close
          </button>

          {tender.status === 'PUBLISHED' && (
            <button
              onClick={() => {
                onClose();
                onOpenBidModal(tender);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit 2-Envelope Bid</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
