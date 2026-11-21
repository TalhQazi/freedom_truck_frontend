import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerApi, vehicleApi } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Truck,
  Wrench,
  FileSpreadsheet,
  Receipt,
  Plus,
  ArrowLeft,
  X,
  AlertCircle,
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  // New vehicle form state
  const [vin, setVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState('2023');
  const [make, setMake] = useState('Ford');
  const [model, setModel] = useState('F-250 Super Duty');
  const [currentMileage, setCurrentMileage] = useState('');
  const [color, setColor] = useState('');
  const [subModel, setSubModel] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await customerApi.getCustomerById(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSubmitting(true);
    try {
      await vehicleApi.createVehicle({
        customer: id,
        vin,
        licensePlate,
        year: Number(year),
        make,
        model,
        subModel,
        color,
        currentMileage: Number(currentMileage),
        unitNumber,
      });
      setVehicleModalOpen(false);
      setVin('');
      setLicensePlate('');
      setCurrentMileage('');
      fetchCustomer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading customer file...</div>;
  }

  const { customer, repairOrders = [], estimates = [], invoices = [] } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          to="/customers"
          className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              {customer.customerNumber}
            </span>
            <StatusBadge status={customer.status} size="sm" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">{customer.name}</h1>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-xs text-slate-400 block mb-1">
            Contact Information
          </span>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center space-x-2 font-semibold text-slate-900">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="text-xs text-slate-400 mt-1">
              Registered: {new Date(customer.registrationDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block mb-1">
            Billing Address
          </span>
          <div className="text-xs text-slate-700 leading-relaxed">
            {customer.address?.street ? (
              <>
                <p>{customer.address.street}</p>
                <p>
                  {customer.address.city}, {customer.address.state} {customer.address.zip}
                </p>
              </>
            ) : (
              <p className="text-slate-400">No billing address provided.</p>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block mb-1">
            Account Notes &amp; Fleet Preferences
          </span>
          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
            {customer.notes || 'No customer notes recorded.'}
          </div>
        </div>
      </div>

      {/* Registered Vehicles Section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-700" />
              <span>Registered Customer Vehicles ({customer.vehicles?.length || 0})</span>
            </h2>
            <p className="text-xs text-slate-500">Vehicles associated with this account (SW-002)</p>
          </div>
          <button
            type="button"
            onClick={() => setVehicleModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Vehicle (SW-002)</span>
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customer.vehicles?.map((v: any) => (
            <div key={v._id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {v.year} {v.make} {v.model}
                </span>
                <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-slate-300">
                  {v.licensePlate}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <div>VIN: {v.vin}</div>
                <div>Odometer: {Number(v.currentMileage || 0).toLocaleString()} mi</div>
                {v.unitNumber && <div>Unit / Fleet Tag: {v.unitNumber}</div>}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <Link
                  to={`/vehicles/${v._id}`}
                  className="font-semibold text-blue-700 hover:underline"
                >
                  View Vehicle History &rarr;
                </Link>
                <Link
                  to={`/repair-orders`}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Create RO
                </Link>
              </div>
            </div>
          ))}
          {(!customer.vehicles || customer.vehicles.length === 0) && (
            <div className="col-span-full py-6 text-center text-slate-400 text-xs">
              No vehicles registered to this customer account yet.
            </div>
          )}
        </div>
      </div>

      {/* Repair Order History */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-600" />
            <span>Repair Order History ({repairOrders.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-2.5">RO #</th>
                <th className="px-4 py-2.5">Vehicle</th>
                <th className="px-4 py-2.5">Customer Complaint</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {repairOrders.map((ro: any) => (
                <tr key={ro._id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold text-blue-700">
                    <Link to={`/repair-orders/${ro._id}`} className="hover:underline">
                      {ro.roNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    {ro.vehicle?.year} {ro.vehicle?.make} {ro.vehicle?.model} ({ro.vehicle?.licensePlate})
                  </td>
                  <td className="px-4 py-2.5 max-w-sm truncate text-slate-600">
                    {ro.customerComplaint}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={ro.status} size="sm" />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      to={`/repair-orders/${ro._id}`}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Open RO &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {repairOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">
                    No repair orders recorded for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Vehicle Modal (SW-002) */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Truck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Register Vehicle (SW-002)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVehicleModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    VIN (17 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={17}
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="1FT8W3BT9NEC..."
                    className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-semibold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    required
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    placeholder="TX-ABC-123"
                    className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-semibold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Make *</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Ford / Chevy"
                    className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="F-250 / Silverado"
                    className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Mileage (Odometer) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(e.target.value)}
                    placeholder="54200"
                    className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fleet Unit # (Optional)
                  </label>
                  <input
                    type="text"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="TRUCK-04"
                    className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                >
                  {submitting ? 'Registering...' : 'Complete Vehicle Registration (SW-002)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
