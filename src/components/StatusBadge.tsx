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

const toneClasses: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  yellow: 'bg-yellow-50 text-yellow-800',
  red: 'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700',
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

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => (
  <span
    className={clsx(
      'inline-flex items-center whitespace-nowrap rounded-full font-medium',
      sizeClasses[size],
      toneClasses[toneFor(status)]
    )}
  >
    {formatText(status)}
  </span>
);
