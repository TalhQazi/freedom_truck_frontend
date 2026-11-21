import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Wrench, Shield, Lock, ArrowRight, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [emailOrEmployeeId, setEmailOrEmployeeId] = useState('admin@freedomcartruck.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(emailOrEmployeeId, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { label: 'Admin (Robert Miller)', id: 'admin@freedomcartruck.com', role: 'admin' },
    { label: 'Manager (David Sterling)', id: 'manager@freedomcartruck.com', role: 'manager' },
    { label: 'Service Writer (Sarah Jenkins)', id: 'writer@freedomcartruck.com', role: 'service_writer' },
    { label: 'Technician #1 (Marcus Cole)', id: 'tech1@freedomcartruck.com', role: 'technician' },
    { label: 'QC Tech #2 (Alexander Hayes)', id: 'tech2@freedomcartruck.com', role: 'qc_technician' },
    { label: 'Office Assistant (Emily Watson)', id: 'office@freedomcartruck.com', role: 'office_assistant' },
  ];

  return (
    <div className="min-h-screen bg-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-700 border border-blue-500 shadow-xl mb-4">
          <Wrench className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-wider uppercase">
          Freedom Car &amp; Truck
        </h2>
        <p className="mt-1 text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
          Workshop Management Operating System
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Authorized Workshop Personnel &amp; SOP Enforcement Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-brand-900 py-8 px-6 shadow-2xl rounded-lg border border-brand-800 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Employee ID or Company Email
              </label>
              <input
                type="text"
                required
                value={emailOrEmployeeId}
                onChange={(e) => setEmailOrEmployeeId(e.target.value)}
                placeholder="EMP-1001 or user@freedomcartruck.com"
                className="w-full text-sm bg-brand-950 border border-brand-700 rounded px-3 py-2.5 text-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm bg-brand-950 border border-brand-700 rounded px-3 py-2.5 text-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-600 font-bold text-xs uppercase tracking-wider text-white rounded shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In To Terminal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-brand-800">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-mono uppercase mb-3">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Quick Login by Role (Test Environments)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              {quickLogins.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setEmailOrEmployeeId(item.id);
                    setPassword('Password123!');
                  }}
                  className="px-2.5 py-1.5 bg-brand-950/80 hover:bg-brand-800 border border-brand-800 rounded text-[11px] text-slate-300 hover:text-white transition-colors truncate"
                  title={item.id}
                >
                  <span className="font-semibold block truncate">{item.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-slate-500 text-center font-mono">
              Default password for all accounts: <code className="text-slate-300">Password123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
