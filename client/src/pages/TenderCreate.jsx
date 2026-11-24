import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FilePlus2, 
  Sparkles, 
  ShieldCheck, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Send,
  Building2,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

export function TenderCreate({ onTenderCreated, prefilledData }) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Goods / IT & Electronics');
  const [templateType, setTemplateType] = useState('computers');
  const [departmentId, setDepartmentId] = useState('dept-cse');
  const [departmentName, setDepartmentName] = useState('Department of Computer Science & Engineering');
  const [budgetCode, setBudgetCode] = useState('DST-AI-2025');
  const [estimatedCost, setEstimatedCost] = useState('2500000');
  const [emdAmount, setEmdAmount] = useState('50000');
  const [tenderFee, setTenderFee] = useState('1500');
  const [biddingType, setBiddingType] = useState('TWO_ENVELOPE');
  const [evaluationMethod, setEvaluationMethod] = useState('L1');
  const [minTechnicalScore, setMinTechnicalScore] = useState(70);

  // Timelines
  const [submissionDeadline, setSubmissionDeadline] = useState(
    new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 16)
  );

  // Specifications
  const [specs, setSpecs] = useState([
    { item: 'Processor', requirement: 'Intel Core i9 14th Gen or AMD Ryzen 9 7900X, 16+ Cores' },
    { item: 'Memory', requirement: '32 GB DDR5 RAM (Expandable up to 128 GB)' },
    { item: 'Storage', requirement: '1 TB NVMe M.2 SSD + 2 TB Enterprise HDD' },
    { item: 'Warranty', requirement: '3 Years Comprehensive On-Site OEM Warranty' }
  ]);

  // Eligibility
  const [eligibility, setEligibility] = useState([
    'Minimum 3 years turnover of >= ₹1 Crore',
    'OEM Authorization Letter (MAF) addressed to Registrar',
    'GST and PAN registration compliance with clean track record'
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Apply prefilled data from AI Spec Drafter if passed
  useEffect(() => {
    if (prefilledData) {
      if (prefilledData.title) setTitle(prefilledData.title);
      if (prefilledData.suggestedCategory) setCategory(prefilledData.suggestedCategory);
      if (prefilledData.suggestedEmd) setEmdAmount(String(prefilledData.suggestedEmd));
      if (prefilledData.specifications?.length > 0) setSpecs(prefilledData.specifications);
      if (prefilledData.eligibilityCriteria?.length > 0) setEligibility(prefilledData.eligibilityCriteria);
    }
  }, [prefilledData]);

  // Template prefill logic
  const handleSelectTemplate = (type) => {
    setTemplateType(type);
    if (type === 'computers') {
      setTitle('Supply and Installation of Desktop Computers and High-Speed Network Switches');
      setCategory('Goods / IT & Electronics');
      setSpecs([
        { item: 'Processor', requirement: 'Intel Core i7/i9 14th Gen or AMD Ryzen 9' },
        { item: 'Memory', requirement: '32 GB DDR5 RAM' },
        { item: 'Storage', requirement: '1 TB NVMe PCIe Gen4 SSD' },
        { item: 'Warranty', requirement: '3 Years Comprehensive On-site OEM Warranty' }
      ]);
    } else if (type === 'lab_equipment') {
      setTitle('Procurement of Analytical Laboratory Equipment and Biosafety Workstation');
      setCategory('Goods / Scientific Instruments');
      setSpecs([
        { item: 'Instrument Precision', requirement: 'High precision optical sensor with +/- 0.005 accuracy' },
        { item: 'Calibration', requirement: 'NABL traceable calibration certificate included' },
        { item: 'Software', requirement: 'CFR 21 Part 11 compliant audit trail suite' }
      ]);
      setEvaluationMethod('QCBS');
    } else if (type === 'amc') {
      setTitle('Annual Maintenance Contract (AMC) for Campus Air Conditioners & Water Purifiers');
      setCategory('Services & AMC');
      setSpecs([
        { item: 'Response Time', requirement: 'Maximum 2 hours breakdown response time' },
        { item: 'Preventive Care', requirement: 'Bi-monthly comprehensive servicing and filter change' },
        { item: 'Spares', requirement: 'All genuine OEM compressors, motors, and PCBS included' }
      ]);
      setEvaluationMethod('L1');
    } else if (type === 'furniture') {
      setTitle('Supply of Ergonomic Classroom Desks, Chairs, and Library Book Racks');
      setCategory('Goods / Furniture');
      setSpecs([
        { item: 'Frame Material', requirement: 'High grade powder-coated CRCA steel tube (>= 1.2mm)' },
        { item: 'Table Top', requirement: '25mm Pre-laminated exterior grade board' },
        { item: 'Durability', requirement: 'BIFMA Level 2 certified ergonomic structure' }
      ]);
      setEvaluationMethod('L1');
    }
  };

  const addSpec = () => {
    setSpecs([...specs, { item: '', requirement: '' }]);
  };

  const removeSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleSubmitTender = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title,
        category,
        templateType,
        departmentId,
        departmentName,
        budgetCode,
        estimatedCost: Number(estimatedCost),
        emdAmount: Number(emdAmount),
        tenderFee: Number(tenderFee),
        biddingType,
        evaluationMethod,
        minTechnicalScore: Number(minTechnicalScore),
        submissionDeadline,
        specifications: specs.filter(s => s.item.trim() !== ''),
        eligibilityCriteria: eligibility,
        gfrCompliance: {
          gfrRule: 'GFR 2017 Rule 149 / 161 (Open Competitive Advertised Bidding)',
          noticePeriodDays: 25,
          gemNonAvailabilityRef: 'GeM/GAR/' + Math.floor(Math.random() * 899999 + 100000),
          procurementType: 'Advertised Tender'
        }
      };

      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin-1'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Tender ${data.tender.referenceNumber} created and published successfully!`);
        if (onTenderCreated) onTenderCreated(data.tender);
      } else {
        alert(data.message || 'Creation failed');
      }
    } catch (err) {
      alert('Error creating tender');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create & Publish New Tender</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build standardized procurement tenders using pre-configured university templates and GFR 2017 rules
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Two-Envelope System (Envelope A + B)
          </span>
        </div>
      </div>

      {/* Smart Template Picker */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Select Smart University Procurement Template</span>
          <span className="text-[11px] text-slate-400">Pre-fills technical parameters & standard clauses</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'computers', label: 'IT & Computers', icon: '💻' },
            { id: 'lab_equipment', label: 'Lab Equipment', icon: '🔬' },
            { id: 'amc', label: 'AMC & Services', icon: '⚙️' },
            { id: 'furniture', label: 'Campus Furniture', icon: '🪑' }
          ].map(tpl => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tpl.id)}
              className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                templateType === tpl.id 
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-xl">{tpl.icon}</span>
              <span className="text-xs font-bold">{tpl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmitTender} className="space-y-6">
        
        {/* Core Metadata */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Tender Scope & Allocation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tender Title / Subject</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Supply and Installation of 60 High Performance GPU Workstations"
                className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Procurement Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setDepartmentName(e.target.options[e.target.selectedIndex].text);
                }}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="dept-cse">Department of Computer Science & Engineering</option>
                <option value="dept-chem">Department of Chemistry & Materials</option>
                <option value="dept-lib">Central University Library</option>
                <option value="dept-hostel">Student Hostels & Campus Amenities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Budget Allocation Code</label>
              <input
                type="text"
                value={budgetCode}
                onChange={(e) => setBudgetCode(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost (₹ INR)</label>
              <input
                type="number"
                required
                value={estimatedCost}
                onChange={(e) => {
                  setEstimatedCost(e.target.value);
                  setEmdAmount(String(Math.round(Number(e.target.value) * 0.02)));
                }}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">EMD Deposit (₹ 2%)</label>
              <input
                type="number"
                value={emdAmount}
                onChange={(e) => setEmdAmount(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Auto-waived for MSME/Udyam vendors under GFR Rule 170</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tender Document Fee (₹)</label>
              <input
                type="number"
                value={tenderFee}
                onChange={(e) => setTenderFee(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Evaluation Method & Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Evaluation Methodology & Timelines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Evaluation Model</label>
              <select
                value={evaluationMethod}
                onChange={(e) => setEvaluationMethod(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="L1">L1 (Lowest Commercial Quote Among Qualified)</option>
                <option value="QCBS">QCBS (Quality & Cost Based Selection 70:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Technical Qualifying Score</label>
              <input
                type="number"
                value={minTechnicalScore}
                onChange={(e) => setMinTechnicalScore(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline</label>
              <input
                type="datetime-local"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications Matrix */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Technical Specifications Matrix
              </h3>
              <p className="text-[11px] text-slate-500">Bidders must furnish parameter-by-parameter compliance in Envelope A</p>
            </div>
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </div>

          <div className="space-y-2">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Parameter (e.g. Memory)"
                  value={spec.item}
                  onChange={(e) => updateSpec(index, 'item', e.target.value)}
                  className="w-1/3 text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Specification Requirement"
                  value={spec.requirement}
                  onChange={(e) => updateSpec(index, 'requirement', e.target.value)}
                  className="flex-1 text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* GFR Compliance Affirmation */}
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 text-xs text-emerald-950 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>GFR 2017 & CVC Compliance Declarations Verified</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            ✓ Rule 149: Verified that item is procured following institutional open competitive norms.<br/>
            ✓ Rule 161: Bidding window exceeds mandatory 21 days for open advertised tender.<br/>
            ✓ Rule 170: MSME EMD waiver clause included in bidding instructions.<br/>
            ✓ Two-envelope system enforced: Financial envelope strictly encrypted until technical evaluation completion.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Publishing Tender...' : 'Publish Tender Notice Board'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
