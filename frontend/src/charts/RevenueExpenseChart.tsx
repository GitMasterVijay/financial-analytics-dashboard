import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Box, Skeleton, Typography } from '@mui/material';
import type { RevenueExpenseTrendPoint } from '../types/dashboard';

interface RevenueExpenseChartProps {
  data: RevenueExpenseTrendPoint[];
  loading?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

function RevenueExpenseChart({ data, loading = false }: RevenueExpenseChartProps) {
  if (loading) {
    return (
      <Box className="w-full h-[320px] sm:h-[380px] flex flex-col">
        <Skeleton
          variant="text"
          width={260}
          height={36}
          sx={{ bgcolor: '#263253', mb: 3 }}
        />
        <Skeleton
          variant="rounded"
          width="100%"
          height="100%"
          sx={{ bgcolor: '#263253', borderRadius: 4 }}
        />
      </Box>
    );
  }

  const isEmpty = !data || data.length === 0;

  return (
    <Box className="w-full">
      <Box className="flex items-end justify-between mb-5">
        <div>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.15rem', sm: '1.25rem' },
              letterSpacing: '-0.02em',
            }}
            className="!text-text-primary"
          >
            Revenue vs Expenses
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: '0.85rem', mt: 0.5 }}
            className="!text-text-tertiary"
          >
            Monthly performance overview
          </Typography>
        </div>
        <Box className="hidden sm:flex items-center gap-4">
          <Box className="flex items-center gap-2">
            <Box
              className="w-2.5 h-2.5 rounded-full"
              sx={{ backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }} className="!text-text-secondary">
              Revenue
            </Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Box
              className="w-2.5 h-2.5 rounded-full"
              sx={{ backgroundColor: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }} className="!text-text-secondary">
              Expenses
            </Typography>
          </Box>
        </Box>
      </Box>

      {isEmpty ? (
        <Box
          className="w-full h-[320px] sm:h-[380px] rounded-xl flex flex-col items-center justify-center border border-dashed"
          sx={{
            borderColor: '#263253',
            backgroundColor: 'rgba(255,255,255,0.015)',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }} className="!text-text-secondary">
            No trend data available
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, fontSize: '0.8rem' }} className="!text-text-tertiary">
            Try adjusting the filters or date range
          </Typography>
        </Box>
      ) : (
        <Box className="w-full h-[320px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#263253"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: '#7683a6', fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#263253' }}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                }
                tick={{ fill: '#7683a6', fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#263253' }}
                width={64}
              />
              <Tooltip
                formatter={(value, name) => {
                  const num = typeof value === 'number' ? value : 0;
                  const label =
                    typeof name === 'string'
                      ? name.charAt(0).toUpperCase() + name.slice(1)
                      : String(name);
                  return [formatCurrency(num), label];
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #263253',
                  backgroundColor: '#151d33',
                  color: '#e5e9f2',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                }}
                labelStyle={{
                  color: '#aab4cf',
                  fontWeight: 600,
                  marginBottom: 4,
                  fontSize: '0.78rem',
                }}
                itemStyle={{ color: '#e5e9f2', padding: '2px 0' }}
                cursor={{ stroke: '#334372', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value: string) => (
                  <span
                    style={{
                      color: '#aab4cf',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {value}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="expenses"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default RevenueExpenseChart;
