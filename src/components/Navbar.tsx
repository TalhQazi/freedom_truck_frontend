import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calculator, ChevronDown, Check, Menu, Loader2 } from 'lucide-react';
import { PricingCalculatorModal } from './PricingCalculatorModal.js';

interface NavbarProps {
  onMenuClick: () => void;
}

const demoRoles = [
  { email: 'admin@freedomcartruck.com', name: 'Robert Miller', title: 'Administrator' },
  { email: 'manager@freedomcartruck.com', name: 'David Sterling', title: 'Workshop Manager' },
  { email: 'writer@freedomcartruck.com', name: 'Sarah Jenkins', title: 'Service Writer' },
  { email: 'tech1@freedomcartruck.com', name: 'Marcus Cole', title: 'Technician' },
  { email: 'tech2@freedomcartruck.com', name: 'Alexander Hayes', title: 'QC Technician' },
  { email: 'office@freedomcartruck.com', name: 'Emily Watson', title: 'Office Assistant' },
];

const roleLabel: Record<string, string> = {
  admin: 'Administrator',
  manager: 'Workshop Manager',
  service_writer: 'Service Writer',
  technician: 'Technician',
  qc_technician: 'QC Technician',
  office_assistant: 'Office Assistant',
};

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout, switchUserDemo } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSwitch = async (email: string) => {
    if (email === user?.email || switchingTo) return;
    setSwitchError(null);
    setSwitchingTo(email);
    try {
      await switchUserDemo(email);
      setMenuOpen(false);
      // The new role may not have access to the current page, so start from the dashboard.
      navigate('/');
    } catch {
      setSwitchError('Could not switch account. Please try again.');
    } finally {
      setSwitchingTo(null);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('') || 'U';

  return (
    <>
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCalcOpen(true)}
            className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 sm:inline-flex"
          >
            <Calculator className="h-4 w-4 text-indigo-500" />
            <span>Pricing calculator</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white ring-2 ring-white">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium leading-tight text-slate-900">{user?.name}</div>
                <div className="text-xs leading-tight text-slate-500">{roleLabel[user?.role || ''] || 'Employee'}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {menuOpen && (
              <div role="menu" className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] origin-top-right animate-scale-in rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-100 px-3 pb-2 pt-1.5 sm:hidden">
                  <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                  <div className="text-xs text-slate-500">{roleLabel[user?.role || ''] || 'Employee'}</div>
                </div>
                <div className="px-3 pb-1 pt-2 text-xs font-medium text-slate-500">Switch account (demo)</div>
                {switchError && (
                  <div className="mx-3 mb-1 rounded-md bg-rose-50 px-2 py-1.5 text-xs text-rose-700">{switchError}</div>
                )}
                {demoRoles.map((r) => {
                  const active = user?.email === r.email;
                  const loading = switchingTo === r.email;
                  const initialsFor = r.name.split(' ').map((n) => n[0]).join('');
                  return (
                    <button
                      key={r.email}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      disabled={!!switchingTo}
                      onClick={() => handleSwitch(r.email)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors disabled:cursor-wait ${
                        active ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                      } ${switchingTo && !loading ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                        aria-hidden="true"
                      >
                        {initialsFor}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate ${active ? 'font-medium text-indigo-700' : 'text-slate-900'}`}>{r.name}</span>
                        <span className="block truncate text-xs text-slate-500">{r.title}</span>
                      </span>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" aria-label="Switching" />
                      ) : (
                        active && <Check className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4 text-slate-400" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <PricingCalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </>
  );
};
