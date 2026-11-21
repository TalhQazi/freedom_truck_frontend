import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { estimateApi, customerApi, vehicleApi, authorizationApi } from '../api/client.js';
import { Estimate, Customer, Vehicle } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { SignatureModal } from '../components/SignatureModal.js';
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle,
  FileCheck,
  DollarSign,
  Trash2,
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calculator,
} from 'lucide-react';

export const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Customer & Vehicle select state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [mileageIn, setMileageIn] = useState('');
  const [customerComplaint, setCustomerComplaint] = useState('');

  // Line items state
  const [lineItems, setLineItems] = useState<any[]>([
    { itemType: 'labor', description: 'Diagnostic Scan & Safety Inspection', quantity: 1, costPrice: 0, sellingPrice: 145.0, laborHours: 1.0, laborRatePerHour: 145.0, subtotal: 145.0 },
  ]);

  // Authorization modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authorizingEstimate, setAuthorizingEstimate] = useState<Estimate | null>(null);
  const [signerName, setSignerName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const res = await estimateApi.getEstimates();
      setEstimates(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const openCreateModal = async () => {
    setModalOpen(true);
    try {
      const res = await customerApi.getCustomers({ limit: 100 });
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerChange = async (custId: string) => {
    setSelectedCustomerId(custId);
    setSelectedVehicleId('');
    if (!custId) {
      setCustomerVehicles([]);
      return;
    }
    try {
      const res = await customerApi.getCustomerById(custId);
      setCustomerVehicles(res.data.customer.vehicles || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVehicleChange = (vehId: string) => {
    setSelectedVehicleId(vehId);
    const found = customerVehicles.find((v) => v._id === vehId);
    if (found) {
      setMileageIn(String(found.currentMileage || ''));
    }
  };

  const addLineItem = (type: 'part' | 'tire' | 'labor') => {
    if (type === 'part') {
      setLineItems([
        ...lineItems,
        { itemType: 'part', description: '', partNumber: '', quantity: 1, costPrice: 50.0, sellingPrice: 80.0, subtotal: 80.0 },
      ]);
    } else if (type === 'tire') {
      setLineItems([
        ...lineItems,
        { itemType: 'tire', description: 'Commercial LT Tire', partNumber: '', quantity: 2, costPrice: 200.0, sellingPrice: 220.0, subtotal: 440.0 }, // Cost + $20 flat!
      ]);
    } else {
      setLineItems([
        ...lineItems,
        { itemType: 'labor', description: 'Mechanical Labor', quantity: 1, costPrice: 0, sellingPrice: 145.0, laborHours: 1.0, laborRatePerHour: 145.0, subtotal: 145.0 },
      ]);
    }
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    // Recompute selling price and subtotal
    const qty = Number(item.quantity) || 1;
    const cost = Number(item.costPrice) || 0;

    if (item.itemType === 'tire') {
      // SW-005: Cost + $20 flat markup per tire
      item.sellingPrice = Math.round((cost + 20.0) * 100) / 100;
      item.subtotal = Math.round(qty * item.sellingPrice * 100) / 100;
    } else if (item.itemType === 'part') {
      // SW-004 Tier preview
      let mult = 1.45;
      if (cost <= 25) mult = 2.0;
      else if (cost <= 50) mult = 1.8;
      else if (cost <= 100) mult = 1.6;
      else if (cost <= 300) mult = 1.45;
      else if (cost <= 1000) mult = 1.35;
      else mult = 1.25;

      item.sellingPrice = Math.round(cost * mult * 100) / 100;
      item.subtotal = Math.round(qty * item.sellingPrice * 100) / 100;
    } else if (item.itemType === 'labor') {
      const hours = Number(item.laborHours) || 0;
      const rate = Number(item.laborRatePerHour) || 145.0;
      item.subtotal = Math.round(hours * rate * 100) / 100;
      item.sellingPrice = rate;
    } else {
      item.subtotal = Math.round(qty * (Number(item.sellingPrice) || 0) * 100) / 100;
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const calculateGrandTotalPreview = () => {
    const subtotal = lineItems.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
    const labor = lineItems.filter((i) => i.itemType === 'labor').reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
    const supplies = Math.min(45.0, Math.round(labor * 0.07 * 100) / 100);
    const tax = Math.round((subtotal + supplies) * 0.0825 * 100) / 100;
    const grand = Math.round((subtotal + supplies + tax) * 100) / 100;
    const deposit = grand > 500 ? Math.round(grand * 0.5 * 100) / 100 : 0;
    return { subtotal, supplies, tax, grand, deposit };
  };

  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedVehicleId || !mileageIn || !customerComplaint) {
      setError('Customer, Vehicle, Odometer Mileage, and Complaint are mandatory (SW-003).');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await estimateApi.createEstimate({
        customer: selectedCustomerId,
        vehicle: selectedVehicleId,
        mileageIn: Number(mileageIn),
        customerComplaint,
        lineItems,
      });
      setModalOpen(false);
      fetchEstimates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create estimate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthorizeClick = (est: Estimate) => {
    setAuthorizingEstimate(est);
    setSignerName(est.customer?.name || '');
    setAuthModalOpen(true);
  };

  const handleSaveSignature = async (sigDataUrl: string) => {
    if (!authorizingEstimate) return;
    try {
      // First convert estimate to RO if needed or record authorization
      let roId = authorizingEstimate.repairOrder;
      if (!roId || typeof roId === 'string' === false) {
        // If estimate not yet converted, convert to RO first (SW-006)
        authorizingEstimate.status = 'APPROVED'; // ensure marked approved
        const convRes = await estimateApi.convertEstimateToRO(authorizingEstimate._id);
        roId = convRes.data.repairOrder._id;
      }

      await authorizationApi.createAuthorization({
        repairOrderId: roId,
        estimateId: authorizingEstimate._id,
        customerSignature: sigDataUrl,
        customerSignerName: signerName || authorizingEstimate.customer?.name,
        authorizedTotal: authorizingEstimate.grandTotal,
        authorizationType: 'INITIAL',
      });

      alert(`Customer authorization successfully captured for Estimate #${authorizingEstimate.estimateNumber} (SW-007)!`);
      fetchEstimates();
    } catch (err: any) {
      alert(`Authorization failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleConvertToRO = async (est: Estimate) => {
    if (est.status !== 'APPROVED') {
      alert('SOP SW-006: You must capture customer signed authorization before converting to Repair Order.');
      return;
    }
    try {
      const res = await estimateApi.convertEstimateToRO(est._id);
      alert(`Repair Order #${res.data.repairOrder.roNumber} created from Estimate (SW-006)!`);
      fetchEstimates();
    } catch (err: any) {
      alert(`Error converting: ${err.response?.data?.message || err.message}`);
    }
  };

  const totals = calculateGrandTotalPreview();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-700" />
            <span>Estimates &amp; Customer Authorizations</span>
          </h1>
          <p className="text-sm text-slate-500">
            SOP SW-003, SW-004 (Parts Matrix), SW-005 (Tire +$20 Flat), SW-007 (Authorization), SW-008 (50% Deposit)
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Itemized Estimate (SW-003)</span>
        </button>
      </div>

      {/* Estimates Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">Estimate #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Primary Complaint</th>
                <th className="px-4 py-3">Estimate Total</th>
                <th className="px-4 py-3">50% Deposit Rule (SW-008)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Loading estimates...
                  </td>
                </tr>
              ) : estimates.map((est) => (
                <tr key={est._id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-indigo-700">
                    {est.estimateNumber}
                    <span className="text-xs text-slate-500 block font-normal">v{est.version}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {est.customer?.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">
                      {est.vehicle?.year} {est.vehicle?.make} {est.vehicle?.model}
                    </div>
                    <div className="text-xs text-slate-500">
                      {est.vehicle?.licensePlate} ({Number(est.mileageIn || 0).toLocaleString()} mi)
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                    {est.customerComplaint}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ${Number(est.grandTotal || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {est.depositRequired > 0 ? (
                      <div className="text-sm font-semibold text-orange-800">
                        ${est.depositRequired.toFixed(2)} (50%)
                        <span className="block text-xs text-slate-500">
                          {est.depositMet ? 'Deposit verified' : 'Required before dispatch'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">Under $500 threshold</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={est.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    {est.status === 'PENDING_APPROVAL' && (
                      <button
                        type="button"
                        onClick={() => handleAuthorizeClick(est)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Sign (SW-007)</span>
                      </button>
                    )}
                    {est.status === 'APPROVED' && !est.repairOrder && (
                      <button
                        type="button"
                        onClick={() => handleConvertToRO(est)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
                      >
                        <span>Convert to RO (SW-006)</span>
                      </button>
                    )}
                    {est.repairOrder && (
                      <span className="text-xs text-indigo-700 font-bold">
                        Linked to RO
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && estimates.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No estimates created yet. Click "New Itemized Estimate" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Estimate Modal (SW-003, SW-004, SW-005) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-4xl my-8 overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    New Itemized Estimate (SW-003)
                  </h3>
                  <p className="text-sm text-slate-700">
                    Enforcing SW-004 (Parts Matrix Markup) &amp; SW-005 (Tire +$20 Flat)
                  </p>
                </div>
              </div>
              <button aria-label="Close"
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEstimate} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Customer & Vehicle Select */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Select Customer Profile *
                  </label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Select Vehicle *
                  </label>
                  <select
                    required
                    disabled={!selectedCustomerId}
                    value={selectedVehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">-- Choose Registered Vehicle --</option>
                    {customerVehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.year} {v.make} {v.model} [{v.licensePlate}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Odometer In (Mileage) *
                  </label>
                  <input
                    type="number"
                    required
                    value={mileageIn}
                    onChange={(e) => setMileageIn(e.target.value)}
                    placeholder="e.g. 54280"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Complaint */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Customer Complaint &amp; Requested Symptoms (SW-003) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerComplaint}
                  onChange={(e) => setCustomerComplaint(e.target.value)}
                  placeholder="Verbatim customer complaint: e.g., Brake squeal, steering pull right under heavy braking, check engine lamp."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              {/* Line Items Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Itemized Services, Parts &amp; Tires
                    </h4>
                    <p className="text-xs text-slate-500">
                      Parts apply company markup matrix (SW-004). Tires apply cost + $20 flat markup (SW-005).
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => addLineItem('part')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md text-xs font-semibold text-slate-700"
                    >
                      + Add Part (SW-004)
                    </button>
                    <button
                      type="button"
                      onClick={() => addLineItem('tire')}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md text-xs font-bold text-amber-900"
                    >
                      + Add Tire (+$20 Flat)
                    </button>
                    <button
                      type="button"
                      onClick={() => addLineItem('labor')}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 rounded-md text-xs font-bold text-indigo-700"
                    >
                      + Add Labor ($145/hr)
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Type</th>
                        <th className="p-2">Description / Part #</th>
                        <th className="p-2 w-16">Qty / Hrs</th>
                        <th className="p-2 w-24">Cost ($)</th>
                        <th className="p-2 w-28">Selling ($)</th>
                        <th className="p-2 w-24 text-right">Subtotal</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/50">
                          <td className="p-2 text-xs">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              item.itemType === 'tire' ? 'bg-amber-100 text-amber-900' : item.itemType === 'part' ? 'bg-slate-200 text-slate-800' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {item.itemType}
                            </span>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                              placeholder={item.itemType === 'tire' ? 'e.g. Michelin Agilis 275/70R18' : 'Description'}
                              className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-900 focus:outline-none"
                            />
                            {item.itemType === 'part' && (
                              <input
                                type="text"
                                value={item.partNumber || ''}
                                onChange={(e) => updateLineItem(idx, 'partNumber', e.target.value)}
                                placeholder="Part # (e.g. BRRF-214)"
                                className="w-full text-xs border border-slate-100 rounded-md px-2 py-0.5 text-slate-600 mt-1 focus:outline-none"
                              />
                            )}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={item.itemType === 'labor' ? item.laborHours : item.quantity}
                              onChange={(e) =>
                                updateLineItem(
                                  idx,
                                  item.itemType === 'labor' ? 'laborHours' : 'quantity',
                                  e.target.value
                                )
                              }
                              className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-900"
                            />
                          </td>
                          <td className="p-2">
                            {item.itemType !== 'labor' ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.costPrice}
                                onChange={(e) => updateLineItem(idx, 'costPrice', e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-900"
                              />
                            ) : (
                              <span className="text-slate-500 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="text-sm font-semibold text-slate-900">
                              ${Number(item.sellingPrice || 0).toFixed(2)}
                            </div>
                            {item.itemType === 'tire' && (
                              <span className="text-xs text-amber-700 block">+ $20.00 flat</span>
                            )}
                            {item.itemType === 'part' && (
                              <span className="text-xs text-indigo-700 block">Matrix tier</span>
                            )}
                          </td>
                          <td className="p-2 font-bold text-right text-slate-900">
                            ${Number(item.subtotal || 0).toFixed(2)}
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              className="text-slate-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary (Section 11) */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-sm text-slate-600">
                  <div>Parts/Tires/Labor Subtotal: <span className="font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span></div>
                  <div>Shop Supplies &amp; EPA: <span className="font-semibold text-slate-900">${totals.supplies.toFixed(2)}</span></div>
                  <div>Sales Tax (8.25%): <span className="font-semibold text-slate-900">${totals.tax.toFixed(2)}</span></div>
                </div>

                <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-6 space-y-1">
                  <div className="text-xs text-slate-500">Estimate Total</div>
                  <div className="text-2xl font-semibold text-indigo-700">
                    ${totals.grand.toFixed(2)}
                  </div>
                  {totals.deposit > 0 ? (
                    <div className="text-sm font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                      Mandatory 50% Deposit: ${totals.deposit.toFixed(2)} (SW-008)
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      No deposit required (total &lt; $500)
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                >
                  {submitting ? 'Creating Estimate...' : 'Save Estimate (SW-003)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Signature Pad Modal (SW-007) */}
      <SignatureModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSave={handleSaveSignature}
        title="Customer Work Authorization (SOP SW-007)"
        subtitle={`Estimate #${authorizingEstimate?.estimateNumber} | Total: $${Number(authorizingEstimate?.grandTotal || 0).toFixed(2)}`}
        declarationText={`I hereby authorize Freedom Car & Truck to perform the diagnostic, parts replacement, and repair services specified on Estimate #${authorizingEstimate?.estimateNumber}. I understand that if total work exceeds $500.00, a mandatory 50% deposit must be settled prior to technician dispatch under company operating procedures. Additional work will require separate authorization.`}
      />
    </div>
  );
};
