import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { technicianApi } from '../api/client.js';
import { TechnicianWorksheet } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const TechnicianWorksheets: React.FC = () => {
  const [worksheets, setWorksheets] = useState<TechnicianWorksheet[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorksheets = async () => {
    setLoading(true);
    try {
      const res = await technicianApi.getWorksheets({
        status: statusFilter || undefined,
      });
      setWorksheets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksheets();
  }, [statusFilter]);

  const filteredWorksheets = worksheets.filter((ws) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const roNum = typeof ws.repairOrder === 'object' ? ws.repairOrder.roNumber : '';
    return (
      ws.worksheetNumber.toLowerCase().includes(term) ||
      roNum.toLowerCase().includes(term) ||
      ws.customer?.name?.toLowerCase().includes(term) ||
      ws.vehicle?.licensePlate?.toLowerCase().includes(term) ||
      ws.initialSignoff?.employeeId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-teal-700" />
            <span>Technician Worksheets &amp; Dual QC Inspection Hub</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Mandatory SOPs: TECH-001 through TECH-013 &amp; SW-010 Final Verification
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-700 bg-white border border-slate-300 rounded px-3 py-1.5 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Rule 4 Dual Technician Verification Enforced</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by worksheet #, RO #, customer, plate, or technician ID..."
            className="w-full text-xs border border-slate-200 rounded pl-9 pr-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2.5 py-2 bg-white text-slate-800 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Inspection Stages</option>
            <option value="IN_PROGRESS">IN PROGRESS (Bay Work)</option>
            <option value="TECH1_COMPLETE">TECH #1 COMPLETE (Awaiting QC)</option>
            <option value="QC_DISCREPANCY">QC DISCREPANCY (Stop Release)</option>
            <option value="QC_PASSED">QC PASSED (Dual Verified)</option>
            <option value="RELEASE_READY">RELEASE READY (SW-010)</option>
          </select>
        </div>
      </div>

      {/* Worksheets Grid */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-mono uppercase text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">Worksheet #</th>
                <th className="px-4 py-3">Repair Order</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">TECH-002 Lighting</th>
                <th className="px-4 py-3">TECH #1 Signoff</th>
                <th className="px-4 py-3">TECH #2 QC Signoff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Inspection Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs font-mono">
                    Loading technician worksheets...
                  </td>
                </tr>
              ) : filteredWorksheets.map((ws) => {
                const roNumber = typeof ws.repairOrder === 'object' ? ws.repairOrder.roNumber : 'RO Ref';
                return (
                  <tr key={ws._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-teal-900">
                      <Link to={`/worksheets/${ws._id}`} className="hover:underline">
                        {ws.worksheetNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-blue-900">
                      {typeof ws.repairOrder === 'object' ? (
                        <Link to={`/repair-orders/${ws.repairOrder._id}`} className="hover:underline">
                          {roNumber}
                        </Link>
                      ) : (
                        roNumber
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {ws.vehicle?.year} {ws.vehicle?.make} {ws.vehicle?.model}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {ws.vehicle?.licensePlate} ({Number(ws.recordedMileage || 0).toLocaleString()} mi)
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ws.lightingInspection?.performed ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-mono text-[11px] font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>2-Person Checked</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 font-mono text-[11px]">Pending (TECH-002)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {ws.initialSignoff?.signature ? (
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{ws.initialSignoff.employeeId}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unsigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {ws.qcInspection?.signature ? (
                        <span className="text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ws.qcInspection.employeeId} (Tech #2)</span>
                        </span>
                      ) : ws.qcInspection?.discrepanciesFound ? (
                        <span className="text-red-700 font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Discrepancy</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending QC</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ws.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/worksheets/${ws._id}`}
                        className="inline-flex items-center px-3 py-1 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors shadow-2xs"
                      >
                        <span>Open Sheet</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredWorksheets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No worksheets found matching filter.
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
