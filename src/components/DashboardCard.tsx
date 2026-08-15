import React from 'react';
import { cn } from '../utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  className?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title, value, subtitle, icon, iconBg = 'bg-blue-100',
  trend, className, onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl p-5 card-shadow border border-gray-100 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.value >= 0 ? 'text-green-600' : 'text-red-500'
            )}>
              {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
