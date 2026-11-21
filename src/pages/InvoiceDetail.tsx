import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceApi, paymentApi } from '../api/client.js';
import { Invoice, Payment } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { SignatureModal } from '../components/SignatureModal.js';
import {
  Receipt,
  ArrowLeft,
  Printer,
  DollarSign,
  Download,
  CreditCard,
  CheckCircle,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment modal state (SW-012)
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'CREDIT_CARD' | 'CASH' | 'DEBIT_CARD' | 'CHECK' | 'FLEET_ACCOUNT'>('CREDIT_CARD');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  // Office receipt sign modal (SW-013)
  const [officeSignModalOpen, setOfficeSignModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await invoiceApi.getInvoiceById(id);
      setInvoice(res.data.invoice);
      setPayAmount(String(res.data.invoice.balanceDue || ''));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await paymentApi.processPayment({
        invoiceId: id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNumber: payRef,
        notes: payNotes,
      });
      setLastPayment(res.data.payment);
      setPayModalOpen(false);
      fetchInvoice();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOfficeReceipt = async (signatureDataUrl: string) => {
    if (!lastPayment) return;
    try {
      await paymentApi.signOfficeReceipt(lastPayment._id, {
        signature: signatureDataUrl,
      });
      alert('SW-013: Signed Office Copy successfully archived!');
      fetchInvoice();
    } catch (err: any) {
      alert(`Failed to save office signature: ${err.message}`);
    }
  };

  if (loading || !invoice) {
    return <div className="p-8 text-center text-xs font-mono text-slate-500">Loading invoice document...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <Link
            to="/invoices"
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                {invoice.invoiceNumber}
              </span>
              <StatusBadge status={invoice.status} size="sm" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Invoice #{invoice.invoiceNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {invoice.status !== 'PAID' && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setPayAmount(invoice.balanceDue.toFixed(2));
                setPayModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-sm transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Record Customer Payment (SW-012)</span>
            </button>
          )}

          <a
            href={invoiceApi.downloadPDFUrl(invoice._id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>PDF Download</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Document */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto print:border-none print:shadow-none">
        {/* Document Header Banner */}
        <div className="bg-brand-950 text-white p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider uppercase text-white font-sans">
                FREEDOM <span className="text-amber-500">CAR &amp; TRUCK</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-1 uppercase tracking-wider">
              Workshop Management Systems LLC
            </div>
            <div className="text-xs text-slate-400 mt-2 space-y-0.5">
              <div>1244 Freedom Industrial Blvd, Dallas, TX 75201</div>
              <div>Direct: (214) 555-0199 | service@freedomcartruck.com</div>
              <div className="text-[10px] font-mono text-slate-500">TX State Motor Facility License: TX-MV-849201-COMM</div>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-extrabold uppercase font-mono tracking-wider text-white">
              COMMERCIAL INVOICE
            </h2>
            <div className="text-sm font-mono font-bold text-amber-400 mt-1">
              #{invoice.invoiceNumber}
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1 space-y-0.5">
              <div>Date Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</div>
              <div>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</div>
              <div>Repair Order Ref: {invoice.repairOrder?.roNumber}</div>
            </div>
          </div>
        </div>

        {/* Bill To & Vehicle Grid */}
        <div className="p-6 grid grid-cols-2 gap-6 border-b border-slate-200 bg-slate-50/50 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              BILL TO CUSTOMER ACCOUNT:
            </span>
            <div className="font-bold text-slate-900 text-sm">{invoice.customer?.name}</div>
            <div className="text-slate-600 mt-1 space-y-0.5">
              <div>Phone: {invoice.customer?.phone}</div>
              <div>Email: {invoice.customer?.email || 'N/A'}</div>
              <div>
                {invoice.customer?.address?.street}, {invoice.customer?.address?.city} {invoice.customer?.address?.state} {invoice.customer?.address?.zip}
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              VEHICLE IDENTIFICATION &amp; REPAIR REF:
            </span>
            <div className="font-bold text-slate-900 text-sm">
              {invoice.vehicle?.year} {invoice.vehicle?.make} {invoice.vehicle?.model}
            </div>
            <div className="text-slate-600 mt-1 space-y-0.5 font-mono text-[11px]">
              <div>VIN: {invoice.vehicle?.vin}</div>
              <div>License Plate: {invoice.vehicle?.licensePlate}</div>
              <div>Mileage In: {Number(invoice.repairOrder?.mileageIn || 0).toLocaleString()} mi</div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="p-6 space-y-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-mono uppercase text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description / Part #</th>
                <th className="py-2.5 px-3 text-center w-20">Qty / Hrs</th>
                <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
                <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoice.lineItems?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 uppercase font-mono font-bold text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${item.itemType === 'tire' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'}`}>
                      {item.itemType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-900">{item.description}</span>
                    {item.partNumber && (
                      <span className="text-[10px] font-mono text-slate-500 block font-normal">
                        Part #: {item.partNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono">${Number(item.unitPrice || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ${Number(item.subtotal || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subtotal & Deposit Deductions Block */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-72 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Parts Total:</span>
                <span>${Number(invoice.partsTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tires Total (SW-005):</span>
                <span>${Number(invoice.tiresTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Labor Total:</span>
                <span>${Number(invoice.laborTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shop Supplies &amp; EPA:</span>
                <span>${Number(invoice.shopSupplies || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sales Tax (8.25%):</span>
                <span>${Number(invoice.taxAmount || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
                <span>Gross Invoice Total:</span>
                <span>${Number(invoice.totalAmount || 0).toFixed(2)}</span>
              </div>

              {/* Mandatory Deposit Deduction Credit (SW-008) */}
              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <span>Deposit Credit (SW-008):</span>
                <span>-${Number(invoice.depositCredit || 0).toFixed(2)}</span>
              </div>

              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-blue-700 font-semibold px-2">
                  <span>Additional Paid:</span>
                  <span>-${Number(invoice.amountPaid || 0).toFixed(2)}</span>
                </div>
              )}

              {/* Balance Due Highlight */}
              <div className="flex justify-between items-center text-sm font-extrabold text-blue-950 bg-blue-50 px-3 py-2 rounded border border-blue-200 mt-2">
                <span>TOTAL BALANCE DUE:</span>
                <span className="text-base">${Number(invoice.balanceDue || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Warranty Terms & SOP Compliance Notice */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 text-center leading-relaxed font-sans">
            Freedom Car &amp; Truck provides a 12-month / 12,000-mile limited warranty on qualifying mechanical repairs and parts. All parts installed were verified via company matrix markup (SW-004) or flat tire schedule (SW-005). All repairs inspected and signed under two-person lighting (TECH-002), lift safety (TECH-003), and dual independent technician quality control (TECH-009/011). Thank you for your business.
          </div>
        </div>
      </div>

      {/* SW-012: Payment Collection Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base tracking-wide uppercase text-white">
                  Record Customer Payment (SW-012)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-sm font-mono border border-slate-300 rounded px-3 py-2 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="CREDIT_CARD">Credit Card / Merchant Terminal</option>
                  <option value="CASH">Physical Cash (Drawer float reconciled SW-015)</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CHECK">Corporate Check</option>
                  <option value="FLEET_ACCOUNT">Approved Commercial Fleet Net-30</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reference / Approval Number
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. AUTH_998124 or Check #4810"
                  className="w-full text-xs border border-slate-300 rounded px-3 py-2 text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-sm transition-colors"
                >
                  {submitting ? 'Processing Payment...' : 'Record Payment & Issue Receipts (SW-012/013)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SW-013: Office Signed Receipt Modal */}
      {lastPayment && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase font-mono">
                Payment #{lastPayment.paymentNumber} Recorded (SW-012)
              </h4>
              <p className="text-xs text-emerald-800">
                Receipt #{lastPayment.receiptNumber} generated. Customer copy ready.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOfficeSignModalOpen(true)}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-2xs"
          >
            Capture Signed Office Copy (SW-013)
          </button>
        </div>
      )}

      <SignatureModal
        isOpen={officeSignModalOpen}
        onClose={() => setOfficeSignModalOpen(false)}
        onSave={handleSignOfficeReceipt}
        title="Capture Signed Office Receipt (SW-013)"
        subtitle={`Receipt #${lastPayment?.receiptNumber} | Amount: $${Number(lastPayment?.amount || 0).toFixed(2)}`}
        declarationText="I acknowledge receipt of the specified vehicle in good mechanical order. All repairs, replaced parts, and invoices have been inspected and accepted."
      />
    </div>
  );
};
