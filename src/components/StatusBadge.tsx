import React from 'react';
import { cn, getStatusClass, getStatusLabel } from '../utils';
import type { PassStatus, RequestStatus } from '../types';

interface StatusBadgeProps {
  status: PassStatus | RequestStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
      getStatusClass(status),
      className
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'pending'   ? 'bg-amber-500'  :
        status === 'approved'  ? 'bg-green-500'  :
        status === 'active'    ? 'bg-blue-500'   :
        status === 'rejected'  ? 'bg-red-500'    :
        status === 'used'      ? 'bg-purple-500' :
        'bg-gray-400'
      )} />
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
