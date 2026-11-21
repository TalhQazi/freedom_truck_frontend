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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-700" />
            <span>Vehicle Registry &amp; Fleet Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            SOP SW-002: Mandatory registration of VIN, license plate, year, make, model &amp; mileage
          </p>
        </div>

        <Link
          to="/customers"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle for Customer</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by license plate, full VIN, make, model, or fleet unit number..."
            className="w-full text-xs border border-slate-200 rounded pl-9 pr-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-mono uppercase text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">License Plate</th>
                <th className="px-4 py-3">Vehicle Description</th>
                <th className="px-4 py-3">17-Digit VIN</th>
                <th className="px-4 py-3">Customer / Fleet</th>
                <th className="px-4 py-3">Odometer</th>
                <th className="px-4 py-3">Outstanding Issues</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs font-mono">
                    Searching vehicle registry...
                  </td>
                </tr>
              ) : vehicles.map((v: any) => (
                <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {v.licensePlate}
                    </span>
                    {v.unitNumber && (
                      <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                        Unit: {v.unitNumber}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">
                      {v.year} {v.make} {v.model}
                    </div>
                    {v.subModel && (
                      <div className="text-[11px] text-slate-500">{v.subModel}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-800 tracking-wider">
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
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    {Number(v.currentMileage || 0).toLocaleString()} mi
                  </td>
                  <td className="px-4 py-3">
                    {v.outstandingIssues && v.outstandingIssues.length > 0 ? (
                      <div className="flex items-center space-x-1 text-amber-700 font-medium text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-xs">{v.outstandingIssues.join(', ')}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">None flagged</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/vehicles/${v._id}`}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <span>History</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && vehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
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
