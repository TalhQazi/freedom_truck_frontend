import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceApi } from '../api/client.js';
import { Invoice } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Receipt, Search, Filter, DollarSign, Download, Eye } from 'lucide-react';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.getInvoices({
        status: statusFilter || undefined,
      });
      setInvoices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const filtered = invoices.filter((inv) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.customer?.name?.toLowerCase().includes(term) ||
      inv.vehicle?.licensePlate?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <span>Commercial Invoices &amp; Billing</span>
          </h1>
          <p className="text-sm text-slate-500">
            SOP SW-011: Itemized invoices with automatic 50% deposit credit deductions (SW-008)
          </p>
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
            placeholder="Search by invoice number, customer name, license plate..."
            className="w-full text-sm border border-slate-200 rounded-md pl-9 pr-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-2.5 py-2 bg-white text-slate-800 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Billing Statuses</option>
            <option value="ISSUED">Issued (Balance Due)</option>
            <option value="PARTIALLY_PAID">Partially paid</option>
            <option value="PAID">Paid (Settled)</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Issued Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">Gross Total</th>
                <th className="px-4 py-3">Deposit Credit (SW-008)</th>
                <th className="px-4 py-3">Balance Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Loading commercial invoices...
                  </td>
                </tr>
              ) : filtered.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-blue-700">
                    <Link to={`/invoices/${inv._id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(inv.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {inv.customer?.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">
                      {inv.vehicle?.year} {inv.vehicle?.make} {inv.vehicle?.model}
                    </div>
                    <div className="text-xs text-slate-500">
                      {inv.vehicle?.licensePlate}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ${Number(inv.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">
                    {inv.depositCredit > 0 ? `-$${Number(inv.depositCredit).toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-950">
                    ${Number(inv.balanceDue || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    <Link
                      to={`/invoices/${inv._id}`}
                      className="inline-flex items-center px-2.5 py-1 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No invoices found.
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
