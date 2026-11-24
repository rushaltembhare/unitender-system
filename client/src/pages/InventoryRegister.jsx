import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Boxes, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Tag, 
  Printer
} from 'lucide-react';

export function InventoryRegister() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">University Fixed Asset & Stock Register</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              GFR 2017 Chapter 7
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated stock accessioning directly integrated with tender delivery QC inspections for NAAC/NBA audit criteria
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <Printer className="w-4 h-4" />
          <span>Export Asset Register (PDF)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Asset Tag, Item Name, Department or Lab Room..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Accessioned Capital Assets ({filtered.length})</span>
          <span className="text-[11px] text-slate-500">Auto-tagged with institutional Barcode / QR ID</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Code / Tag</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4">Department & Campus Location</th>
                <th className="py-3 px-4">Vendor & Tender Ref</th>
                <th className="py-3 px-4">Capital Cost (INR)</th>
                <th className="py-3 px-4">QC Inspection & Warranty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px] block w-fit">
                      {item.assetCode}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Qty: {item.quantity}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-semibold text-slate-800">{item.department}</p>
                    <span className="text-[10px] text-slate-500 block">{item.location}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{item.vendor}</p>
                    <code className="text-[10px] text-slate-500 font-mono">{item.tenderRef}</code>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{item.totalCost?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block w-fit mb-0.5">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      {item.inspectionCertificate}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Warranty Expiry: <strong>{item.warrantyExpiry}</strong>
                    </span>
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
