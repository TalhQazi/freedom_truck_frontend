import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Users,
  Truck,
  FileSpreadsheet,
  Wrench,
  ClipboardCheck,
  Receipt,
  DollarSign,
  ShieldAlert,
  ListTodo,
  BarChart3,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, hasRole } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold tracking-wide transition-colors ${
      isActive
        ? 'bg-blue-800 text-white shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-brand-900/80'
    }`;

  return (
    <aside className="w-64 bg-brand-900 border-r border-brand-800 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Role Indicator Banner */}
      <div className="px-4 py-3 bg-brand-950/60 border-b border-brand-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
            {user?.role?.replace('_', ' ')} MODE
          </span>
        </div>
        <span className="text-[10px] font-mono text-amber-400 font-bold bg-brand-900 px-1.5 py-0.5 rounded border border-brand-700">
          {user?.employeeId}
        </span>
      </div>

      <nav className="p-3 space-y-5 flex-1">
        {/* Core Workspace */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Operations
          </div>
          <NavLink to="/" className={navItemClass}>
            <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Role Dashboard</span>
          </NavLink>
          <NavLink to="/tasks" className={navItemClass}>
            <ListTodo className="w-4 h-4 text-amber-400 shrink-0" />
            <span>SOP Tasks ({hasRole('technician') ? 'TECH' : hasRole('office_assistant') ? 'OFF' : 'SW/ALL'})</span>
          </NavLink>
        </div>

        {/* Front Office Management */}
        {hasRole('service_writer', 'manager', 'admin') && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Front Office / Intake
            </div>
            <NavLink to="/customers" className={navItemClass}>
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Customers (SW-001)</span>
            </NavLink>
            <NavLink to="/vehicles" className={navItemClass}>
              <Truck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Vehicles (SW-002)</span>
            </NavLink>
            <NavLink to="/estimates" className={navItemClass}>
              <FileSpreadsheet className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Estimates &amp; Pricing</span>
            </NavLink>
            <NavLink to="/repair-orders" className={navItemClass}>
              <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Repair Orders (RO)</span>
            </NavLink>
            <NavLink to="/invoices" className={navItemClass}>
              <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Invoices &amp; Billing</span>
            </NavLink>
            <NavLink to="/cash-up" className={navItemClass}>
              <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Daily Cash-Up ($100)</span>
            </NavLink>
          </div>
        )}

        {/* Workshop Floor */}
        {hasRole('technician', 'qc_technician', 'manager', 'admin', 'service_writer') && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Workshop Floor / QC
            </div>
            {hasRole('technician', 'qc_technician') && (
              <NavLink to="/repair-orders" className={navItemClass}>
                <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
                <span>My Work Orders</span>
              </NavLink>
            )}
            <NavLink to="/worksheets" className={navItemClass}>
              <ClipboardCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Technician Worksheets</span>
            </NavLink>
          </div>
        )}

        {/* Information Security & Office Assistant */}
        {hasRole('office_assistant', 'manager', 'admin') && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Information Security
            </div>
            <NavLink to="/security" className={navItemClass}>
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>Office Security &amp; CMR</span>
            </NavLink>
          </div>
        )}

        {/* Management & System Controls */}
        {hasRole('manager', 'admin') && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Management &amp; Controls
            </div>
            <NavLink to="/reports" className={navItemClass}>
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Reports &amp; Audits</span>
            </NavLink>
            <NavLink to="/settings" className={navItemClass}>
              <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Shop Matrix &amp; Config</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer SOP Compliance Badge */}
      <div className="p-3 bg-brand-950/80 border-t border-brand-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>SOP RULES: 100% ENFORCED</span>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    </aside>
  );
};
