import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehicleApi } from '../api/client.js';
import { Vehicle } from '../types/index.js';
import { Truck, Search, Plus, Wrench, AlertTriangle, ArrowRight } from 'lucide-react';

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.getVehicles({ search });
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-700" />
            <span>Vehicle Registry &amp; Fleet Inventory</span>
          </h1>
          <p className="text-sm text-slate-500">
            SOP SW-002: Mandatory registration of VIN, license plate, year, make, model &amp; mileage
          </p>
        </div>

        <Link
          to="/customers"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle for Customer</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by license plate, full VIN, make, model, or fleet unit number..."
            className="w-full text-sm border border-slate-200 rounded-md pl-9 pr-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">License Plate</th>
                <th className="px-4 py-3">Vehicle Description</th>
                <th className="px-4 py-3">17-Digit VIN</th>
                <th className="px-4 py-3">Customer / Fleet</th>
                <th className="px-4 py-3">Odometer</th>
                <th className="px-4 py-3">Outstanding Issues</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Searching vehicle registry...
                  </td>
                </tr>
              ) : vehicles.map((v: any) => (
                <tr key={v._id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {v.licensePlate}
                    </span>
                    {v.unitNumber && (
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Unit: {v.unitNumber}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">
                      {v.year} {v.make} {v.model}
                    </div>
                    {v.subModel && (
                      <div className="text-xs text-slate-500">{v.subModel}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-800">
                    {v.vin}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {v.customer?.name ? (
                      <Link to={`/customers/${v.customer._id}`} className="hover:underline">
                        {v.customer.name}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {Number(v.currentMileage || 0).toLocaleString()} mi
                  </td>
                  <td className="px-4 py-3">
                    {v.outstandingIssues && v.outstandingIssues.length > 0 ? (
                      <div className="flex items-center space-x-1 text-amber-700 font-medium text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-xs">{v.outstandingIssues.join(', ')}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">None flagged</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/vehicles/${v._id}`}
                      className="inline-flex items-center px-2.5 py-1 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <span>History</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && vehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No vehicles found in registry.
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
