import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status?.toLowerCase() || '';

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm === 'available' || norm === 'active' || norm === 'approved' || norm === 'paid' || norm === 'returned') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (norm === 'issued') {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (norm === 'return requested' || norm === 'pending' || norm === 'limited availability') {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (norm === 'overdue' || norm === 'unpaid' || norm === 'rejected' || norm === 'deactivated' || norm === 'currently unavailable') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${padding} ${bg} tracking-wide`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        norm.includes('available') || norm.includes('active') || norm.includes('approved') || norm.includes('paid') || norm.includes('returned')
          ? 'bg-emerald-500'
          : norm.includes('issued')
          ? 'bg-blue-500'
          : norm.includes('pending') || norm.includes('limited') || norm.includes('requested')
          ? 'bg-amber-500'
          : 'bg-rose-500'
      }`} />
      {status}
    </span>
  );
};
