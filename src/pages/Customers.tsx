import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../api/client.js';
import { Customer } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Truck,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'vip' | 'inactive'>('active');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomers({ search });
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await customerApi.createCustomer({
        name,
        phone,
        email,
        address: { street, city, state, zip },
        notes,
        status,
      });
      setModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setStreet('');
      setCity('');
      setZip('');
      setNotes('');
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-700" />
            <span>Customer Profiles &amp; Fleet Accounts</span>
          </h1>
          <p className="text-sm text-slate-500">
            SOP SW-001: Create and verify complete customer account records
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer (SW-001)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone number, email, or account #..."
            className="w-full text-sm border border-slate-200 rounded-md pl-9 pr-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Data Grid */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">Account #</th>
                <th className="px-4 py-3">Customer / Fleet Name</th>
                <th className="px-4 py-3">Contact Information</th>
                <th className="px-4 py-3">Billing Address</th>
                <th className="px-4 py-3">Vehicles</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Searching customer database...
                  </td>
                </tr>
              ) : customers.map((c) => (
                <tr key={c._id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-indigo-700">
                    <Link to={`/customers/${c._id}`} className="hover:underline">
                      {c.customerNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    {c.notes && (
                      <div className="text-xs text-slate-500 truncate max-w-xs">{c.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-slate-800">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {c.address?.street ? (
                      <div>
                        {c.address.street}, {c.address.city} {c.address.state} {c.address.zip}
                      </div>
                    ) : (
                      <span className="text-slate-500">No address on file</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.vehicles?.length || 0} Vehicle(s)</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/customers/${c._id}`}
                      className="inline-flex items-center px-2.5 py-1 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No customers found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Customer Modal (SW-001) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Register Customer Profile (SW-001)
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

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Customer / Fleet Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lone Star Logistics LLC"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(214) 555-0199"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fleet@company.com"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="active">Active Standard</option>
                    <option value="vip">Vip / High-Priority Commercial Fleet</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="1234 Commerce Blvd"
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dallas"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="TX"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Zip</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="75201"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Customer Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, fleet dispatch preferences, etc."
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
                  {submitting ? 'Registering...' : 'Register Profile (SW-001)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
