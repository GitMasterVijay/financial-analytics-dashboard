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
        <Skeleton variant="text" width={220} height={32} className="!mb-4" />
        <Skeleton variant="rounded" width="100%" height="100%" />
      </Box>
    );
  }

  const isEmpty = !data || data.length === 0;

  return (
    <Box className="w-full">
      <Box className="flex items-end justify-between mb-4">
        <div>
          <Typography variant="h6" className="!font-bold !text-slate-800">
            Revenue vs Expenses
          </Typography>
          <Typography variant="body2" className="!text-slate-500">
            Monthly performance overview
          </Typography>
        </div>
      </Box>

      {isEmpty ? (
        <Box
          className="w-full h-[320px] sm:h-[380px] rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50"
        >
          <Typography variant="body1" className="!text-slate-500 !font-medium">
            No trend data available
          </Typography>
          <Typography variant="caption" className="!text-slate-400 mt-1">
            Try adjusting the filters or date range
          </Typography>
        </Box>
      ) : (
        <Box className="w-full h-[320px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                }
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                width={60}
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
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -10px rgba(15,23,42,0.15)',
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value: string) => (
                  <span className="text-sm text-slate-600 capitalize">{value}</span>
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
