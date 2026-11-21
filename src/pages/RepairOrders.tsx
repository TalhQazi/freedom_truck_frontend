import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { repairOrderApi, customerApi, vehicleApi } from '../api/client.js';
import { RepairOrder, Customer, Vehicle } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  Wrench,
  Search,
  Plus,
  Truck,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';

export const RepairOrders: React.FC = () => {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // New RO Intake Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [mileageIn, setMileageIn] = useState('');
  const [customerComplaint, setCustomerComplaint] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRepairOrders = async () => {
    setLoading(true);
    try {
      const res = await repairOrderApi.getRepairOrders({
        status: statusFilter || undefined,
      });
      setRepairOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairOrders();
  }, [statusFilter]);

  const openIntakeModal = async () => {
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

  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedVehicleId || !mileageIn || !customerComplaint) {
      setError('Customer, Vehicle, Odometer Mileage, and Complaint are mandatory.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await repairOrderApi.createIntake({
        customer: selectedCustomerId,
        vehicle: selectedVehicleId,
        mileageIn: Number(mileageIn),
        customerComplaint,
      });
      setModalOpen(false);
      fetchRepairOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create intake RO.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredROs = repairOrders.filter((ro) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      ro.roNumber.toLowerCase().includes(term) ||
      ro.customer?.name?.toLowerCase().includes(term) ||
      ro.vehicle?.licensePlate?.toLowerCase().includes(term) ||
      ro.vehicle?.vin?.toLowerCase().includes(term) ||
      ro.assignedTechnician?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <span>Repair Orders (RO) &amp; Dispatch Queue</span>
          </h1>
          <p className="text-sm text-slate-500">
            SOP Workflow: Intake &rarr; Estimate &rarr; Authorization &rarr; Deposit &rarr; Dispatch &rarr; Dual QC &rarr; Invoicing
          </p>
        </div>

        <button
          type="button"
          onClick={openIntakeModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Vehicle Intake / Create RO</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by RO number, customer, vehicle plate, or technician..."
            className="w-full text-sm border border-slate-200 rounded-md pl-9 pr-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-2.5 py-2 bg-white text-slate-800 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Workflow Stages</option>
            <option value="INTAKE">Intake (Arrival)</option>
            <option value="AUTHORIZATION_PENDING">Authorization pending</option>
            <option value="DEPOSIT_REQUIRED">Deposit required (sw-008)</option>
            <option value="DISPATCHED">Dispatched (In Bay)</option>
            <option value="TECH1_SIGNED">TECH #1 signed</option>
            <option value="QC_PENDING">QC pending (Tech #2)</option>
            <option value="QC_APPROVED">QC approved</option>
            <option value="READY_FOR_INVOICE">Ready for invoice</option>
            <option value="INVOICED">Invoiced</option>
            <option value="PAID">Paid (Closed)</option>
          </select>
        </div>
      </div>

      {/* Repair Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">RO #</th>
                <th className="px-4 py-3">Customer Profile</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">Customer Complaint</th>
                <th className="px-4 py-3">Assigned Tech</th>
                <th className="px-4 py-3">Workflow Stage</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Loading repair orders...
                  </td>
                </tr>
              ) : filteredROs.map((ro) => (
                <tr key={ro._id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-indigo-700">
                    <Link to={`/repair-orders/${ro._id}`} className="hover:underline">
                      {ro.roNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {ro.customer?.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">
                      {ro.vehicle?.year} {ro.vehicle?.make} {ro.vehicle?.model}
                    </div>
                    <div className="text-xs text-slate-500">
                      Plate: {ro.vehicle?.licensePlate} | {Number(ro.mileageIn || 0).toLocaleString()} mi
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                    {ro.customerComplaint}
                  </td>
                  <td className="px-4 py-3">
                    {ro.assignedTechnician ? (
                      <span className="text-slate-800 text-xs">
                        {ro.assignedTechnician.name}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ro.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/repair-orders/${ro._id}`}
                      className="inline-flex items-center px-3 py-1 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <span>Manage RO</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && filteredROs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No repair orders found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Intake Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Wrench className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Customer Intake &amp; Vehicle Check-In (SW-001/002)
                </h3>
              </div>
              <button aria-label="Close"
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Customer Account *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="">-- Choose Customer Profile --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Select Vehicle *
                  </label>
                  <select
                    required
                    disabled={!selectedCustomerId}
                    value={selectedVehicleId}
                    onChange={(e) => {
                      setSelectedVehicleId(e.target.value);
                      const f = customerVehicles.find((v) => v._id === e.target.value);
                      if (f) setMileageIn(String(f.currentMileage || ''));
                    }}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {customerVehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.year} {v.make} {v.model} [{v.licensePlate}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Incoming Mileage (Odometer) *
                  </label>
                  <input
                    type="number"
                    required
                    value={mileageIn}
                    onChange={(e) => setMileageIn(e.target.value)}
                    placeholder="e.g. 54200"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Customer Complaint &amp; Stated Symptoms (SW-003) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={customerComplaint}
                  onChange={(e) => setCustomerComplaint(e.target.value)}
                  placeholder="Record customer complaint verbatim: e.g. Steering vibration at highway speed, replace steer tires, brake pulsation."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

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
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                >
                  {submitting ? 'Checking in...' : 'Complete Vehicle Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
