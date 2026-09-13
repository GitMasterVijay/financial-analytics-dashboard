import { Box, Skeleton, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import type { ReactNode } from 'react';

export type MetricVariant = 'revenue' | 'expense' | 'balance' | 'savings';

interface MetricCardProps {
  title: string;
  value: number | null;
  subValue?: string;
  variant: MetricVariant;
  loading?: boolean;
  prefix?: string;
}

const VARIANT_CONFIG: Record<
  MetricVariant,
  { bg: string; accent: string; iconBg: string; icon: ReactNode }
> = {
  revenue: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
    accent: 'text-emerald-600',
    iconBg: 'bg-emerald-500',
    icon: <TrendingUpIcon className="!text-white" />,
  },
  expense: {
    bg: 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-100',
    accent: 'text-rose-600',
    iconBg: 'bg-rose-500',
    icon: <TrendingDownIcon className="!text-white" />,
  },
  balance: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100',
    accent: 'text-blue-600',
    iconBg: 'bg-blue-500',
    icon: <AccountBalanceWalletIcon className="!text-white" />,
  },
  savings: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100',
    accent: 'text-violet-600',
    iconBg: 'bg-violet-500',
    icon: <SavingsIcon className="!text-white" />,
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function MetricCard({
  title,
  value,
  subValue,
  variant,
  loading = false,
  prefix,
}: MetricCardProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <Box
      className={`relative rounded-2xl border p-5 sm:p-6 shadow-sm ${cfg.bg} overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Typography
            variant="caption"
            className="!font-medium !uppercase !tracking-wider !text-slate-500"
          >
            {title}
          </Typography>
          <div className="mt-2">
            {loading ? (
              <Skeleton variant="text" width="70%" height={40} />
            ) : (
              <Typography
                variant="h4"
                component="div"
                className={`!font-bold !text-slate-900 !text-2xl sm:!text-3xl ${cfg.accent}`}
              >
                {value === null ? '—' : `${prefix ?? ''}${formatCurrency(value)}`}
              </Typography>
            )}
          </div>
          {subValue !== undefined && (
            <div className="mt-2">
              {loading ? (
                <Skeleton variant="text" width="50%" height={20} />
              ) : (
                <Typography variant="body2" className="!text-slate-500">
                  {subValue}
                </Typography>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${cfg.iconBg}`}
        >
          {cfg.icon}
        </div>
      </div>
    </Box>
  );
}

export default MetricCard;
