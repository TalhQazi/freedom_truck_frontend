import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'ro' | 'inspection' | 'invoice' | 'task' | 'general';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  type = 'general',
}) => {
  const getBadgeStyle = () => {
    // Inspection classifications (GREEN, YELLOW, RED)
    if (status === 'GREEN' || status === 'PASSED') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
    }
    if (status === 'YELLOW') {
      return 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
    }
    if (status === 'RED' || status === 'FAILED' || status === 'FLAGGED_DEFECT') {
      return 'bg-red-50 text-red-800 border-red-300 font-bold animate-pulse';
    }

    // Repair Order Statuses
    switch (status) {
      case 'INTAKE':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'ESTIMATE_PENDING':
      case 'ESTIMATE_CREATED':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'AUTHORIZATION_PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'AUTHORIZED':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'DEPOSIT_REQUIRED':
        return 'bg-orange-50 text-orange-900 border-orange-400 font-bold';
      case 'DEPOSIT_PAID':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'DISPATCHED':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'INSPECTION_IN_PROGRESS':
      case 'REPAIR_IN_PROGRESS':
        return 'bg-blue-100 text-blue-900 border-blue-400 font-medium';
      case 'TECH1_SIGNED':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'QC_PENDING':
      case 'QC_IN_PROGRESS':
        return 'bg-violet-50 text-violet-800 border-violet-400 font-semibold';
      case 'QC_DISCREPANCY':
        return 'bg-red-100 text-red-900 border-red-400 font-bold';
      case 'QC_APPROVED':
      case 'EXIT_OBSERVED':
      case 'READY_FOR_INVOICE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      case 'INVOICED':
        return 'bg-yellow-50 text-yellow-900 border-yellow-300';
      case 'PAID':
      case 'RELEASED':
      case 'CLOSED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';

      // Invoice Statuses
      case 'ISSUED':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'PARTIALLY_PAID':
        return 'bg-blue-50 text-blue-800 border-blue-300';

      // Task Statuses
      case 'PENDING':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium';
      case 'OVERDUE':
        return 'bg-red-50 text-red-800 border-red-300 font-bold';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formatText = (text: string) => {
    if (!text) return '';
    return text.replace(/_/g, ' ');
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded border font-mono uppercase tracking-wider',
        sizeClasses[size],
        getBadgeStyle()
      )}
    >
      {formatText(status)}
    </span>
  );
};
