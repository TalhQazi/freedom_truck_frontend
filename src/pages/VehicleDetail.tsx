import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vehicleApi } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  Truck,
  ArrowLeft,
  Wrench,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  User,
  Plus,
} from 'lucide-react';

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchVehicle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await vehicleApi.getVehicleById(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading vehicle service record...</div>;
  }

  const { vehicle, repairOrders = [], worksheets = [] } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/vehicles"
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {vehicle.licensePlate}
              </span>
              {vehicle.unitNumber && (
                <span className="text-xs text-slate-600 font-semibold">
                  Unit: {vehicle.unitNumber}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mt-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
          </div>
        </div>

        <Link
          to={`/repair-orders`}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Intake Vehicle for Service (RO)</span>
        </Link>
      </div>

      {/* Vehicle Specification Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-slate-400 block mb-1">
            VIN (Vehicle Identification #)
          </span>
          <div className="text-xs font-bold text-slate-900">
            {vehicle.vin}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Color: {vehicle.color || 'Unspecified'}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block mb-1">
            Engine &amp; Sub-Model
          </span>
          <div className="text-xs font-semibold text-slate-800">
            {vehicle.engine || 'Standard Factory Spec'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{vehicle.subModel}</div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block mb-1">
            Odometer Tracking
          </span>
          <div className="text-sm font-bold text-slate-900">
            {Number(vehicle.currentMileage || 0).toLocaleString()} miles
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Previous: {Number(vehicle.previousMileage || vehicle.currentMileage).toLocaleString()} mi
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block mb-1">
            Registered Account Owner
          </span>
          <div className="text-xs font-bold text-blue-700">
            {vehicle.customer?.name ? (
              <Link to={`/customers/${vehicle.customer._id}`} className="hover:underline">
                {vehicle.customer.name}
              </Link>
            ) : (
              'N/A'
            )}
          </div>
          <div className="text-xs text-slate-500">{vehicle.customer?.phone}</div>
        </div>
      </div>

      {/* Outstanding Issues Callout */}
      {vehicle.outstandingIssues && vehicle.outstandingIssues.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-amber-900">
              Outstanding Vehicle Concerns &amp; Recommendations
            </h3>
            <ul className="mt-1 list-disc list-inside text-xs text-amber-800 space-y-0.5">
              {vehicle.outstandingIssues.map((issue: string, idx: number) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Repair Orders & Service History */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-600" />
            <span>Complete Repair Order History ({repairOrders.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-2.5">RO #</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Odometer In</th>
                <th className="px-4 py-2.5">Customer Complaint</th>
                <th className="px-4 py-2.5">Service Writer</th>
                <th className="px-4 py-2.5">Technician</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
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
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    {new Date(ro.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 text-slate-800">
                    {Number(ro.mileageIn || 0).toLocaleString()} mi
                  </td>
                  <td className="px-4 py-2.5 max-w-xs truncate text-slate-600">
                    {ro.customerComplaint}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {ro.serviceWriter?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {ro.assignedTechnician?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={ro.status} size="sm" />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      to={`/repair-orders/${ro._id}`}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Open &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {repairOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400 text-xs">
                    No past service history recorded for this vehicle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
