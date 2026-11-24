import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, 
  TrendingUp, 
  Wallet, 
  Clock, 
  Sparkles, 
  Lock, 
  Building2, 
  ArrowUpRight, 
  CheckCircle, 
  AlertCircle,
  FilePlus,
  Users
} from 'lucide-react';

export function Dashboard({ onNavigate, onOpenAiModal, onOpenLedgerModal }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, tdrRes] = await Promise.all([
          fetch('/api/reports/analytics'),
          fetch('/api/tenders')
        ]);
        const repData = await repRes.json();
        const tdrData = await tdrRes.json();

        if (repData.success) setAnalytics(repData);
        if (tdrData.success) setTenders(tdrData.tenders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = analytics?.kpis || {
    activeTenders: 4,
    totalBudget: 12000000,
    totalSavingsAchieved: 180000,
    averageCycleDays: 24
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Persona Context */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                {user?.roleTitle || user?.role}
              </span>
              <span className="text-xs text-slate-400">
                {user?.department || 'Institution'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold mt-1 tracking-tight text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Central University Procurement Management System running under General Financial Rules (GFR 2017) and Central Vigilance Commission (CVC) transparency guidelines.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAiModal}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Procurement Assistant</span>
            </button>
            <button
              onClick={onOpenLedgerModal}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Audit Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.activeTenders')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{kpis.activeTenders}</div>
          <p className="text-[11px] text-slate-500 mt-1">Under evaluation or open for bidding</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.totalBudget')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">₹{(kpis.totalBudget / 100000).toFixed(1)} Lakhs</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Sanctioned UGC & DST grants</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.savingsAchieved')}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">₹{(kpis.totalSavingsAchieved).toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-500 mt-1">Saved below estimated costs via L1/QCBS</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.avgCycleTime')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{kpis.averageCycleDays} Days</div>
          <p className="text-[11px] text-slate-500 mt-1">From requisition to Work Order issue</p>
        </div>

      </div>

      {/* Main Grid: Department Budgets + Quick Workflow Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Department-wise Spend & Budget Utilization */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('dashboard.budgetUtilization')}</h3>
              <p className="text-xs text-slate-500">Live grant encumbrance and utilization tracking</p>
            </div>
            <button 
              onClick={() => onNavigate('requisitions')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center"
            >
              <span>Manage Requisitions</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {(analytics?.departmentSpend || []).map((dept, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{dept.department}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white border border-slate-200">{dept.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">₹{(dept.spent / 100000).toFixed(2)}L</span>
                    <span className="text-slate-400"> / ₹{(dept.allocated / 100000).toFixed(2)}L</span>
                    <span className="ml-2 font-bold text-blue-600">({dept.utilizationPercentage}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, dept.utilizationPercentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): Role-Specific Quick Action Hub */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Procurement Action Center</h3>
            <p className="text-xs text-slate-500">Shortcuts for your active persona</p>
          </div>

          <div className="space-y-2.5">
            {user?.role === 'department' && (
              <button
                onClick={() => onNavigate('requisitions')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100/80 transition text-xs font-bold border border-blue-200/80"
              >
                <div className="flex items-center space-x-2">
                  <FilePlus className="w-4 h-4 text-blue-600" />
                  <span>Raise Purchase Requisition</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}

            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => onNavigate('create-tender')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-xs font-bold shadow-xs"
                >
                  <div className="flex items-center space-x-2">
                    <FilePlus className="w-4 h-4" />
                    <span>Create Tender from Template</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('bid-opening')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold border border-slate-200"
                >
                  <span>Open Live Bid Room (Dual-Key)</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </>
            )}

            {user?.role === 'committee' && (
              <button
                onClick={() => onNavigate('evaluation')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition text-xs font-bold border border-emerald-200"
              >
                <span>Score Technical Bids (Blind)</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </button>
            )}

            {user?.role === 'vendor' && (
              <>
                <button
                  onClick={() => onNavigate('notice-board')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-xs font-bold shadow-xs"
                >
                  <span>Browse Open Tenders & Bid</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('guide')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold border border-slate-200"
                >
                  <span>First-Time Vendor Step Guide</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </>
            )}

            <button
              onClick={() => onNavigate('notice-board')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold border border-slate-200"
            >
              <span>View Public Tender Notice Board</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('rti')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold border border-slate-200"
            >
              <span>RTI Public Award Disclosures</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Compliance Status box */}
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center font-bold text-emerald-800">
              <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>NAAC & GFR Compliance Verified</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Two-envelope encryption active. 100% of audit logs cryptographically chained with SHA-256.
            </p>
          </div>
        </div>

      </div>

      {/* Recent Active Tenders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Procurement Pipeline</h3>
            <p className="text-xs text-slate-500">Live stages across university departments</p>
          </div>
          <button 
            onClick={() => onNavigate('notice-board')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All ({tenders.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tender Ref & Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Estimated Value</th>
                <th className="py-3 px-4">Stage / Status</th>
                <th className="py-3 px-4">Evaluation Mode</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tenders.slice(0, 4).map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 line-clamp-1">{t.title}</p>
                    <span className="font-mono text-[10px] text-slate-500">{t.referenceNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{t.departmentName}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">₹{t.estimatedCost.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      t.status === 'TECHNICAL_EVALUATION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      t.status === 'FINANCIAL_OPENING_READY' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{t.evaluationMethod}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigate('notice-board')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
