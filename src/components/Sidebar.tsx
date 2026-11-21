import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Wrench,
  ClipboardCheck,
  Receipt,
  Wallet,
  Shield,
  ListChecks,
  BarChart3,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const Item: React.FC<NavItem & { onClick: () => void }> = ({ to, label, icon: Icon, onClick }) => (
  <NavLink
    to={to}
    end={to === '/'}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-slate-100 font-medium text-slate-900'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`
    }
  >
    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
    <span className="truncate">{label}</span>
  </NavLink>
);

const Section: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-0.5">
    {title && <div className="px-3 pb-1 pt-4 text-xs font-medium text-slate-400">{title}</div>}
    {children}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { hasRole } = useAuth();
  const isTech = hasRole('technician', 'qc_technician');

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Freedom Car &amp; Truck</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <Section>
            <Item to="/" label="Dashboard" icon={LayoutDashboard} onClick={onClose} />
            <Item to="/tasks" label="Tasks" icon={ListChecks} onClick={onClose} />
          </Section>

          {hasRole('service_writer', 'manager', 'admin') && (
            <Section title="Front office">
              <Item to="/customers" label="Customers" icon={Users} onClick={onClose} />
              <Item to="/vehicles" label="Vehicles" icon={Truck} onClick={onClose} />
              <Item to="/estimates" label="Estimates" icon={FileText} onClick={onClose} />
              <Item to="/repair-orders" label="Repair orders" icon={Wrench} onClick={onClose} />
              <Item to="/invoices" label="Invoices" icon={Receipt} onClick={onClose} />
              <Item to="/cash-up" label="Cash-up" icon={Wallet} onClick={onClose} />
            </Section>
          )}

          {hasRole('technician', 'qc_technician', 'manager', 'admin', 'service_writer') && (
            <Section title="Workshop">
              {isTech && <Item to="/repair-orders" label="My work orders" icon={Wrench} onClick={onClose} />}
              <Item to="/worksheets" label="Worksheets" icon={ClipboardCheck} onClick={onClose} />
            </Section>
          )}

          {hasRole('office_assistant', 'manager', 'admin') && (
            <Section title="Office">
              <Item to="/security" label="Security" icon={Shield} onClick={onClose} />
            </Section>
          )}

          {hasRole('manager', 'admin') && (
            <Section title="Admin">
              <Item to="/reports" label="Reports" icon={BarChart3} onClick={onClose} />
              <Item to="/settings" label="Settings" icon={Settings} onClick={onClose} />
            </Section>
          )}
        </nav>
      </aside>
    </>
  );
};
