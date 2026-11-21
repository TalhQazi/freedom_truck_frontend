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

type Tone = 'indigo' | 'sky' | 'violet' | 'emerald' | 'amber' | 'rose' | 'teal' | 'orange' | 'fuchsia';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  tone: Tone;
}

// Static class strings so Tailwind can detect them.
const toneClasses: Record<Tone, { chip: string; active: string; bar: string }> = {
  indigo: { chip: 'bg-indigo-100 text-indigo-600', active: 'bg-indigo-50 text-indigo-700', bar: 'bg-indigo-500' },
  sky: { chip: 'bg-sky-100 text-sky-600', active: 'bg-sky-50 text-sky-700', bar: 'bg-sky-500' },
  violet: { chip: 'bg-violet-100 text-violet-600', active: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
  emerald: { chip: 'bg-emerald-100 text-emerald-600', active: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  amber: { chip: 'bg-amber-100 text-amber-600', active: 'bg-amber-50 text-amber-800', bar: 'bg-amber-500' },
  rose: { chip: 'bg-rose-100 text-rose-600', active: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500' },
  teal: { chip: 'bg-teal-100 text-teal-600', active: 'bg-teal-50 text-teal-700', bar: 'bg-teal-500' },
  orange: { chip: 'bg-orange-100 text-orange-600', active: 'bg-orange-50 text-orange-700', bar: 'bg-orange-500' },
  fuchsia: { chip: 'bg-fuchsia-100 text-fuchsia-600', active: 'bg-fuchsia-50 text-fuchsia-700', bar: 'bg-fuchsia-500' },
};

const Item: React.FC<NavItem & { onClick: () => void }> = ({ to, label, icon: Icon, tone, onClick }) => {
  const t = toneClasses[tone];
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150 ${
          isActive ? `${t.active} font-medium` : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className={`absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r-full ${t.bar} animate-slide-in-left`} aria-hidden="true" />
          )}
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-110 ${t.chip}`}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
};

const Section: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-0.5">
    {title && <div className="px-3 pb-1 pt-4 text-xs font-medium text-slate-500">{title}</div>}
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
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-sm shadow-indigo-500/30">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Freedom Car &amp; Truck</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <Section>
            <Item to="/" label="Dashboard" tone="indigo" icon={LayoutDashboard} onClick={onClose} />
            <Item to="/tasks" label="Tasks" tone="violet" icon={ListChecks} onClick={onClose} />
          </Section>

          {hasRole('service_writer', 'manager', 'admin') && (
            <Section title="Front office">
              <Item to="/customers" label="Customers" tone="sky" icon={Users} onClick={onClose} />
              <Item to="/vehicles" label="Vehicles" tone="teal" icon={Truck} onClick={onClose} />
              <Item to="/estimates" label="Estimates" tone="fuchsia" icon={FileText} onClick={onClose} />
              <Item to="/repair-orders" label="Repair orders" tone="orange" icon={Wrench} onClick={onClose} />
              <Item to="/invoices" label="Invoices" tone="emerald" icon={Receipt} onClick={onClose} />
              <Item to="/cash-up" label="Cash-up" tone="amber" icon={Wallet} onClick={onClose} />
            </Section>
          )}

          {hasRole('technician', 'qc_technician', 'manager', 'admin', 'service_writer') && (
            <Section title="Workshop">
              {isTech && <Item to="/repair-orders" label="My work orders" tone="orange" icon={Wrench} onClick={onClose} />}
              <Item to="/worksheets" label="Worksheets" tone="teal" icon={ClipboardCheck} onClick={onClose} />
            </Section>
          )}

          {hasRole('office_assistant', 'manager', 'admin') && (
            <Section title="Office">
              <Item to="/security" label="Security" tone="rose" icon={Shield} onClick={onClose} />
            </Section>
          )}

          {hasRole('manager', 'admin') && (
            <Section title="Admin">
              <Item to="/reports" label="Reports" tone="indigo" icon={BarChart3} onClick={onClose} />
              <Item to="/settings" label="Settings" tone="violet" icon={Settings} onClick={onClose} />
            </Section>
          )}
        </nav>
      </aside>
    </>
  );
};
