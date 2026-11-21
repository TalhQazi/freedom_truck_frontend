import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Wrench,
  Shield,
  UserCheck,
  LogOut,
  Calculator,
  ChevronDown,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { PricingCalculatorModal } from './PricingCalculatorModal.js';

export const Navbar: React.FC = () => {
  const { user, logout, switchUserDemo } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const demoRoles = [
    { email: 'admin@freedomcartruck.com', name: 'Robert Miller', role: 'admin', empId: 'EMP-1001', title: 'System Administrator' },
    { email: 'manager@freedomcartruck.com', name: 'David Sterling', role: 'manager', empId: 'EMP-1002', title: 'Workshop Manager / Approver' },
    { email: 'writer@freedomcartruck.com', name: 'Sarah Jenkins', role: 'service_writer', empId: 'EMP-1003', title: 'Service Writer' },
    { email: 'tech1@freedomcartruck.com', name: 'Marcus Cole', role: 'technician', empId: 'EMP-1004', title: 'Lead Technician (Tech #1)' },
    { email: 'tech2@freedomcartruck.com', name: 'Alexander Hayes', role: 'qc_technician', empId: 'EMP-1005', title: 'Independent QC Tech (Tech #2)' },
    { email: 'office@freedomcartruck.com', name: 'Emily Watson', role: 'office_assistant', empId: 'EMP-1006', title: 'Office Assistant / InfoSec' },
  ];

  const formatRoleTitle = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'manager':
        return 'Workshop Manager / Approver';
      case 'service_writer':
        return 'Service Writer';
      case 'technician':
        return 'Automotive Technician (Tech #1)';
      case 'qc_technician':
        return 'Independent QC Technician (Tech #2)';
      case 'office_assistant':
        return 'Office Assistant / InfoSec';
      default:
        return 'Employee';
    }
  };

  return (
    <>
      <header className="bg-brand-950 text-white border-b border-brand-800 sticky top-0 z-30 select-none">
        <div className="px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Left: Brand & Facility */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-700 to-brand-900 border border-blue-500/40 flex items-center justify-center shadow-md">
                <Wrench className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wider uppercase text-white font-sans flex items-center gap-1.5">
                  FREEDOM <span className="text-amber-500 text-xs">CAR &amp; TRUCK</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
                  WORKSHOP SYSTEMS
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-1.5 pl-4 border-l border-brand-800 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium text-slate-300">Dallas Main Service Facility</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1.5 animate-pulse"></span>
            </div>
          </div>

          {/* Right: Tools, Role Switcher, Employee Badge, Logout */}
          <div className="flex items-center space-x-3">
            {/* Live Pricing Calculator Trigger */}
            <button
              type="button"
              onClick={() => setCalcOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold bg-brand-900 hover:bg-brand-800 border border-brand-700 rounded text-slate-200 transition-colors shadow-sm"
              title="Open SW-004 & SW-005 Pricing Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Markup Calculator</span>
            </button>

            {/* Quick Role Switcher Dropdown (Crucial for testing all 6 role dashboards) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/60 rounded text-blue-200 transition-colors"
                title="Switch active role context"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline font-mono text-[11px]">ROLE:</span>
                <span className="font-bold text-white uppercase text-[11px]">{user?.role?.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 text-blue-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 font-sans">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    Role Context Switcher (Instant Test)
                  </div>
                  <div className="divide-y divide-slate-100">
                    {demoRoles.map((r) => {
                      const isActive = user?.email === r.email;
                      return (
                        <button
                          key={r.email}
                          type="button"
                          onClick={() => {
                            setRoleMenuOpen(false);
                            switchUserDemo(r.email);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isActive ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold">{r.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">[{r.empId}]</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">{r.title}</div>
                          </div>
                          {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Employee Profile Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-brand-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{user?.name}</span>
                <span className="text-[10px] font-mono text-amber-400 tracking-wider">
                  {user?.employeeId}
                </span>
              </div>
              <div className="w-7 h-7 rounded bg-brand-800 border border-brand-700 flex items-center justify-center text-xs font-bold text-slate-200 uppercase font-mono">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-brand-900 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Pricing Calculator Modal */}
      <PricingCalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </>
  );
};
