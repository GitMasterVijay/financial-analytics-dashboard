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
import { formatCurrencyINR } from '../utils/format';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownPoint[];
  loading?: boolean;
}

const COLORS: Record<string, string> = {
  Revenue: '#10b981',
  Expense: '#ef4444',
};

const formatCurrency = (value: number) => formatCurrencyINR(value);

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
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#e5e9f2', lineHeight: 1.2 }}
          >
            Category Breakdown
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#8892b0', mt: 0.5 }}
          >
            Distribution by transaction type
          </Typography>
        </div>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {Object.entries(COLORS).map(([name, color]) => (
            <Box
              key={name}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid #263253',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: color,
                  boxShadow: `0 0 8px ${color}99`,
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: '#aab4cf', fontWeight: 600 }}
              >
                {name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {isEmpty ? (
        <Box
          sx={{
            width: '100%',
            height: { xs: 320, sm: 380 },
            borderRadius: 2.5,
            border: '1px dashed #263253',
            bgcolor: 'rgba(255,255,255,0.01)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: '#aab4cf', fontWeight: 600 }}
          >
            No category data available
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5 }}>
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
                stroke="#0b1020"
                strokeWidth={2}
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
                  backgroundColor: '#151d33',
                  border: '1px solid #263253',
                  boxShadow: '0 12px 28px -12px rgba(0,0,0,0.6)',
                  color: '#e5e9f2',
                }}
                labelStyle={{
                  color: '#aab4cf',
                  fontWeight: 600,
                  borderBottom: '1px solid #263253',
                  marginBottom: 4,
                  paddingBottom: 4,
                }}
                itemStyle={{
                  color: '#e5e9f2',
                  fontWeight: 500,
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
                    <span
                      style={{
                        color: '#aab4cf',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                      }}
                    >
                      {value}
                      <span style={{ color: '#64748b', marginLeft: 8 }}>
                        ({pct}%)
                      </span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
              mt: 2,
            }}
          >
            {data.map((entry) => {
              const pct = total > 0 ? ((entry.amount / total) * 100).toFixed(1) : '0.0';
              const accent = COLORS[entry.category] ?? '#94a3b8';
              return (
                <Box
                  key={entry.category}
                  sx={{
                    borderRadius: 2.5,
                    p: 2.5,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid #263253',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }}
                  />
                  <Box className="flex items-center gap-2">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: accent,
                        boxShadow: `0 0 8px ${accent}cc`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: '#8892b0', fontWeight: 600, letterSpacing: 0.3 }}
                    >
                      {entry.category}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: accent,
                      mt: 1,
                      lineHeight: 1.2,
                    }}
                  >
                    {formatCurrency(entry.amount)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
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
