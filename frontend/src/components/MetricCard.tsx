import { Box, Skeleton, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import type { ReactNode } from 'react';
import { formatCurrencyINR } from '../utils/format';

export type MetricVariant = 'revenue' | 'expense' | 'balance' | 'savings';

interface MetricCardProps {
  title: string;
  value: number | null;
  subValue?: string;
  variant: MetricVariant;
  loading?: boolean;
  prefix?: string;
}

interface VariantConfig {
  accent: string;
  accentSoft: string;
  iconBg: string;
  iconColor: string;
  icon: ReactNode;
  label: string;
}

const VARIANT_CONFIG: Record<MetricVariant, VariantConfig> = {
  revenue: {
    accent: '#34d399',
    accentSoft: 'rgba(16,185,129,0.1)',
    iconBg: 'rgba(16,185,129,0.18)',
    iconColor: '#34d399',
    icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
    label: '+',
  },
  expense: {
    accent: '#f87171',
    accentSoft: 'rgba(239,68,68,0.1)',
    iconBg: 'rgba(239,68,68,0.18)',
    iconColor: '#f87171',
    icon: <TrendingDownIcon sx={{ fontSize: 22 }} />,
    label: '−',
  },
  balance: {
    accent: '#60a5fa',
    accentSoft: 'rgba(59,130,246,0.1)',
    iconBg: 'rgba(59,130,246,0.18)',
    iconColor: '#60a5fa',
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />,
    label: '',
  },
  savings: {
    accent: '#a78bfa',
    accentSoft: 'rgba(139,92,246,0.1)',
    iconBg: 'rgba(139,92,246,0.18)',
    iconColor: '#a78bfa',
    icon: <SavingsIcon sx={{ fontSize: 22 }} />,
    label: '',
  },
};

function formatCurrency(value: number): string {
  return formatCurrencyINR(value);
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
      className="relative rounded-2xl border shadow-card overflow-hidden transition-transform hover:-translate-y-0.5 duration-200"
      sx={{
        backgroundColor: '#151d33',
        borderColor: '#263253',
      }}
    >
      <Box
        className="absolute top-0 right-0 w-40 h-40 opacity-40 pointer-events-none"
        sx={{
          background: `radial-gradient(circle at top right, ${cfg.accentSoft} 0%, transparent 70%)`,
        }}
      />
      <Box className="p-5 sm:p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Typography
              variant="overline"
              sx={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}
              className="!font-semibold !text-text-tertiary !tracking-widest"
            >
              {title}
            </Typography>
            <div className="mt-2">
              {loading ? (
                <Skeleton
                  variant="text"
                  width="82%"
                  sx={{
                    bgcolor: '#263253',
                    fontSize: '2.5rem',
                    height: 46,
                  }}
                />
              ) : (
                <Typography
                  variant="h3"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', sm: '2.1rem', lg: '2.25rem' },
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    color: cfg.accent,
                  }}
                >
                  {value === null
                    ? '—'
                    : `${prefix ?? cfg.label}${formatCurrency(value)}`}
                </Typography>
              )}
            </div>
            {subValue !== undefined && (
              <div className="mt-3">
                {loading ? (
                  <Skeleton
                    variant="text"
                    width="55%"
                    sx={{ bgcolor: '#263253', fontSize: '0.85rem' }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '0.8rem' }}
                    className="!text-text-secondary"
                  >
                    {subValue}
                  </Typography>
                )}
              </div>
            )}
          </div>
          <Box
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center relative overflow-hidden"
            sx={{
              backgroundColor: cfg.iconBg,
              border: `1px solid ${cfg.accentSoft}`,
              color: cfg.iconColor,
            }}
          >
            {cfg.icon}
            <Box
              className="absolute inset-0 opacity-30"
              sx={{
                background: `linear-gradient(135deg, ${cfg.accentSoft} 0%, transparent 60%)`,
              }}
            />
          </Box>
        </div>

        <Box
          className="mt-5 h-1 w-full rounded-full overflow-hidden"
          sx={{ backgroundColor: '#263253' }}
        >
          <Box
            className="h-full rounded-full"
            sx={{
              width: variant === 'balance' || variant === 'savings' ? '60%' : '75%',
              background: `linear-gradient(90deg, ${cfg.accent} 0%, ${cfg.accent}80 100%)`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default MetricCard;
