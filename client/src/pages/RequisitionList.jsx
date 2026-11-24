import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Wallet, 
  Clock, 
  Building2,
  Send,
  FileCheck
} from 'lucide-react';

export function RequisitionList() {
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [selectedDeptId, setSelectedDeptId] = useState('dept-cse');
  const [selectedBudgetCode, setSelectedBudgetCode] = useState('DST-AI-2025');
  const [title, setTitle] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [justification, setJustification] = useState('');
  const [budgetCheckMsg, setBudgetCheckMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const [rRes, dRes] = await Promise.all([
        fetch('/api/requisitions'),
        fetch('/api/reports/analytics')
      ]);
      const rData = await rRes.json();
      if (rData.success) setRequisitions(rData.requisitions);

      // Fetch departments
      const deptRes = await fetch('/api/auth/users');
      // For simplicity, hardcoded depts matching store
      setDepartments([
        {
          id: 'dept-cse',
          name: 'Department of Computer Science & Engineering',
          budgets: [
            { code: 'DST-AI-2025', name: 'DST AI Center of Excellence Grant', allocated: 5000000, committed: 3600000 },
            { code: 'CSE-REC-2026', name: 'Department Recurring & Consumables', allocated: 1500000, committed: 400000 }
          ]
        },
        {
          id: 'dept-chem',
          name: 'Department of Chemistry & Materials',
          budgets: [
            { code: 'SERB-LAB-2025', name: 'SERB High-Tech Analytical Lab Grant', allocated: 3500000, committed: 2450000 },
            { code: 'CHM-ANN-2026', name: 'Annual Chemical Reagents Budget', allocated: 1000000, committed: 200000 }
          ]
        },
        {
          id: 'dept-hostel',
          name: 'Student Hostels & Campus Amenities',
          budgets: [
            { code: 'HOSTEL-DEV-2026', name: 'Hostel Maintenance & Mess Upgrades', allocated: 2500000, committed: 1550000 }
          ]
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleAmountChange = async (val) => {
    setEstimatedAmount(val);
    if (!val || Number(val) <= 0) {
      setBudgetCheckMsg(null);
      return;
    }

    try {
      const res = await fetch(`/api/requisitions/check-budget?departmentId=${selectedDeptId}&budgetCode=${selectedBudgetCode}&amount=${val}`);
      const data = await res.json();
      setBudgetCheckMsg(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    if (!budgetCheckMsg?.valid) {
      alert('Cannot submit requisition: Insufficient budget availability!');
      return;
    }

    setSubmitting(true);
    const activeDept = departments.find(d => d.id === selectedDeptId);
    const activeBudget = activeDept?.budgets.find(b => b.code === selectedBudgetCode);

    try {
      const res = await fetch('/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'dept-1'
        },
        body: JSON.stringify({
          title,
          departmentId: selectedDeptId,
          departmentName: activeDept?.name,
          budgetCode: selectedBudgetCode,
          budgetName: activeBudget?.name,
          estimatedAmount,
          justification
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setTitle('');
        setEstimatedAmount('');
        setJustification('');
        fetchRequisitions();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (reqId) => {
    const remarks = prompt('Enter sanctioning approval remarks for institutional audit trail:');
    if (remarks === null) return;

    try {
      const res = await fetch(`/api/requisitions/${reqId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'approver-1'
        },
        body: JSON.stringify({ remarks })
      });
      const data = await res.json();
      if (data.success) fetchRequisitions();
    } catch (err) {
      alert('Approval failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Purchase Requisitions & Budget Allocation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Department procurement requests verified against grants and approved before tender creation
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise New Requisition</span>
        </button>
      </div>

      {/* Requisition Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">All Requisition Records</span>
          <span className="text-[11px] text-slate-500">Auto-encumbrance on submission</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Req ID & Need</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Budget Head</th>
                <th className="py-3 px-4">Estimated Amount</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Approval Ladder</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {requisitions.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{req.title}</p>
                    <span className="font-mono text-[10px] text-slate-500">{req.id}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-semibold text-slate-800">{req.departmentName}</p>
                    <span className="text-[10px] text-slate-500">Raised by: {req.requesterName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 block w-fit">
                      {req.budgetCode}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{req.budgetName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{req.estimatedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      req.status === 'PENDING_REGISTRAR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      req.status === 'PENDING_FINANCE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">HOD</span>
                      <span>→</span>
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${
                        req.status === 'PENDING_FINANCE' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                      }`}>FO</span>
                      <span>→</span>
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${
                        req.status === 'PENDING_REGISTRAR' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>Registrar</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {(user?.role === 'approver' || user?.role === 'admin') && req.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold shadow-xs transition"
                      >
                        Sanction / Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise Requisition Modal with Live Budget Verification */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Purchase Requisition</h3>
            <p className="text-xs text-slate-500 mb-4">
              Funds will be mathematically encumbered against the department grant code
            </p>

            <form onSubmit={handleCreateRequisition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    const dept = departments.find(d => d.id === e.target.value);
                    if (dept?.budgets.length > 0) {
                      setSelectedBudgetCode(dept.budgets[0].code);
                    }
                  }}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Budget Allocation Code (Grant)</label>
                <select
                  value={selectedBudgetCode}
                  onChange={(e) => {
                    setSelectedBudgetCode(e.target.value);
                    handleAmountChange(estimatedAmount);
                  }}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {departments.find(d => d.id === selectedDeptId)?.budgets.map(b => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name} (Avail: ₹{(b.allocated - b.committed).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipment / Need Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 30 High Performance Computing Desktops for AI Lab"
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Requisition Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={estimatedAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="1200000"
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                
                {/* Live Budget Availability Indicator */}
                {budgetCheckMsg && (
                  <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                    budgetCheckMsg.valid
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-red-50 text-red-900 border-red-200'
                  }`}>
                    {budgetCheckMsg.valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Budget Available! Remaining unencumbered balance: ₹{budgetCheckMsg.available?.toLocaleString('en-IN')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{budgetCheckMsg.reason}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic & Technical Justification</label>
                <textarea
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="State academic reason, research grant reference, and student benefit..."
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (budgetCheckMsg && !budgetCheckMsg.valid)}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for Approvals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
