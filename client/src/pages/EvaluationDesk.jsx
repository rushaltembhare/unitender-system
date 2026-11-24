import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Lock, 
  ShieldCheck, 
  TrendingDown, 
  FileCheck, 
  FileText,
  UserCheck,
  Send
} from 'lucide-react';

export function EvaluationDesk({ initialTenderId, onAwardComplete }) {
  const { user } = useAuth();
  const [selectedTenderId, setSelectedTenderId] = useState(initialTenderId || 'TDR-2026-001');
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [csq, setCsq] = useState(null);
  const [loading, setLoading] = useState(true);

  // Conflict of Interest
  const [coiStatus, setCoiStatus] = useState(null);
  const [affirmingCoi, setAffirmingCoi] = useState(false);

  // Scoring Form
  const [scoringBidId, setScoringBidId] = useState(null);
  const [scoreVal, setScoreVal] = useState(85);
  const [remarksVal, setRemarksVal] = useState('Complies with all technical benchmarks.');
  const [submittingScore, setSubmittingScore] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, bRes, csqRes, coiRes] = await Promise.all([
        fetch('/api/tenders'),
        fetch(`/api/bids?tenderId=${selectedTenderId}`, {
          headers: { 'x-user-id': user?.id || 'comm-1' }
        }),
        fetch(`/api/evaluation/comparative-statement/${selectedTenderId}`),
        fetch(`/api/auth/coi/${selectedTenderId}`, {
          headers: { 'x-user-id': user?.id || 'comm-1' }
        })
      ]);

      const tData = await tRes.json();
      const bData = await bRes.json();
      const csqData = await csqRes.json();
      const coiData = await coiRes.json();

      if (tData.success) setTenders(tData.tenders);
      if (bData.success) setBids(bData.bids);
      if (csqData.success) setCsq(csqData.comparativeStatement);
      if (coiData.success) setCoiStatus(coiData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTenderId]);

  const activeTender = tenders.find(t => t.id === selectedTenderId);

  const handleAffirmCoi = async () => {
    setAffirmingCoi(true);
    try {
      const res = await fetch(`/api/auth/coi/${selectedTenderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'comm-1'
        }
      });
      const data = await res.json();
      if (data.success) {
        setCoiStatus({ hasDeclared: true, declaration: data.declaration });
      }
    } catch (err) {
      alert('Failed to sign declaration');
    } finally {
      setAffirmingCoi(false);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    setSubmittingScore(true);
    try {
      const res = await fetch(`/api/bids/${scoringBidId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'comm-1'
        },
        body: JSON.stringify({ score: Number(scoreVal), remarks: remarksVal })
      });
      const data = await res.json();
      if (data.success) {
        setScoringBidId(null);
        loadData();
      } else {
        alert(data.message || 'Scoring failed');
      }
    } catch (err) {
      alert('Scoring request failed');
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleAwardTender = async (winningBidId) => {
    if (!window.confirm('Confirm award of contract and generate official University Work Order (PO)?')) return;

    try {
      const res = await fetch(`/api/evaluation/award/${selectedTenderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin-1'
        },
        body: JSON.stringify({ winningBidId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadData();
        if (onAwardComplete) onAwardComplete(data.tender);
      }
    } catch (err) {
      alert('Failed to award contract');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Evaluation Desk & Comparative Statement (CSQ)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Blind Scoring Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Committee members evaluate bids independently. Scores remain confidential until compilation.
          </p>
        </div>

        <div>
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {tenders.map(t => (
              <option key={t.id} value={t.id}>{t.id} - {t.title.slice(0, 35)}...</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandatory Conflict of Interest Banner */}
      {!coiStatus?.hasDeclared && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-950 space-y-3">
          <div className="flex items-center space-x-2 font-bold text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Mandatory GFR 2017 Conflict of Interest Declaration Required</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            As an evaluation committee member, you must formally affirm that you have no commercial, advisory, or familial interest in any bidder participating in tender <strong className="font-mono">{selectedTenderId}</strong> before scoring can proceed.
          </p>
          <button
            onClick={handleAffirmCoi}
            disabled={affirmingCoi}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            {affirmingCoi ? 'Signing Affirmation...' : 'Sign Electronic No-Conflict Affirmation'}
          </button>
        </div>
      )}

      {/* Technical Bids Scoring Desk */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Technical Proposals & Blind Scoring Matrix</h3>
            <p className="text-xs text-slate-500">Evaluation against criteria (Min Qualifying Score: {activeTender?.minTechnicalScore || 70}/100)</p>
          </div>
          <span className="text-xs text-slate-500">Method: <strong className="text-slate-800">{activeTender?.evaluationMethod}</strong></span>
        </div>

        <div className="divide-y divide-slate-100">
          {bids.map(b => (
            <div key={b.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{b.vendorName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{b.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Credentials: {(b.technicalEnvelope?.submittedDocs || []).join(' • ')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {b.technicalEnvelope?.averageScore && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                      Avg Score: {b.technicalEnvelope.averageScore}/100
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    b.technicalEnvelope?.status === 'QUALIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    b.technicalEnvelope?.status === 'DISQUALIFIED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {b.technicalEnvelope?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Committee Evaluations list */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">Logged Committee Evaluations:</span>
                {(b.technicalEnvelope?.evaluations || []).map((ev, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-600 bg-white p-2 rounded-lg border border-slate-200/70">
                    <div>
                      <strong className="text-slate-800">{ev.committeeName}</strong>: {ev.remarks}
                    </div>
                    <span className="font-bold font-mono text-blue-700">{ev.score}/100</span>
                  </div>
                ))}

                {b.technicalEnvelope?.isPeerScoresHidden && (
                  <p className="text-[10px] text-slate-400 italic">
                    🔒 Peer committee scores hidden per Blind Evaluation Rules until compilation.
                  </p>
                )}
              </div>

              {/* Action */}
              {(user?.role === 'committee' || user?.role === 'admin') && coiStatus?.hasDeclared && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setScoringBidId(b.id);
                      setScoreVal(85);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Enter / Edit Technical Score
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Modal Dialog */}
      {scoringBidId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Enter Technical Score</h3>
            <p className="text-xs text-slate-500 mb-4">
              Scoring as <strong className="text-slate-800">{user?.name}</strong>. Evaluated against technical specs.
            </p>

            <form onSubmit={handleScoreSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Score (0 to 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scoreVal}
                  onChange={(e) => setScoreVal(e.target.value)}
                  className="w-full text-sm font-bold p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evaluation Committee Remarks & Justification</label>
                <textarea
                  rows={3}
                  required
                  value={remarksVal}
                  onChange={(e) => setRemarksVal(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScoringBidId(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingScore}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  {submittingScore ? 'Saving...' : 'Submit Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automated Comparative Statement (CSQ) Table */}
      {csq && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">Comparative Statement (CSQ)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Ranking Mode: {csq.evaluationMethod}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically calculated ranking of qualified bidders
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Bidder Name</th>
                  <th className="py-3 px-4">Technical Score</th>
                  <th className="py-3 px-4">Commercial Quote (INR)</th>
                  {csq.evaluationMethod === 'QCBS' && (
                    <th className="py-3 px-4">Composite Score (70:30)</th>
                  )}
                  <th className="py-3 px-4 text-right">Award Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {csq.ranked?.map((item) => (
                  <tr key={item.bidId} className={`hover:bg-slate-50/80 transition ${item.rank === 1 ? 'bg-emerald-50/30' : ''}`}>
                    <td className="py-3.5 px-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        item.rank === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{item.vendorName}</span>
                      {item.rank === 1 && (
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {csq.evaluationMethod === 'QCBS' ? 'H1 (Winning)' : 'L1 (Lowest Price)'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {item.technicalScore}/100
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{item.financialQuote?.toLocaleString('en-IN')}
                    </td>
                    {csq.evaluationMethod === 'QCBS' && (
                      <td className="py-3.5 px-4 font-bold text-indigo-700 font-mono">
                        {item.compositeScore}
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-right">
                      {activeTender?.status !== 'AWARDED' && item.rank === 1 && (user?.role === 'admin' || user?.role === 'approver') && (
                        <button
                          onClick={() => handleAwardTender(item.bidId)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Award & Issue Work Order
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
