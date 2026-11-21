import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'ro' | 'inspection' | 'invoice' | 'task' | 'general';
}

type Tone = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

const toneFor = (status: string): Tone => {
  switch (status) {
    case 'GREEN':
    case 'PASSED':
    case 'QC_APPROVED':
    case 'EXIT_OBSERVED':
    case 'READY_FOR_INVOICE':
    case 'PAID':
    case 'RELEASED':
    case 'CLOSED':
    case 'COMPLETED':
    case 'DEPOSIT_PAID':
    case 'BALANCED':
    case 'APPROVED':
      return 'green';
    case 'YELLOW':
    case 'AUTHORIZATION_PENDING':
    case 'DEPOSIT_REQUIRED':
    case 'INVOICED':
    case 'ISSUED':
    case 'PENDING_APPROVAL':
      return 'yellow';
    case 'RED':
    case 'FAILED':
    case 'FLAGGED_DEFECT':
    case 'QC_DISCREPANCY':
    case 'OVERDUE':
    case 'REJECTED':
    case 'DISCREPANCY':
      return 'red';
    case 'ESTIMATE_PENDING':
    case 'ESTIMATE_CREATED':
    case 'AUTHORIZED':
    case 'DISPATCHED':
    case 'INSPECTION_IN_PROGRESS':
    case 'REPAIR_IN_PROGRESS':
    case 'IN_PROGRESS':
    case 'PARTIALLY_PAID':
      return 'blue';
    case 'TECH1_SIGNED':
    case 'QC_PENDING':
    case 'QC_IN_PROGRESS':
      return 'purple';
    default:
      return 'gray';
  }
};

const toneClasses: Record<Tone, { badge: string; dot: string }> = {
  gray: { badge: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  blue: { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  green: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  yellow: { badge: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  red: { badge: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  purple: { badge: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
};

const formatText = (text: string) => {
  if (!text) return '';
  const s = text.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const tone = toneClasses[toneFor(status)];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset animate-fade-in',
        sizeClasses[size],
        tone.badge
      )}
    >
      <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden="true" />
      {formatText(status)}
    </span>
  );
};
