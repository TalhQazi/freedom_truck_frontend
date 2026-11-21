import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  CreditCard,
  Banknote,
  Calendar,
  Filter,
  FileSpreadsheet,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Download,
  Search,
  User,
  History,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { reportApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'financial' | 'audit' | 'operations'>('financial');
  const [loading, setLoading] = useState(true);

  // Financial State
  const [financialData, setFinancialData] = useState<any>({
    totalRevenue: 0,
    cashTotal: 0,
    cardTotal: 0,
    paymentsCount: 0,
    recentPayments: [],
  });
  const [dateRange, setDateRange] = useState('ALL');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTotal, setAuditTotal] = useState(0);

  // Operations Stats
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, dateRange, auditActionFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'financial') {
        const params: any = {};
        if (dateRange === 'TODAY') {
          const today = new Date().toISOString().split('T')[0];
          params.startDate = `${today}T00:00:00.000Z`;
          params.endDate = `${today}T23:59:59.999Z`;
        } else if (dateRange === 'WEEK') {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          params.startDate = d.toISOString();
        }
        const res = await reportApi.getFinancialSummary(params);
        setFinancialData(res.data);
      } else if (activeTab === 'audit') {
        const params: any = {};
        if (auditActionFilter) params.action = auditActionFilter;
        const res = await reportApi.getAuditTrail(params);
        setAuditLogs(res.data.data || []);
        setAuditTotal(res.data.pagination?.total || 0);
      } else if (activeTab === 'operations') {
        const res = await reportApi.getDashboardStats();
        setDashboardStats(res.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isManagement = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Operational & Financial Intelligence
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Real-time financial reconciliation, shop operations metrics, and regulatory audit trail.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 [&>button]:whitespace-nowrap">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'financial'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Financial Revenue
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'operations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Shop Operations
          </button>

          {isManagement && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" /> System Audit Trail
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: FINANCIAL REVENUE */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span>Total Collected Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ${Number(financialData.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-emerald-400/80 flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3" /> Fully settled transactions
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span>Cash Receipts (SW-015 Register)</span>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                ${Number(financialData.cashTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Requires daily cash-up drawer tie-out
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span>Electronic / Card Receipts</span>
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                ${Number(financialData.cardTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Direct merchant settlement
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span>Settled Payment Count</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {financialData.paymentsCount || 0}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Dual receipts generated (SW-013)
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Range:
              </span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Available History</option>
                <option value="TODAY">Today's Transactions</option>
                <option value="WEEK">Last 7 Days</option>
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Print / Export Ledger
            </button>
          </div>

          {/* Payment Transactions Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Settled Payment Ledger (SW-012 / SW-013)
              </h3>
              <span className="text-sm text-slate-500">
                {financialData.recentPayments?.length || 0} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                    <th className="py-3 px-3">Date / Time</th>
                    <th className="py-3 px-3">Receipt #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Auth / Ref #</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-3 text-center">Office Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        Loading financial transactions...
                      </td>
                    </tr>
                  ) : !financialData.recentPayments || financialData.recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No settled payments recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    financialData.recentPayments.map((p: any) => (
                      <tr key={p._id} className="hover:bg-indigo-50/50">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(p.processedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-indigo-600 whitespace-nowrap">
                          {p.receiptNumber || `REC-${p._id.slice(-6)}`}
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-medium">
                          {p.customer?.name || 'Walk-in Customer'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {p.referenceNumber || '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                          ${p.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {p.officeCopySigned ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> Signed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHOP OPERATIONS */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Current Repair Order Funnel
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Active Repair Orders</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {dashboardStats?.activeROs ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Vehicles in Service Bays</span>
                  <span className="font-bold text-indigo-600 text-sm">
                    {dashboardStats?.vehiclesUnderService ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Pending Technician Inspections</span>
                  <span className="font-bold text-amber-600 text-sm">
                    {dashboardStats?.pendingTechInspections ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Pending Independent QC</span>
                  <span className="font-bold text-purple-600 text-sm">
                    {dashboardStats?.pendingQCInspections ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Completed & Released Vehicles</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {dashboardStats?.completedROs ?? '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash & Accounts Receivable
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Unpaid Invoices Count</span>
                  <span className="font-bold text-amber-600 text-sm">
                    {dashboardStats?.unpaidInvoicesCount ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Total Unpaid Balance</span>
                  <span className="font-bold text-red-600 text-sm">
                    ${Number(dashboardStats?.unpaidInvoicesTotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Pending 50% Deposits (&gt;$500)</span>
                  <span className="font-bold text-yellow-600 text-sm">
                    {dashboardStats?.pendingDeposits ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Daily Cash-Up Status (SW-015)</span>
                  <span className="font-bold text-indigo-600 text-sm">
                    {dashboardStats?.todayCashUpStatus || 'NOT_SUBMITTED'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Drawer Closing Float Target</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    $100.00 Exact
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-purple-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Workshop Registry Counts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Total Customer Profiles (SW-001)</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {dashboardStats?.totalCustomers ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Total Registered Vehicles (SW-002)</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {dashboardStats?.totalVehicles ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-700">Pending Customer Authorizations</span>
                  <span className="font-bold text-amber-600 text-sm">
                    {dashboardStats?.pendingApprovals ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM AUDIT TRAIL */}
      {activeTab === 'audit' && isManagement && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Action Filter:
              </span>
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">User Logins</option>
                <option value="REPAIR_ORDER_STATUS_CHANGED">RO Status Changes</option>
                <option value="REPAIR_ORDER_OVERRIDE">Manager Overrides (Rule 8)</option>
                <option value="PAYMENT_PROCESSED">Payments</option>
                <option value="CASH_UP_SUBMITTED">Cash Up Submitted</option>
                <option value="TASK_STATUS_UPDATED">SOP Task Updates</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Immutable System Audit Logs ({auditTotal} Entries)
              </h3>
              <span className="text-sm text-slate-500">
                Rule 7 / Rule 8 Non-Repudiation
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Target Entity</th>
                    <th className="py-3 px-3">Audit Details / Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        No audit records match the criteria.
                      </td>
                    </tr>
                  ) : (
                    auditLogs
                      .filter((log) => {
                        const q = auditSearch.toLowerCase();
                        return (
                          !q ||
                          log.action?.toLowerCase().includes(q) ||
                          log.employeeName?.toLowerCase().includes(q) ||
                          log.employeeId?.toLowerCase().includes(q) ||
                          log.entityType?.toLowerCase().includes(q)
                        );
                      })
                      .map((log) => (
                        <tr key={log._id} className="hover:bg-indigo-50/50">
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-900 block">
                              {log.employeeName || 'System'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {log.employeeId || 'SYS-000'} ({log.userRole || 'system'})
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                log.action.includes('OVERRIDE')
                                  ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                  : log.action.includes('DELETE') || log.action.includes('REJECT')
                                  ? 'bg-red-50 border border-red-200 text-red-700'
                                  : 'bg-slate-50 border border-slate-200 text-indigo-700'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                            {log.entityType}
                            {log.entityId && (
                              <span className="text-xs text-slate-500 block">
                                {log.entityId.slice(-8)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-700 text-xs">
                            {log.details ? (
                              <pre className="inline-block max-w-md truncate text-slate-500">
                                {JSON.stringify(log.details)}
                              </pre>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { Reports };

