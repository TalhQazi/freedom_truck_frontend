import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { cashUpApi } from '../api/client.js';
import { DailyCashUp, PaidOutDetail } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { SignatureModal } from '../components/SignatureModal.js';
import {
  DollarSign,
  Calendar,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Plus,
  Trash2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const CashUp: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [cashUps, setCashUps] = useState<DailyCashUp[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily Form State
  const [businessDate, setBusinessDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [openingFloat, setOpeningFloat] = useState<number>(100.0);
  const [cashSales, setCashSales] = useState<string>('0.00');
  const [cashRefunds, setCashRefunds] = useState<string>('0.00');
  const [paidOuts, setPaidOuts] = useState<PaidOutDetail[]>([]);
  const [newPaidOutReason, setNewPaidOutReason] = useState('');
  const [newPaidOutAmount, setNewPaidOutAmount] = useState('');
  const [newPaidOutRecipient, setNewPaidOutRecipient] = useState('');
  const [actualCountedCash, setActualCountedCash] = useState<string>('100.00');
  const [explanationOfVariance, setExplanationOfVariance] = useState('');

  // Signature modal
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  // Manager review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCashUp, setSelectedCashUp] = useState<DailyCashUp | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'DISCREPANCY_ESCALATED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCashUps = async () => {
    setLoading(true);
    try {
      const [listRes, todayRes] = await Promise.all([
        cashUpApi.getCashUps(),
        cashUpApi.getTodaySummary(),
      ]);
      setCashUps(listRes.data.data);
      if (todayRes.data.systemCalculatedCashSales !== undefined) {
        setCashSales(todayRes.data.systemCalculatedCashSales.toFixed(2));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashUps();
  }, []);

  const totalPaidOuts = paidOuts.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const numCashSales = Number(cashSales) || 0;
  const numCashRefunds = Number(cashRefunds) || 0;
  const numActualCash = Number(actualCountedCash) || 0;

  // SOP SW-015 Formulas
  const expectedCash = Math.round((openingFloat + numCashSales - numCashRefunds - totalPaidOuts) * 100) / 100;
  const difference = Math.round((numActualCash - expectedCash) * 100) / 100;
  const cashRemovedForDeposit = Math.max(0, Math.round((numActualCash - 100.0) * 100) / 100);
  const closingDrawerBalance = 100.0; // Strictly $100.00 target

  const handleAddPaidOut = () => {
    const amt = parseFloat(newPaidOutAmount);
    if (!newPaidOutReason || isNaN(amt) || amt <= 0 || !newPaidOutRecipient) {
      alert('Please provide paid-out reason, recipient, and positive amount.');
      return;
    }
    setPaidOuts([
      ...paidOuts,
      { reason: newPaidOutReason, amount: amt, recipient: newPaidOutRecipient },
    ]);
    setNewPaidOutReason('');
    setNewPaidOutAmount('');
    setNewPaidOutRecipient('');
  };

  const handleRemovePaidOut = (idx: number) => {
    setPaidOuts(paidOuts.filter((_, i) => i !== idx));
  };

  const handleSignatureConfirmed = (sigDataUrl: string) => {
    setSavedSignature(sigDataUrl);
  };

  const handleSubmitCashUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedSignature) {
      setError('SOP SW-015: Service writer digital signature is mandatory before submitting cash-up.');
      return;
    }
    if (Math.abs(difference) > 0.01 && !explanationOfVariance) {
      setError('SOP SW-015: A cash difference was detected. You must provide an explanation of variance.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await cashUpApi.submitCashUp({
        businessDate,
        openingFloat,
        cashSales: numCashSales,
        cashRefunds: numCashRefunds,
        paidOuts: totalPaidOuts,
        paidOutDetails: paidOuts,
        actualCountedCash: numActualCash,
        explanationOfVariance,
        employeeSignature: savedSignature,
      });
      setSuccess('Daily register cash-up successfully reconciled and submitted (SW-015).');
      fetchCashUps();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit cash-up.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManagerReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCashUp) return;
    try {
      await cashUpApi.managerReview(selectedCashUp._id, {
        decision: reviewDecision,
        notes: reviewNotes,
      });
      setReviewModalOpen(false);
      fetchCashUps();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review cash-up.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            <span>Daily Register Cash-Up &amp; Drawer Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-500">
            SOP SW-015: Daily register reconciliation with mandatory exact $100.00 closing drawer balance
          </p>
        </div>

        <div className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-300">
          Target Closing Float: $100.00 EXACT
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-md text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-md text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Today's Reconciliation Form (SW-015) */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-white text-slate-900 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold">
              Register Drawer Reconciliation (SOP SW-015 Sheet)
            </h2>
          </div>
          <span className="text-xs text-slate-700">
            Service Writer: {user?.name} ({user?.employeeId})
          </span>
        </div>

        <form onSubmit={handleSubmitCashUp} className="p-6 space-y-6">
          {/* Top Inputs: Date, Opening Float */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Date *
              </label>
              <input
                type="date"
                required
                value={businessDate}
                onChange={(e) => setBusinessDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opening Float (Drawer Start) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  value={openingFloat.toFixed(2)}
                  className="w-full text-xs bg-slate-100 border border-slate-300 rounded-md pl-7 pr-3 py-2 text-slate-700 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cash Sales Recorded Today *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cashSales}
                  onChange={(e) => setCashSales(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-md pl-7 pr-3 py-2 text-slate-900 font-bold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Paid-Outs Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Authorized Register Paid-Outs
              </span>
              <span className="text-xs text-slate-500">
                Total Paid-Outs: <span className="font-bold text-slate-900">${totalPaidOuts.toFixed(2)}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Reason (e.g. Shop Degreaser Rags)"
                value={newPaidOutReason}
                onChange={(e) => setNewPaidOutReason(e.target.value)}
                className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 sm:col-span-2"
              />
              <input
                type="text"
                placeholder="Recipient / Vendor"
                value={newPaidOutRecipient}
                onChange={(e) => setNewPaidOutRecipient(e.target.value)}
                className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5"
              />
              <div className="flex space-x-1.5">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount ($)"
                  value={newPaidOutAmount}
                  onChange={(e) => setNewPaidOutAmount(e.target.value)}
                  className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 w-full"
                />
                <button
                  type="button"
                  onClick={handleAddPaidOut}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-md shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            {paidOuts.length > 0 && (
              <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Reason</th>
                      <th className="p-2">Recipient</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paidOuts.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2">{p.reason}</td>
                        <td className="p-2">{p.recipient}</td>
                        <td className="p-2 text-right font-bold">${p.amount.toFixed(2)}</td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemovePaidOut(idx)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Actual Counted Cash & Calculation Grid */}
          <div className="pt-3 border-t border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Register Count (Actual Currency Counted) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={actualCountedCash}
                    onChange={(e) => setActualCountedCash(e.target.value)}
                    className="w-full text-base border-2 border-blue-600 rounded-md pl-7 pr-3 py-2 text-blue-950 font-semibold focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Count all bills and coin rolled in drawer at closing.
                </p>
              </div>

              {/* Exact Formula Breakdown Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Expected Drawer Cash:</span>
                  <span className="font-bold text-slate-900">${expectedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Actual Counted Cash:</span>
                  <span className="font-bold text-blue-700">${numActualCash.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-bold pt-1 border-t border-slate-200 ${Math.abs(difference) > 0.01 ? 'text-red-600' : 'text-emerald-700'}`}>
                  <span>Reconciliation Difference:</span>
                  <span>${difference.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                  <span>Cash Removed for Bank Deposit:</span>
                  <span className="font-bold text-slate-900">${cashRemovedForDeposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 bg-emerald-100/60 p-1 rounded-md">
                  <span>Mandatory Closing Drawer Balance:</span>
                  <span>${closingDrawerBalance.toFixed(2)} EXACT</span>
                </div>
              </div>
            </div>

            {/* Variance Explanation if Difference != 0 */}
            {Math.abs(difference) > 0.01 && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Variance Detected (${difference.toFixed(2)}) – Explanation Mandatory (SW-015)</span>
                </div>
                <textarea
                  required
                  rows={2}
                  value={explanationOfVariance}
                  onChange={(e) => setExplanationOfVariance(e.target.value)}
                  placeholder="Detail explanation of cash variance (e.g. coin rounding discrepancy, customer change error)..."
                  className="w-full text-xs border border-red-300 rounded-md p-2 text-slate-900 focus:outline-none bg-white"
                />
              </div>
            )}
          </div>

          {/* Service Writer Digital Signature Block */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSigModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <span>{savedSignature ? '✓ Signature Attached' : 'Capture Employee Signature *'}</span>
              </button>
              {savedSignature && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Signed by {user?.name} ({user?.employeeId})</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-colors"
            >
              {submitting ? 'Submitting...' : 'Reconcile & Close Cash Drawer (SW-015)'}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Daily Cash-Up Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900">
            Historical Daily Cash Reconciliation Logs
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">Cash-Up #</th>
                <th className="px-4 py-3">Business Date</th>
                <th className="px-4 py-3">Service Writer</th>
                <th className="px-4 py-3 text-right">Expected Cash</th>
                <th className="px-4 py-3 text-right">Counted Cash</th>
                <th className="px-4 py-3 text-right">Variance</th>
                <th className="px-4 py-3 text-right">Bank Deposit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cashUps.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-blue-700">
                    {c.cashUpNumber}
                  </td>
                  <td className="px-4 py-3 font-medium">{c.businessDate}</td>
                  <td className="px-4 py-3 font-medium">
                    {c.serviceWriterName} ({c.serviceWriterEmployeeId})
                  </td>
                  <td className="px-4 py-3 text-right">${Number(c.expectedCash || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold">${Number(c.actualCountedCash || 0).toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${Math.abs(c.difference) > 0.01 ? 'text-red-600' : 'text-emerald-700'}`}>
                    ${Number(c.difference || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    ${Number(c.cashRemovedForDeposit || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a
                      href={cashUpApi.downloadPDFUrl(c._id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      <span>PDF</span>
                    </a>
                    {hasRole('manager', 'admin') && c.status === 'DISCREPANCY_PENDING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCashUp(c);
                          setReviewModalOpen(true);
                        }}
                        className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-bold text-xs"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Modal for Cash-Up */}
      <SignatureModal
        isOpen={sigModalOpen}
        onClose={() => setSigModalOpen(false)}
        onSave={handleSignatureConfirmed}
        title="Service Writer Cash-Up Certification (SW-015)"
        subtitle={`Business Date: ${businessDate} | Service Writer: ${user?.name}`}
        declarationText="I certify that I have conducted a physical count of all currency in register drawer #1. I verify the calculation of sales, paid-outs, and bank deposit removal, leaving an exact closing drawer balance of $100.00."
      />

      {/* Manager Review Modal for Discrepancy */}
      {reviewModalOpen && selectedCashUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Manager Review of Cash Variance (SW-015)
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManagerReviewSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div>Sheet: {selectedCashUp.cashUpNumber} ({selectedCashUp.businessDate})</div>
                <div>Variance: ${selectedCashUp.difference.toFixed(2)}</div>
                <div className="mt-1 text-slate-700 font-sans">
                  Explanation: {selectedCashUp.explanationOfVariance || 'None provided.'}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Manager Decision *
                </label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5"
                >
                  <option value="APPROVED">Approved (Explanation Accepted)</option>
                  <option value="DISCREPANCY_ESCALATED">Escalate to executive audit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Manager Review Notes
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record supervisor review notes..."
                  className="w-full border border-slate-300 rounded-md p-2"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
                >
                  Confirm Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
