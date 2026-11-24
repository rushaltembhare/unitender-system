import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Filter, 
  Download, 
  Send, 
  Calendar, 
  IndianRupee, 
  FileCheck, 
  ShieldCheck, 
  AlertCircle, 
  Building2,
  Clock,
  Eye,
  MessageSquare,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export function NoticeBoard({ onOpenBidModal, onOpenDetailsModal }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      let url = `/api/tenders?search=${encodeURIComponent(search)}`;
      if (categoryFilter !== 'ALL') url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (statusFilter !== 'ALL') url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTenders(data.tenders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTenders();
  };

  const handleDownloadDocs = async (tender) => {
    try {
      const res = await fetch(`/api/tenders/${tender.id}/download`, {
        method: 'POST',
        headers: { 'x-user-id': user?.id || 'vendor-1' }
      });
      const data = await res.json();
      if (data.success) {
        setDownloadSuccess(`Downloaded official tender document package for ${tender.referenceNumber}. Download logged in immutable audit ledger with your IP.`);
        setTimeout(() => setDownloadSuccess(null), 6000);
      }
    } catch (err) {
      alert('Download tracking failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">{t('nav.noticeBoard')}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Open Competitive Bidding
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active tenders published across departments under GFR 2017 Rules 149, 161 & 170
          </p>
        </div>

        {user?.role === 'vendor' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Logged in as <strong className="text-emerald-950">{user.name}</strong>. MSME EMD exemption automatically active.
            </span>
          </div>
        )}
      </div>

      {/* Download Alert Notification */}
      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="font-bold text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Goods">Goods & Equipment</option>
              <option value="Services">Services & AMC</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Open for Bidding (Published)</option>
              <option value="TECHNICAL_EVALUATION">Technical Evaluation</option>
              <option value="FINANCIAL_OPENING_READY">Ready for Financial Opening</option>
              <option value="AWARDED">Awarded Contracts</option>
            </select>
          </div>

        </form>
      </div>

      {/* Tender Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading tenders...</div>
        ) : tenders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No tenders found matching your search criteria.
          </div>
        ) : (
          tenders.map((tender) => (
            <div 
              key={tender.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {tender.referenceNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {tender.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tender.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      tender.status === 'TECHNICAL_EVALUATION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      tender.status === 'FINANCIAL_OPENING_READY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {tender.status.replace(/_/g, ' ')}
                    </span>
                    {tender.corrigenda?.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                        {tender.corrigenda.length} Corrigendum Issued
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                      onClick={() => onOpenDetailsModal(tender)}>
                    {tender.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Department: <strong className="text-slate-700">{tender.departmentName}</strong> | Budget Head: <code className="font-mono text-slate-600">{tender.budgetCode}</code>
                  </p>
                </div>

                <div className="text-right md:min-w-44 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Cost</span>
                  <span className="text-lg font-extrabold text-slate-900 block">
                    ₹{tender.estimatedCost.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    EMD: ₹{tender.emdAmount.toLocaleString('en-IN')} (MSE Exempt)
                  </span>
                </div>
              </div>

              {/* Specifications preview */}
              <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 mb-1 block">Key Technical Parameters:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {tender.specifications?.slice(0, 3).map((spec, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200/80">
                      <span className="font-semibold text-slate-800 block text-[11px]">{spec.item}</span>
                      <span className="text-slate-500 text-[10px] line-clamp-1">{spec.requirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline & Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Deadline: <strong className="ml-1 text-slate-700">{new Date(tender.submissionDeadline).toLocaleDateString('en-IN')}</strong>
                  </span>
                  <span className="flex items-center">
                    <Download className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Downloads Tracked: <strong className="ml-1 text-slate-700">{tender.downloadsCount || 0}</strong>
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Queries: <strong className="ml-1 text-slate-700">{tender.preBidQueries?.length || 0}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenDetailsModal(tender)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details & Q&A</span>
                  </button>

                  <button
                    onClick={() => handleDownloadDocs(tender)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Specs (PDF)</span>
                  </button>

                  {tender.status === 'PUBLISHED' && (
                    <button
                      onClick={() => onOpenBidModal(tender)}
                      className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit 2-Envelope Bid</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
