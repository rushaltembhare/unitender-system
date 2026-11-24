import React from 'react';
import { 
  BookOpenCheck, 
  ShieldCheck, 
  Send, 
  FileText, 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  CreditCard
} from 'lucide-react';

export function VendorGuide({ onNavigate }) {
  const steps = [
    {
      num: 1,
      title: 'Vendor KYC Registration & MSME Udyam Verification',
      desc: 'Complete your profile with valid 15-digit GSTIN and 10-digit PAN. If registered as Micro or Small Enterprise under MSME (Udyam), enter your certificate number to activate 100% waiver on EMD deposits and tender document fees as per GFR 2017 Rule 170.',
      actionLabel: 'Go to Vendor KYC Portal',
      tab: 'vendors'
    },
    {
      num: 2,
      title: 'Browse Public Notice Board & Download Specifications',
      desc: 'Browse active open competitive tenders across university departments (IT, Scientific Labs, Civil, Campus Amenities). Click "Download Tender Document" to inspect specifications, eligibility criteria, and delivery timelines.',
      actionLabel: 'View Notice Board',
      tab: 'notice-board'
    },
    {
      num: 3,
      title: 'Pre-Bid Meeting & Clarification Queries',
      desc: 'If specifications require clarification or delivery timeline relaxation, post queries in the Pre-Bid Q&A section before the meeting deadline. All answers and official Corrigenda are published transparently for all bidders.',
      actionLabel: 'Inspect Active Tenders',
      tab: 'notice-board'
    },
    {
      num: 4,
      title: 'Submit Sealed Two-Envelope Bid (Technical & Financial)',
      desc: 'UniTender mandates a strict two-envelope process. Envelope A contains your eligibility credentials, OEM authorization, and spec compliance. Envelope B contains your itemized commercial BOQ rate. Your financial envelope is cryptographically locked with public-key encryption and cannot be opened before technical qualification.',
      actionLabel: 'Submit Bid Now',
      tab: 'notice-board'
    },
    {
      num: 5,
      title: 'Live Opening Room & Comparative Statement (CSQ)',
      desc: 'Witness the transparent live bid opening session where the Evaluation Committee Chair and Finance Officer perform dual-key quorum decryption. Review the automatically generated Comparative Statement ranking L1 or QCBS scores.',
      actionLabel: 'View Live Opening Room',
      tab: 'bid-opening'
    },
    {
      num: 6,
      title: 'Work Order Execution & Automatic Asset Accessioning',
      desc: 'Winning bidders receive an official digital Work Order with institutional letterhead. Upon delivery and QC inspection, milestone invoices are submitted online, and items automatically sync into the University Asset Register.',
      actionLabel: 'View Contracts & Work Orders',
      tab: 'contracts'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Bidder Enablement Portal
          </span>
          <span className="text-xs text-slate-400">
            Under GFR 2017 & CVC Guidelines
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mt-1 text-white">
          Step-by-Step Bidding Guide for Vendors & MSMEs
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Everything you need to know about registering, participating in university tenders, availing MSME exemptions, and submitting encrypted two-envelope proposals.
        </p>
      </div>

      {/* Step Cards */}
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.num} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 hover:border-blue-300 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center shrink-0 border border-blue-200 text-sm">
                  {s.num}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>

              {s.actionLabel && (
                <button
                  onClick={() => onNavigate(s.tab)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold rounded-xl text-xs transition border border-slate-200 shrink-0 flex items-center space-x-1"
                >
                  <span>{s.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* GFR Exemption Help box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-xs text-emerald-950 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-emerald-900 text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>MSME & Startup Rights under GFR 2017 Rule 170</span>
        </div>
        <p className="text-emerald-800 leading-relaxed">
          Public procurement guidelines mandate that all Central & State Universities provide waiver of Earnest Money Deposit (EMD) to verified Micro and Small Enterprises (MSEs) and recognized DPIIT Startups. In UniTender, claiming exemption is fully automated during bid submission upon furnishing your valid Udyam registration ID.
        </p>
      </div>

    </div>
  );
}
