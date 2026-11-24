import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ScrollText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Boxes, 
  Building2, 
  FileCheck,
  TrendingDown
} from 'lucide-react';

export function ContractManager({ onNavigateToInventory }) {
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivingId, setReceivingId] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(null);

  const fetchAwardedTenders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenders');
      const data = await res.json();
      if (data.success) {
        setTenders(data.tenders.filter(t => t.status === 'AWARDED'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwardedTenders();
  }, []);

  const handleReceiveDeliveryAndSyncStock = async (tenderId) => {
    if (!window.confirm('Verify that goods/services have been physically inspected by the department committee and pass QC? This will automatically accession items into the University Asset Register.')) return;

    setReceivingId(tenderId);
    try {
      const res = await fetch(`/api/inventory/sync/${tenderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin-1'
        }
      });
      const data = await res.json();
      if (data.success) {
        setSyncSuccess(`Success! Asset ${data.asset.assetCode} created and registered under ${data.asset.department}.`);
        fetchAwardedTenders();
      } else {
        alert(data.message || 'Sync failed');
      }
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contract Management & Work Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official purchase orders, delivery milestones, Liquidated Damages (LD), and automatic Asset Register sync
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PO</span>
        </button>
      </div>

      {syncSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncSuccess}</span>
          </div>
          <button
            onClick={() => onNavigateToInventory()}
            className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg text-xs hover:bg-emerald-800 transition"
          >
            Open Asset Register →
          </button>
        </div>
      )}

      {/* Contracts List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading awarded contracts...</div>
        ) : tenders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No awarded contracts found yet. Complete evaluation and award an L1/QCBS tender to generate Work Orders.
          </div>
        ) : (
          tenders.map((tender) => (
            <div key={tender.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              
              {/* Official PO Header */}
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      WORK ORDER: {tender.workOrderNumber || 'WO/UNIV/2026/044'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tender.contractStatus || 'WORK_ORDER_ISSUED'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{tender.title}</h3>
                  <p className="text-xs text-slate-500">
                    Awarded Vendor: <strong className="text-slate-900">{tender.awardedVendorName}</strong> | Department: <span className="font-semibold text-slate-700">{tender.departmentName}</span>
                  </p>
                </div>

                <div className="text-right bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 min-w-44">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Contract Award Value</span>
                  <span className="text-lg font-extrabold text-emerald-700 block">
                    ₹{tender.awardedAmount?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold flex items-center justify-end mt-0.5">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    Saved ₹{tender.savingsAchieved?.toLocaleString('en-IN')} vs budget
                  </span>
                </div>
              </div>

              {/* Delivery Milestones & Liquidated Damages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">Delivery Milestone Progress</span>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivered Units:</span>
                    <strong className="text-slate-900">
                      {tender.deliveryMilestone?.deliveredItems || 0} / {tender.deliveryMilestone?.totalItems || 100}
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.round(((tender.deliveryMilestone?.deliveredItems || 0) / (tender.deliveryMilestone?.totalItems || 100)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Inspection: <strong>{tender.deliveryMilestone?.inspectionStatus || 'PENDING'}</strong>
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Liquidated Damages (LD Penalty Clause)</span>
                  <p className="text-[11px] text-slate-600">
                    Per GFR 2017 terms, a penalty of <strong>0.5% per week</strong> of delay up to a maximum of <strong>10%</strong> applies for late supplies.
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Current LD Status: On Schedule (₹0 Penalty)
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">University Asset Register Sync</span>
                    <p className="text-[11px] text-slate-600">
                      When items are inspected, they are automatically accessioned into the campus asset database.
                    </p>
                  </div>
                  
                  {tender.contractStatus === 'COMPLETED_IN_STOCK' ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      Accessioned to Asset Register
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReceiveDeliveryAndSyncStock(tender.id)}
                      disabled={receivingId === tender.id}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                    >
                      {receivingId === tender.id ? 'Accessioning...' : 'Inspect & Sync to Stock Register'}
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
