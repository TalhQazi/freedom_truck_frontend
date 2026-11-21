import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { reportApi, repairOrderApi } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  Wrench,
  Users,
  Truck,
  FileCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Activity,
  ArrowRight,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activeROs, setActiveROs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, roRes] = await Promise.all([
          reportApi.getDashboardStats(),
          repairOrderApi.getRepairOrders({ limit: 8 }),
        ]);
        setStats(statsRes.data.stats);
        setActiveROs(roRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-mono text-sm">
        <Activity className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Loading operational metrics from MongoDB...</span>
      </div>
    );
  }

  const role = user?.role;

  return (
    <div className="space-y-6">
      {/* Top Banner with Employee & Department Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {role?.replace('_', ' ')} OPERATIONAL CONSOLE
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {user?.employeeId}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department: <span className="font-semibold text-slate-700">{user?.department}</span> | Standard Operating Procedures (SOPs) Active
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-slate-600" />
            <span>My SOP Checklist</span>
          </Link>
          {role === 'service_writer' && (
            <Link
              to="/repair-orders"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-sm transition-colors"
            >
              <Wrench className="w-4 h-4" />
              <span>Customer Intake / New RO</span>
            </Link>
          )}
        </div>
      </div>

      {/* ROLE 1 & 2: Administrator & Manager Dashboard */}
      {(role === 'admin' || role === 'manager') && (
        <div className="space-y-6">
          {/* Key Metric Grids */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Active Repair Orders</span>
                <Wrench className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                {stats?.activeROs || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {stats?.vehiclesUnderService || 0} currently under service in bay
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Pending QC Queue</span>
                <AlertTriangle className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-extrabold text-violet-900 mt-2 font-mono">
                {stats?.pendingQCInspections || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Awaiting independent Tech #2 inspection
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Today's Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-800 mt-2 font-mono">
                ${Number(stats?.dailySales || 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Processed receipts today
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Cash Reconciliation ($100)</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mt-2 font-mono flex items-center space-x-1.5">
                <StatusBadge status={stats?.todayCashUpStatus || 'NOT_SUBMITTED'} size="sm" />
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Variance: ${Number(stats?.todayCashUpDifference || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs flex justify-between items-center">
              <span className="text-slate-600">Total Customer Profiles:</span>
              <span className="font-bold font-mono text-slate-900">{stats?.totalCustomers || 0}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs flex justify-between items-center">
              <span className="text-slate-600">Registered Vehicles:</span>
              <span className="font-bold font-mono text-slate-900">{stats?.totalVehicles || 0}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs flex justify-between items-center">
              <span className="text-slate-600">Pending Customer Approvals:</span>
              <span className="font-bold font-mono text-amber-700">{stats?.pendingApprovals || 0}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs flex justify-between items-center">
              <span className="text-slate-600">Pending 50% Deposits:</span>
              <span className="font-bold font-mono text-orange-700">{stats?.pendingDeposits || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 3: Service Writer Dashboard */}
      {role === 'service_writer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Customer Intake Queue</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                {stats?.intakeArrivals || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Arrivals awaiting estimate</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Pending Authorizations</span>
                <FileCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-800 mt-2 font-mono">
                {stats?.pendingAuthorizations || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Estimates awaiting signature (SW-007)</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Pending 50% Deposits</span>
                <DollarSign className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-extrabold text-orange-800 mt-2 font-mono">
                {stats?.pendingDeposits || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Orders &gt; $500 awaiting deposit (SW-008)</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Cleared for Invoice / Pickup</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-800 mt-2 font-mono">
                {stats?.completedAwaitingRelease || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">QC passed, ready for customer invoice</div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 4: Automotive Technician Dashboard */}
      {role === 'technician' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Assigned Bay Vehicles</span>
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                {stats?.assignedVehicles || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Dispatched work orders in your bay</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Pending Inspections</span>
                <ClipboardList className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-800 mt-2 font-mono">
                {stats?.pendingInspections || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">TECH-002 Lighting &amp; TECH-004 Inspection</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Pending Initial Signoffs</span>
                <FileCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-purple-800 mt-2 font-mono">
                {stats?.pendingWorksheets || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Requires Tech #1 signature (TECH-008)</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>QC Flags / Discrepancies</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-extrabold text-red-700 mt-2 font-mono">
                {stats?.qcRelatedIssues || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Requires corrective action (TECH-010)</div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 5: Independent QC Technician Dashboard */}
      {role === 'qc_technician' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Vehicles Awaiting QC</span>
                <Wrench className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-2xl font-extrabold text-violet-900 mt-2 font-mono">
                {stats?.vehiclesAwaitingQC || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Tech #1 signed, ready for independent audit</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>QC Discrepancy Queue</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-extrabold text-red-800 mt-2 font-mono">
                {stats?.discrepanciesFlagged || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Stop-release active (TECH-010)</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>QC Approved Today</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-800 mt-2 font-mono">
                {stats?.approvedToday || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Verified with Tech #2 signature</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Mandatory Rule 4</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm font-bold text-slate-900 mt-2 font-mono text-emerald-700">
                DUAL TECH ACTIVE
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Tech #1 != Tech #2 verified by backend</div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 6: Office Assistant / Information Security Dashboard */}
      {role === 'office_assistant' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Computer Mod Requests</span>
                <ClipboardList className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                {stats?.modificationRequests || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">SOP OFF-005 Tickets filed</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Pending Manager Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-800 mt-2 font-mono">
                {stats?.pendingManagementApprovals || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Awaiting approval before install</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Open Security Incidents</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-extrabold text-red-800 mt-2 font-mono">
                {stats?.openSecurityIncidents || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">SOP OFF-012 Reports</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-500">
                <span>Daily Security Walkthrough</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 mt-2 font-mono">
                {stats?.todaySecurityChecklistSubmitted ? (
                  <span className="text-emerald-700 font-bold">COMPLETED TODAY</span>
                ) : (
                  <span className="text-amber-700 font-bold">PENDING CLOSING</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">SOP OFF-008 &amp; OFF-009</div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Workflow Board: Active Repair Orders Across Shop */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Active Workshop Repair Orders</span>
            </h2>
            <p className="text-xs text-slate-500">Live operational lifecycle from intake through final release</p>
          </div>
          <Link
            to="/repair-orders"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
          >
            <span>View All Repair Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-mono uppercase text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">RO #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">Primary Complaint</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {activeROs.map((ro) => (
                <tr key={ro._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-900">
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
                    <div className="text-[11px] font-mono text-slate-400">
                      Plate: {ro.vehicle?.licensePlate} | VIN: {ro.vehicle?.vin?.slice(-6)}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                    {ro.customerComplaint}
                  </td>
                  <td className="px-4 py-3">
                    {ro.assignedTechnician ? (
                      <span className="font-mono text-slate-800 text-[11px]">
                        {ro.assignedTechnician.name}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-amber-600 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ro.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/repair-orders/${ro._id}`}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {activeROs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No active repair orders in the system.
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
