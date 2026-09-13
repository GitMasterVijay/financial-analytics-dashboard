import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Box, Skeleton, Typography } from '@mui/material';
import type { CategoryBreakdownPoint } from '../types/dashboard';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownPoint[];
  loading?: boolean;
}

const COLORS: Record<string, string> = {
  Revenue: '#10b981',
  Expense: '#ef4444',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

function CategoryBreakdownChart({
  data,
  loading = false,
}: CategoryBreakdownChartProps) {
  if (loading) {
    return (
      <Box className="w-full h-[320px] sm:h-[380px] flex flex-col">
        <Skeleton variant="text" width={220} height={32} className="!mb-4" />
        <Skeleton variant="circular" width={260} height={260} className="mx-auto" />
      </Box>
    );
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const isEmpty = !data || data.length === 0 || total <= 0;

  return (
    <Box className="w-full">
      <Box className="flex items-end justify-between mb-4">
        <div>
          <Typography variant="h6" className="!font-bold !text-slate-800">
            Category Breakdown
          </Typography>
          <Typography variant="body2" className="!text-slate-500">
            Distribution by transaction type
          </Typography>
        </div>
      </Box>

      {isEmpty ? (
        <Box
          className="w-full h-[320px] sm:h-[380px] rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50"
        >
          <Typography variant="body1" className="!text-slate-500 !font-medium">
            No category data available
          </Typography>
          <Typography variant="caption" className="!text-slate-400 mt-1">
            No transactions match the current filters
          </Typography>
        </Box>
      ) : (
        <Box className="w-full h-[320px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={120}
                paddingAngle={3}
                dataKey="amount"
                nameKey="category"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={COLORS[entry.category] ?? '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const num = typeof value === 'number' ? value : 0;
                  const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0.0';
                  return [`${formatCurrency(num)} (${pct}%)`, String(name)];
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -10px rgba(15,23,42,0.15)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value: string) => {
                  const row = data.find((d) => d.category === value);
                  const pct =
                    row && total > 0 ? ((row.amount / total) * 100).toFixed(1) : '0.0';
                  return (
                    <span className="text-sm text-slate-600">
                      {value}
                      <span className="text-slate-400 ml-2">({pct}%)</span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <Box className="grid grid-cols-2 gap-3 mt-2">
            {data.map((entry) => {
              const pct = total > 0 ? ((entry.amount / total) * 100).toFixed(1) : '0.0';
              return (
                <Box
                  key={entry.category}
                  className="rounded-xl p-3 bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: COLORS[entry.category] ?? '#94a3b8',
                      }}
                    />
                    <Typography variant="caption" className="!text-slate-500">
                      {entry.category}
                    </Typography>
                  </div>
                  <Typography
                    variant="h6"
                    className="!font-bold !text-slate-800 mt-1"
                  >
                    {formatCurrency(entry.amount)}
                  </Typography>
                  <Typography variant="caption" className="!text-slate-500">
                    {pct}% of total
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default CategoryBreakdownChart;
