import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { reportApi, repairOrderApi } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { CountUp } from '../components/CountUp.js';
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
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  const role = user?.role;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text font-medium text-transparent">
              {user?.name?.split(' ')[0]}
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ClipboardList className="h-4 w-4 text-indigo-500" />
            My tasks
          </Link>
          {role === 'service_writer' && (
            <Link
              to="/repair-orders"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-700 hover:to-violet-700"
            >
              <Wrench className="h-4 w-4" />
              New repair order
            </Link>
          )}
        </div>
      </div>

      {/* ROLE 1 & 2: Administrator & Manager Dashboard */}
      {(role === 'admin' || role === 'manager') && (
        <div className="space-y-6">
          {/* Key Metric Grids */}
          <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-orange-400 to-amber-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Active Repair Orders</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600" aria-hidden="true">
                  <Wrench className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.activeROs || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats?.vehiclesUnderService || 0} currently under service in bay
              </div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-rose-400 to-pink-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Pending QC Queue</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600" aria-hidden="true">
                  <AlertTriangle className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.pendingQCInspections || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Awaiting independent Tech #2 inspection
              </div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-emerald-400 to-teal-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Today's Sales</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600" aria-hidden="true">
                  <DollarSign className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={Number(stats?.dailySales || 0)} decimals={2} prefix="$" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Processed receipts today
              </div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-sky-400 to-indigo-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Cash Reconciliation ($100)</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600" aria-hidden="true">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>
              <div className="text-lg font-bold text-slate-800 mt-2 flex items-center space-x-1.5">
                <StatusBadge status={stats?.todayCashUpStatus || 'NOT_SUBMITTED'} size="sm" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Variance: ${Number(stats?.todayCashUpDifference || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm flex justify-between items-center">
              <span className="text-slate-600">Total Customer Profiles:</span>
              <span className="font-bold text-slate-900">{stats?.totalCustomers || 0}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm flex justify-between items-center">
              <span className="text-slate-600">Registered Vehicles:</span>
              <span className="font-bold text-slate-900">{stats?.totalVehicles || 0}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm flex justify-between items-center">
              <span className="text-slate-600">Pending Customer Approvals:</span>
              <span className="font-bold text-amber-700">{stats?.pendingApprovals || 0}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm flex justify-between items-center">
              <span className="text-slate-600">Pending 50% Deposits:</span>
              <span className="font-bold text-orange-700">{stats?.pendingDeposits || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 3: Service Writer Dashboard */}
      {role === 'service_writer' && (
        <div className="space-y-6">
          <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-amber-400 to-yellow-300" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Customer Intake Queue</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700" aria-hidden="true">
                  <Clock className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.intakeArrivals || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Arrivals awaiting estimate</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-violet-400 to-fuchsia-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Pending Authorizations</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600" aria-hidden="true">
                  <FileCheck className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.pendingAuthorizations || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Estimates awaiting signature (SW-007)</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-emerald-400 to-teal-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Pending 50% Deposits</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600" aria-hidden="true">
                  <DollarSign className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.pendingDeposits || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Orders &gt; $500 awaiting deposit (SW-008)</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-emerald-400 to-teal-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Cleared for Invoice / Pickup</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600" aria-hidden="true">
                  <CheckCircle className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.completedAwaitingRelease || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">QC passed, ready for customer invoice</div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 4: Automotive Technician Dashboard */}
      {role === 'technician' && (
        <div className="space-y-6">
          <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-sky-400 to-indigo-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Assigned Bay Vehicles</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600" aria-hidden="true">
                  <Truck className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.assignedVehicles || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Dispatched work orders in your bay</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-indigo-400 to-violet-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Pending Inspections</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600" aria-hidden="true">
                  <ClipboardList className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.pendingInspections || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">TECH-002 Lighting &amp; TECH-004 Inspection</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-violet-400 to-fuchsia-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Pending Initial Signoffs</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600" aria-hidden="true">
                  <FileCheck className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.pendingWorksheets || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Requires Tech #1 signature (TECH-008)</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-rose-400 to-pink-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>QC Flags / Discrepancies</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600" aria-hidden="true">
                  <AlertTriangle className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.qcRelatedIssues || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Requires corrective action (TECH-010)</div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 5: Independent QC Technician Dashboard */}
      {role === 'qc_technician' && (
        <div className="space-y-6">
          <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-orange-400 to-amber-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Vehicles Awaiting QC</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600" aria-hidden="true">
                  <Wrench className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.vehiclesAwaitingQC || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Tech #1 signed, ready for independent audit</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-rose-400 to-pink-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>QC Discrepancy Queue</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600" aria-hidden="true">
                  <AlertTriangle className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.discrepanciesFlagged || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Stop-release active (TECH-010)</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-emerald-400 to-teal-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>QC Approved Today</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600" aria-hidden="true">
                  <CheckCircle className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.approvedToday || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Verified with Tech #2 signature</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-sky-400 to-indigo-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Mandatory Rule 4</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600" aria-hidden="true">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-2 text-emerald-700">
                Dual TECH active
              </div>
              <div className="text-xs text-slate-500 mt-1">Tech #1 != Tech #2 verified by backend</div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE 6: Office Assistant / Information Security Dashboard */}
      {role === 'office_assistant' && (
        <div className="space-y-6">
          <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-indigo-400 to-violet-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Computer Mod Requests</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600" aria-hidden="true">
                  <ClipboardList className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.modificationRequests || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">SOP OFF-005 Tickets filed</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-amber-400 to-yellow-300" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Pending Manager Review</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700" aria-hidden="true">
                  <Clock className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.pendingManagementApprovals || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Awaiting approval before install</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-rose-400 to-pink-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Open Security Incidents</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600" aria-hidden="true">
                  <AlertTriangle className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mt-2">
                <CountUp value={stats?.openSecurityIncidents || 0} />
              </div>
              <div className="text-xs text-slate-500 mt-1">SOP OFF-012 Reports</div>
            </div>

            <div className="card-hover relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-grow-x bg-gradient-to-r from-sky-400 to-indigo-400" aria-hidden="true" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Daily Security Walkthrough</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600" aria-hidden="true">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 mt-2">
                {stats?.todaySecurityChecklistSubmitted ? (
                  <span className="text-emerald-700 font-bold">Completed today</span>
                ) : (
                  <span className="text-amber-700 font-bold">Pending closing</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">SOP OFF-008 &amp; OFF-009</div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Workflow Board: Active Repair Orders Across Shop */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Recent repair orders</span>
            </h2>
            <p className="text-sm text-slate-500">Latest activity across the shop</p>
          </div>
          <Link
            to="/repair-orders"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">RO #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">Primary Complaint</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {activeROs.map((ro) => (
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
                      Plate: {ro.vehicle?.licensePlate} | VIN: {ro.vehicle?.vin?.slice(-6)}
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
                      className="inline-flex items-center px-2.5 py-1 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {activeROs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
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
