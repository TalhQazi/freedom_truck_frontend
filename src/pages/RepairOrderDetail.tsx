import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  repairOrderApi,
  depositApi,
  invoiceApi,
  authApi,
} from '../api/client.js';
import { RepairOrder, User } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  Wrench,
  ArrowLeft,
  Truck,
  Users,
  DollarSign,
  FileSpreadsheet,
  ClipboardCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Receipt,
  X,
  AlertCircle,
} from 'lucide-react';

export const RepairOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const [ro, setRo] = useState<RepairOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispatch modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');

  // Deposit collection modal (SW-008)
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<'CASH' | 'CREDIT_CARD' | 'CHECK' | 'FLEET_ACCOUNT'>('CREDIT_CARD');
  const [depositRef, setDepositRef] = useState('');

  // Override modal (Rule 8)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideAction, setOverrideAction] = useState('MANAGER_STAGE_OVERRIDE');
  const [overrideReason, setOverrideReason] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [targetStatus, setTargetStatus] = useState('DISPATCHED');

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRO = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await repairOrderApi.getRepairOrderById(id);
      setRo(res.data.repairOrder);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRO();
  }, [id]);

  const openDispatchModal = async () => {
    setDispatchModalOpen(true);
    setActionError(null);
    try {
      const res = await authApi.getUsers({ role: 'technician' });
      setTechnicians(res.data.users);
      if (res.data.users.length > 0) {
        setSelectedTechId(res.data.users[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedTechId) return;
    setActionError(null);
    setSubmitting(true);
    try {
      await repairOrderApi.dispatchTechnician(id, { technicianId: selectedTechId });
      setDispatchModalOpen(false);
      fetchRO();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to dispatch technician.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDepositModal = () => {
    const est = ro?.currentEstimate;
    const reqAmount = est?.depositRequired || (est ? est.grandTotal * 0.5 : 0);
    setDepositAmount(reqAmount.toFixed(2));
    setDepositModalOpen(true);
    setActionError(null);
  };

  const handleCollectDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActionError(null);
    setSubmitting(true);
    try {
      await depositApi.collectDeposit({
        repairOrderId: id,
        paidAmount: Number(depositAmount),
        paymentMethod: depositMethod,
        transactionReference: depositRef,
      });
      setDepositModalOpen(false);
      fetchRO();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to record deposit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    try {
      const res = await invoiceApi.createFromRO(id);
      alert(`Invoice #${res.data.invoice.invoiceNumber} created successfully (SW-011)!`);
      fetchRO();
    } catch (err: any) {
      alert(`Invoice generation stopped: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActionError(null);
    setSubmitting(true);
    try {
      await repairOrderApi.managerOverride(id, {
        action: overrideAction,
        reason: overrideReason,
        correctiveAction,
        targetStatus,
      });
      setOverrideModalOpen(false);
      fetchRO();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Manager override failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !ro) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Repair Order record...</div>;
  }

  const est = ro.currentEstimate;
  const isManager = hasRole('manager', 'admin');

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/repair-orders"
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
                {ro.roNumber}
              </span>
              <StatusBadge status={ro.status} size="sm" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mt-1">
              Repair Order #{ro.roNumber}
            </h1>
          </div>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex items-center space-x-2">
          {ro.status === 'DEPOSIT_REQUIRED' && (
            <button
              type="button"
              onClick={openDepositModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-md shadow-sm transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Collect 50% Deposit (SW-008)</span>
            </button>
          )}

          {(ro.status === 'AUTHORIZED' || ro.status === 'DEPOSIT_PAID') && (
            <button
              type="button"
              onClick={openDispatchModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Technician (SW-009)</span>
            </button>
          )}

          {ro.worksheet && (
            <Link
              to={`/worksheets/${typeof ro.worksheet === 'string' ? ro.worksheet : ro.worksheet._id}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-sm transition-colors"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Open Technician Worksheet</span>
            </Link>
          )}

          {ro.status === 'READY_FOR_INVOICE' && (
            <button
              type="button"
              onClick={handleGenerateInvoice}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-sm transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Generate Invoice (SW-011)</span>
            </button>
          )}

          {isManager && (
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setOverrideModalOpen(true);
              }}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-md transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Override</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Concern Alert if present */}
      {ro.hasSafetyConcerns && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-md text-sm text-red-800 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900">
              URGENT SAFETY ALERT: Vehicle Has Unresolved RED Safety Defects
            </h4>
            <p className="mt-0.5">
              SOP Mandatory Rule 5 Enforced: Vehicle release and delivery are strictly prohibited while RED inspection flags remain unresolved.
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Specs & Workflow State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Vehicle Info Panel */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500 block mb-1">
                Customer &amp; Contact
              </span>
              <div className="font-bold text-slate-900 text-sm">
                <Link to={`/customers/${ro.customer?._id}`} className="hover:underline">
                  {ro.customer?.name}
                </Link>
              </div>
              <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                <div>Phone: {ro.customer?.phone}</div>
                <div>Account: {ro.customer?.customerNumber}</div>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">
                Vehicle Identification &amp; Odometer
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {ro.vehicle?.year} {ro.vehicle?.make} {ro.vehicle?.model}
              </div>
              <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                <div>Plate: {ro.vehicle?.licensePlate} | VIN: {ro.vehicle?.vin}</div>
                <div>Odometer In: {Number(ro.mileageIn || 0).toLocaleString()} miles</div>
              </div>
            </div>
          </div>

          {/* Customer Complaint */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-2">
            <span className="text-xs text-slate-500 block">
              Customer Complaint / Primary Symptoms (SW-003)
            </span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 leading-relaxed font-sans">
              {ro.customerComplaint}
            </div>
          </div>

          {/* Financial Breakdown (Estimate & Deposit) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Financial Itemization &amp; Deposit Verification
                </h3>
              </div>
              {est && (
                <span className="text-sm font-bold text-indigo-800">
                  Estimate #{est.estimateNumber}
                </span>
              )}
            </div>

            {est ? (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border border-slate-200 rounded-md">
                    <thead className="bg-slate-100 text-xs text-slate-600">
                      <tr>
                        <th className="p-2">Type</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 text-center">Qty / Hrs</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {est.lineItems?.map((i: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-xs">
                            {i.itemType}
                          </td>
                          <td className="p-2 font-sans font-medium text-slate-800">
                            {i.description} {i.partNumber && `(${i.partNumber})`}
                          </td>
                          <td className="p-2 text-center">
                            {i.itemType === 'labor' ? i.laborHours : i.quantity}
                          </td>
                          <td className="p-2 text-right">${Number(i.sellingPrice || 0).toFixed(2)}</td>
                          <td className="p-2 text-right font-bold">${Number(i.subtotal || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-md border border-slate-200">
                  <div className="space-y-0.5">
                    <div>Parts: ${Number(est.partsTotal || 0).toFixed(2)} | Tires (+$20 Flat): ${Number(est.tiresTotal || 0).toFixed(2)}</div>
                    <div>Labor: ${Number(est.laborTotal || 0).toFixed(2)} | Supplies: ${Number(est.shopSupplies || 0).toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-indigo-950">
                      Grand Total: ${Number(est.grandTotal || 0).toFixed(2)}
                    </div>
                    {est.depositRequired > 0 && (
                      <div className="text-xs font-bold text-orange-800">
                        Deposit Required (50%): ${est.depositRequired.toFixed(2)} (SW-008)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No approved estimate linked yet.</p>
            )}

            {/* Deposit Status Callout */}
            {ro.deposit && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    50% Deposit of <span className="font-bold">${(ro.deposit as any).paidAmount?.toFixed(2)}</span> verified via {(ro.deposit as any).paymentMethod} (SW-008).
                  </span>
                </div>
                <span className="text-xs bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                  #{(ro.deposit as any).depositNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Timeline & Audit History */}
        <div className="space-y-6">
          {/* Assigned Personnel Panel */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Assigned Personnel
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service Writer:</span>
                <span className="font-bold text-slate-800">
                  {ro.serviceWriter?.name} ({ro.serviceWriter?.employeeId})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tech #1 (Primary):</span>
                <span className="font-bold text-slate-800">
                  {ro.assignedTechnician ? `${ro.assignedTechnician.name} (${ro.assignedTechnician.employeeId})` : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tech #2 (QC):</span>
                <span className="font-bold text-slate-800">
                  {ro.qcTechnician ? `${ro.qcTechnician.name} (${ro.qcTechnician.employeeId})` : 'Pending Assignment'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Audit Trail &amp; SOP Timeline</span>
              </h3>
            </div>

            <div className="space-y-3">
              {ro.timeline?.slice().reverse().map((event: any, idx: number) => (
                <div key={idx} className="relative pl-4 border-l-2 border-slate-200 space-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <StatusBadge status={event.status} size="sm" />
                    <span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-sans mt-0.5">{event.notes}</p>
                  <div className="text-xs text-slate-500">
                    By: {event.performedBy?.name || 'System'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technician Dispatch Modal (SW-009) */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Send className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Technician Dispatch (SW-009)
                </h3>
              </div>
              <button aria-label="Close"
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-700 space-y-1">
                <div className="font-bold">Backend SOP Verification Checks:</div>
                <div className="flex items-center space-x-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rule 1: Signed customer authorization present</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rule 2: Applicable 50% deposit verified if &gt; $500</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Assign Lead Technician (Tech #1) *
                </label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                >
                  {technicians.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.employeeId}) - {t.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                >
                  {submitting ? 'Verifying & Dispatching...' : 'Dispatch to Bay (SW-009)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Deposit Modal (SW-008) */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Collect 50% Deposit (SW-008)
                </h3>
              </div>
              <button aria-label="Close"
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectDeposit} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
                SOP SW-008 Requirement: Repair Orders exceeding $500.00 require a mandatory 50% deposit before work starts.
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Deposit Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-bold focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as any)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="CREDIT_CARD">Credit Card / pos Terminal</option>
                  <option value="CASH">Physical Cash</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CHECK">Corporate Check</option>
                  <option value="FLEET_ACCOUNT">Approved Commercial Fleet po</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Transaction / PO Reference
                </label>
                <input
                  type="text"
                  value={depositRef}
                  onChange={(e) => setDepositRef(e.target.value)}
                  placeholder="e.g. AUTH_98124 or PO-4902"
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                >
                  {submitting ? 'Recording Deposit...' : 'Record Deposit & Clear Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manager Override Modal (Rule 8 & Rule 9) */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Managerial Exception &amp; Override (Rule 8)
                </h3>
              </div>
              <button aria-label="Close"
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-900 space-y-1">
                <span className="font-bold">Mandatory Rules 7, 8 &amp; 9:</span>
                <p>No silent overrides. Every exception requires specific reason, manager identity, timestamp, and corrective action. Safety exceptions must NEVER bypass safe vehicle release.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Target Workflow State *
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="QC_APPROVED">QC approved</option>
                  <option value="READY_FOR_INVOICE">Ready for invoice</option>
                  <option value="RELEASED">Released (Requires zero safety flags)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Manager Override Reason (Mandatory) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Document specific business rationale for exception..."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Required Corrective Action *
                </label>
                <input
                  type="text"
                  required
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="e.g. Deposit verified via commercial net-30 fleet contract."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-sm transition-colors"
                >
                  {submitting ? 'Auditing...' : 'Execute Documented Override (Rule 8)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
