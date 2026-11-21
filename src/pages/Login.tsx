import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Truck } from 'lucide-react';

const quickLogins = [
  { label: 'Admin', id: 'admin@freedomcartruck.com' },
  { label: 'Manager', id: 'manager@freedomcartruck.com' },
  { label: 'Service writer', id: 'writer@freedomcartruck.com' },
  { label: 'Technician', id: 'tech1@freedomcartruck.com' },
  { label: 'QC technician', id: 'tech2@freedomcartruck.com' },
  { label: 'Office assistant', id: 'office@freedomcartruck.com' },
];

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
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Freedom Car &amp; Truck</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-id" className="mb-1 block text-sm font-medium text-slate-700">
                Email or employee ID
              </label>
              <input
                id="login-id"
                type="text"
                required
                autoComplete="username"
                value={emailOrEmployeeId}
                onChange={(e) => setEmailOrEmployeeId(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-center text-xs text-slate-500">Demo accounts (password: Password123!)</p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLogins.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEmailOrEmployeeId(item.id);
                  setPassword('Password123!');
                }}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  emailOrEmployeeId === item.id
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
