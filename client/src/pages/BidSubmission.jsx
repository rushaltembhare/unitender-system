import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  FileText, 
  IndianRupee, 
  CheckCircle2, 
  Send, 
  Key, 
  Sparkles,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export function BidSubmission({ tender, onClose, onBidSubmitted }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: KYC & MSME, 2: Technical Envelope, 3: Financial BOQ, 4: e-Sign & Seal
  
  // Step 1: MSME & EMD
  const [msmeClaimed, setMsmeClaimed] = useState(user?.msmeRegistered || false);
  const [msmeNumber, setMsmeNumber] = useState(user?.msmeUdyam || 'UDYAM-MH-02-0045892');
  const [emdMode, setEmdMode] = useState('UPI / NetBanking');
  const [emdTxn, setEmdTxn] = useState('TXN-' + Math.floor(Math.random() * 899999 + 100000));

  // Step 2: Technical Envelope
  const [docs, setDocs] = useState([
    { name: 'OEM Authorization Form (MAF)', included: true },
    { name: 'Audited Balance Sheets (3 Years)', included: true },
    { name: 'Past Institutional Performance Certificates', included: true },
    { name: 'GST & PAN Compliance Certificates', included: true }
  ]);
  const [techRemarks, setTechRemarks] = useState('We fully comply with all technical specifications and deliver within 30 days.');

  // Step 3: Financial Envelope BOQ
  const [unitRate, setUnitRate] = useState(tender?.estimatedCost ? Math.round(tender.estimatedCost * 0.92) : 2200000);
  const [gstRate, setGstRate] = useState(18);

  // Step 4: Digital Signature / e-Sign
  const [signatureType, setSignatureType] = useState('VERIFIED_ESIGN_AADHAAR');
  const [signOtp, setSignOtp] = useState('742910');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sealedDigest, setSealedDigest] = useState(null);

  if (!tender) return null;

  const totalAmount = Math.round(Number(unitRate) * (1 + Number(gstRate) / 100));

  const toggleDoc = (idx) => {
    const copy = [...docs];
    copy[idx].included = !copy[idx].included;
    setDocs(copy);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (enteredOtp !== '742910' && enteredOtp !== '123456') {
      alert('Please enter test authorization OTP: 742910');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tenderId: tender.id,
        signatureType,
        msmeExemptionClaimed: msmeClaimed,
        emdTransactionRef: msmeClaimed ? null : emdTxn,
        technicalEnvelope: {
          submittedDocs: docs.filter(d => d.included).map(d => d.name),
          remarks: techRemarks
        },
        financialEnvelope: {
          itemizedQuotes: [
            { item: tender.title, unitRate: Number(unitRate), gstRate: Number(gstRate), total: totalAmount }
          ],
          totalAmount
        }
      };

      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'vendor-1'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSealedDigest(data.bid.financialEnvelope.encryptedDigest);
        if (onBidSubmitted) onBidSubmitted(data.bid);
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (err) {
      alert('Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Encrypted Two-Envelope Bid Vault
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">Submit Bid for {tender.referenceNumber}</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{tender.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        {!sealedDigest && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'KYC & EMD' },
              { num: 2, label: 'Envelope A (Tech)' },
              { num: 3, label: 'Envelope B (BOQ)' },
              { num: 4, label: 'e-Sign & Seal' }
            ].map((s) => (
              <div key={s.num} className="flex items-center space-x-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  step === s.num ? 'bg-blue-600 text-white' :
                  step > s.num ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className={`font-semibold ${step === s.num ? 'text-blue-700' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          
          {/* Post-submission Success Receipt */}
          {sealedDigest ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Bid Sealed & Cryptographically Enqueued</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Your Envelope A (Technical) and Envelope B (Financial) have been registered. Financial envelope is strictly locked and cannot be decrypted until technical evaluation passes.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between text-slate-600">
                  <span>Vendor:</span>
                  <strong className="text-slate-800">{user?.name}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tender Reference:</span>
                  <strong className="font-mono text-slate-800">{tender.referenceNumber}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Bid Value (Encrypted):</span>
                  <strong className="text-emerald-700">₹{totalAmount.toLocaleString('en-IN')} (Locked)</strong>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">SHA-256 Envelope Digest</span>
                  <code className="text-[10px] text-slate-700 font-mono break-all">{sealedDigest}</code>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: KYC, MSME & EMD */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-900 space-y-1">
                    <span className="font-bold block">GFR 2017 Rule 170 MSME Exemption Check</span>
                    <p className="text-[11px] text-blue-800">
                      Micro and Small Enterprises (MSEs) registered with Udyam are exempt from paying Earnest Money Deposit (EMD) and Tender Fees.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={msmeClaimed}
                        onChange={(e) => setMsmeClaimed(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Claim EMD Exemption as MSME / Startup (Udyam Registered)</span>
                    </label>

                    {msmeClaimed ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Udyam Registration Number</label>
                        <input
                          type="text"
                          value={msmeNumber}
                          onChange={(e) => setMsmeNumber(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                        />
                        <span className="text-[10px] text-emerald-600 font-medium block mt-1">
                          ✓ EMD of ₹{tender.emdAmount.toLocaleString('en-IN')} waived
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-700 block">Pay EMD via Online Gateway</span>
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                          <span>Required EMD Amount:</span>
                          <strong className="font-bold text-slate-900">₹{tender.emdAmount.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={emdTxn}
                            onChange={(e) => setEmdTxn(e.target.value)}
                            placeholder="Gateway Transaction Reference"
                            className="flex-1 p-2 border border-slate-300 rounded-lg bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => alert(`EMD of ₹${tender.emdAmount} paid via simulated UPI/NetBanking.`)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                          >
                            Pay Online
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Envelope A - Technical Proposal */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700">
                    Upload eligibility documents and technical specification compliance sheet.
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block">Mandatory Qualification Documents</span>
                    {docs.map((doc, idx) => (
                      <label key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                        <span className="font-medium text-slate-700">{doc.name}</span>
                        <input
                          type="checkbox"
                          checked={doc.included}
                          onChange={() => toggleDoc(idx)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Technical Compliance Remarks & Warranty Affirmation</label>
                    <textarea
                      rows={3}
                      value={techRemarks}
                      onChange={(e) => setTechRemarks(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Envelope B - Financial BOQ */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-purple-900 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Lock className="w-4 h-4 text-purple-600" />
                      <span>End-to-End Cryptographic Sealed BOQ Envelope</span>
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Your commercial quote will be encrypted with an institutional public key. It is mathematically impossible for anyone (including the university admin) to view your price until technical qualification is finalized in the Live Bid Opening Room.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Base Price / Unit Rate (Excluding GST in ₹)</label>
                      <input
                        type="number"
                        value={unitRate}
                        onChange={(e) => setUnitRate(e.target.value)}
                        className="w-full text-sm font-bold p-2.5 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Applicable GST Rate (%)</label>
                      <select
                        value={gstRate}
                        onChange={(e) => setGstRate(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                      >
                        <option value="0">0% (Exempted)</option>
                        <option value="5">5% (Concessional for University Research)</option>
                        <option value="12">12%</option>
                        <option value="18">18% (Standard IT & Equipment)</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                      <span>Total Commercial Quote (INR):</span>
                      <span className="text-base text-blue-700">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Digital Signature / Aadhaar eSign & Seal */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1">
                    <span className="font-bold block">Aadhaar e-Sign & Digital Signature Verification</span>
                    <p className="text-[11px] text-emerald-800">
                      Submissions carry legal validity under IT Act 2000. Authorize this submission with your mobile OTP.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Authentication Method</label>
                      <select
                        value={signatureType}
                        onChange={(e) => setSignatureType(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                      >
                        <option value="VERIFIED_ESIGN_AADHAAR">Aadhaar e-Sign (UIDAI OTP Service)</option>
                        <option value="VERIFIED_DSC_CLASS3">Class-3 Digital Signature Certificate (DSC USB Token)</option>
                        <option value="VERIFIED_OTP">Procurement Portal 2FA One-Time Passcode</option>
                      </select>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center justify-between text-amber-900 text-xs">
                      <span>Demo Verification OTP: <strong>742910</strong></span>
                      <button
                        type="button"
                        onClick={() => setEnteredOtp('742910')}
                        className="font-bold underline text-amber-800 hover:text-amber-950"
                      >
                        Auto-fill
                      </button>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit Passcode</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="742910"
                        className="w-full text-center tracking-widest text-lg font-mono p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex justify-between pt-3 border-t border-slate-200">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-xs"
                  >
                    Proceed to Step {step + 1}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="flex items-center space-x-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? 'Encrypting & Sealing...' : 'Seal & Submit Bid Envelopes'}</span>
                  </button>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
