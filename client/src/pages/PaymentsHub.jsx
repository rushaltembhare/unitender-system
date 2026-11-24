import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowUpRight, 
  PlusCircle,
  Building2,
  Wallet
} from 'lucide-react';

export function PaymentsHub() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Invoice form
  const [tenderId, setTenderId] = useState('TDR-2026-004');
  const [invoiceAmount, setInvoiceAmount] = useState('324000');
  const [invoiceNum, setInvoiceNum] = useState(`INV-UNIV-${Date.now().toString().slice(-4)}`);
  const [notes, setNotes] = useState('Milestone 2 Delivery (70 Units)');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Process automated EMD refund to original source account?')) return;
    try {
      const res = await fetch(`/api/payments/refund-emd/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'approver-1'
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('EMD refund successfully processed to vendor bank account.');
        fetchPayments();
      }
    } catch (err) {
      alert('Refund failed');
    }
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'vendor-4'
        },
        body: JSON.stringify({
          tenderId,
          amount: invoiceAmount,
          invoiceNumber: invoiceNum,
          milestoneNotes: notes
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Invoice submitted to Finance & Accounts division.');
        setShowInvoiceModal(false);
        fetchPayments();
      }
    } catch (err) {
      alert('Invoice submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payments, EMD & Invoice Clearing Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Earnest money deposit (EMD) escrow tracking, automated non-winning bidder refund settlement, and post-award invoice processing
          </p>
        </div>

        {user?.role === 'vendor' && (
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Milestone Invoice</span>
          </button>
        )}
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">All Financial Transactions & Escrow Records</span>
          <span className="text-[11px] text-slate-500">Auto-reconciliation via PFMS & NetBanking Gateway</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID & Ref</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Vendor Entity</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Status / Refund Stage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 font-mono">{p.id}</p>
                    <span className="text-[10px] text-slate-500">Tender: {p.tenderId}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.type === 'EMD' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {p.vendorName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{p.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.mode}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.refundStatus === 'REFUNDED_TO_SOURCE' || p.status === 'PROCESSED_ACCOUNTS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {p.refundStatus || p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.type === 'EMD' && p.refundStatus !== 'REFUNDED_TO_SOURCE' && (user?.role === 'admin' || user?.role === 'approver') && (
                      <button
                        onClick={() => handleRefund(p.id)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-bold transition flex items-center space-x-1 ml-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Refund EMD</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Submission Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Milestone Invoice</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter delivery milestone details for PFMS direct credit processing
            </p>

            <form onSubmit={handleSubmitInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tender / Work Order</label>
                <input
                  type="text"
                  required
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceNum}
                  onChange={(e) => setInvoiceNum(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Claim Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Milestone Description & Delivery Notes</label>
                <textarea
                  rows={2}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit to Accounts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
