import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { LogOut, Calculator, ChevronDown, Check, Menu } from 'lucide-react';
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('') || 'U';

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
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
            <Calculator className="h-4 w-4 text-slate-400" />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-700">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium leading-tight text-slate-900">{user?.name}</div>
                <div className="text-xs leading-tight text-slate-500">{roleLabel[user?.role || ''] || 'Employee'}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <div className="px-3 py-2 text-xs text-slate-500">Switch account (demo)</div>
                {demoRoles.map((r) => {
                  const active = user?.email === r.email;
                  return (
                    <button
                      key={r.email}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        switchUserDemo(r.email);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-500">{r.title}</div>
                      </div>
                      {active && <Check className="h-4 w-4 text-blue-600" />}
                    </button>
                  );
                })}
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
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
