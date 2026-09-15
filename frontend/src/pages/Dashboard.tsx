import {
  Alert,
  AlertTitle,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useCallback, useEffect, useState } from 'react';
import CategoryBreakdownChart from '../charts/CategoryBreakdownChart';
import RevenueExpenseChart from '../charts/RevenueExpenseChart';
import MetricCard from '../components/MetricCard';
import RecentTransactions from '../components/RecentTransactions';
import { dashboardService } from '../services/dashboardService';
import { extractErrorMessage } from '../services/api';
import { transactionService } from '../services/transactionService';
import type { DashboardFilters } from '../types/dashboard';
import type { CategoryBreakdownPoint, DashboardSummary, RevenueExpenseTrendPoint } from '../types/dashboard';
import type { Transaction } from '../types/transaction';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';

const USER_OPTIONS = ['user_001', 'user_002', 'user_003', 'user_004'];

const DEFAULT_FILTERS: Required<Pick<DashboardFilters, never>> & DashboardFilters = {
  userId: undefined,
  startDate: undefined,
  endDate: undefined,
};

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [filters, setFilters] = useState<DashboardFilters>({ ...DEFAULT_FILTERS });
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>({ ...DEFAULT_FILTERS });

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<RevenueExpenseTrendPoint[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownPoint[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [staleIndicator, setStaleIndicator] = useState(false);

  const handle401 = useCallback(() => {
    logout('Your session has expired. Please sign in again.');
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const allLoading = loadingSummary || loadingTrend || loadingBreakdown || loadingRecent;

  const loadAll = useCallback(
    async (f: DashboardFilters, isRefresh = false) => {
      setError(null);
      setStaleIndicator(false);
      setLoadingSummary(true);
      setLoadingTrend(true);
      setLoadingBreakdown(true);
      setLoadingRecent(true);

      try {
        const [s, t, b, r] = await Promise.allSettled([
          dashboardService.getSummary(f),
          dashboardService.getRevenueExpenseTrend(f),
          dashboardService.getCategoryBreakdown(f),
          transactionService.getRecentTransactions(5, f.userId),
        ]);

        let fatalMsg: string | null = null;
        let had401 = false;
        let hadAnyFailure = false;

        if (s.status === 'fulfilled') {
          setSummary(s.value);
        } else {
          hadAnyFailure = true;
          const msg = extractErrorMessage(s.reason);
          fatalMsg = msg;
          setSummary(null);
          const status = (s.reason as { response?: { status?: number } }).response?.status;
          if (status === 401) had401 = true;
        }

        if (t.status === 'fulfilled') {
          setTrend(t.value);
        } else {
          hadAnyFailure = true;
          if (!fatalMsg) fatalMsg = extractErrorMessage(t.reason);
          setTrend([]);
          const status = (t.reason as { response?: { status?: number } }).response?.status;
          if (status === 401) had401 = true;
        }

        if (b.status === 'fulfilled') {
          setBreakdown(b.value);
        } else {
          hadAnyFailure = true;
          if (!fatalMsg) fatalMsg = extractErrorMessage(b.reason);
          setBreakdown([]);
          const status = (b.reason as { response?: { status?: number } }).response?.status;
          if (status === 401) had401 = true;
        }

        if (r.status === 'fulfilled') {
          setRecent(r.value.transactions);
        } else {
          hadAnyFailure = true;
          if (!fatalMsg) fatalMsg = extractErrorMessage(r.reason);
          setRecent([]);
          const status = (r.reason as { response?: { status?: number } }).response?.status;
          if (status === 401) had401 = true;
        }

        if (had401) {
          handle401();
          return;
        }

        if (fatalMsg) {
          setError(`Couldn't load dashboard: ${fatalMsg}`);
          if (hadAnyFailure && (summary !== null || trend.length > 0 || breakdown.length > 0 || recent.length > 0)) {
            setStaleIndicator(true);
          }
          if (isRefresh) {
            snackbar.showError(`Refresh failed: ${fatalMsg}`);
          }
        } else if (isRefresh) {
          snackbar.showSuccess('Dashboard data refreshed.');
        }
      } catch (e: unknown) {
        const msg = extractErrorMessage(e);
        setError(`Unexpected error loading dashboard: ${msg}`);
        setSummary(null);
        setTrend([]);
        setBreakdown([]);
        setRecent([]);
        if (isRefresh) snackbar.showError(`Refresh failed: ${msg}`);
      } finally {
        setLoadingSummary(false);
        setLoadingTrend(false);
        setLoadingBreakdown(false);
        setLoadingRecent(false);
      }
    },
    [handle401, snackbar, summary, trend, breakdown, recent]
  );

  useEffect(() => {
    void loadAll(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleApply = () => {
    setFilters({ ...draftFilters });
  };

  const handleReset = () => {
    setDraftFilters({ ...DEFAULT_FILTERS });
    setFilters({ ...DEFAULT_FILTERS });
  };

  const handleRetry = () => {
    void loadAll(filters, true);
  };

  const savingsAmount = summary ? summary.balance : null;
  const savingsRateLabel =
    summary !== null ? `${summary.savingsRate.toFixed(2)}% savings rate` : undefined;
  const balanceLabel =
    summary !== null && summary.totalRevenue > 0
      ? `Net of ${summary.totalRevenue.toLocaleString()} revenue`
      : undefined;

  const anyFilterActive =
    filters.userId !== undefined ||
    filters.startDate !== undefined ||
    filters.endDate !== undefined;

  return (
    <Box className="w-full flex flex-col gap-5 sm:gap-6">
      <Box className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.6rem', sm: '1.85rem' },
              letterSpacing: '-0.03em',
            }}
            className="!text-text-primary"
          >
            Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '0.92rem', mt: 0.5 }}
            className="!text-text-secondary"
          >
            Welcome back — here&apos;s how your transactions are performing.
          </Typography>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tooltip title="Reload all dashboard data">
            <span>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                disabled={allLoading}
                sx={{
                  borderColor: '#263253',
                  color: '#aab4cf',
                  '&:hover': {
                    borderColor: '#334372',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: '#e5e9f2',
                  },
                }}
              >
                {allLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </span>
          </Tooltip>
        </div>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid #263253',
          bgcolor: '#151d33',
          boxShadow: 'none',
        }}
      >
        <Box className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <FilterListIcon aria-hidden="true" sx={{ color: '#7683a6' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} className="!text-text-primary">
              Filters
            </Typography>
            {anyFilterActive && (
              <span className="ml-1 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold"
                style={{
                  backgroundColor: 'rgba(59,130,246,0.14)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
              >
                Active
              </span>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormControl size="small" fullWidth>
              <InputLabel id="user-filter-label" sx={{ color: '#aab4cf' }}>User</InputLabel>
              <Select
                labelId="user-filter-label"
                label="User"
                value={draftFilters.userId ?? ''}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    userId: e.target.value === '' ? undefined : (e.target.value as string),
                  }))
                }
                disabled={allLoading}
              >
                <MenuItem value="">
                  <em>All users</em>
                </MenuItem>
                {USER_OPTIONS.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              fullWidth
              label="Start Date"
              type="date"
              value={draftFilters.startDate ?? ''}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value === '' ? undefined : e.target.value,
                }))
              }
              disabled={allLoading}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />

            <TextField
              size="small"
              fullWidth
              label="End Date"
              type="date"
              value={draftFilters.endDate ?? ''}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value === '' ? undefined : e.target.value,
                }))
              }
              disabled={allLoading}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </div>

          <div className="flex items-center gap-2 sm:self-stretch sm:mt-0 sm:items-end flex-wrap">
            <Button
              variant="outlined"
              size="medium"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={
                allLoading ||
                (draftFilters.userId === undefined &&
                  draftFilters.startDate === undefined &&
                  draftFilters.endDate === undefined)
              }
              sx={{
                borderColor: '#263253',
                color: '#aab4cf',
                '&:hover': {
                  borderColor: '#334372',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: '#e5e9f2',
                },
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="medium"
              onClick={handleApply}
              disabled={allLoading}
            >
              Apply
            </Button>
          </div>
        </Box>
      </Paper>

      {error !== null && (
        <Alert
          severity={staleIndicator ? 'warning' : 'error'}
          sx={{ borderRadius: 4 }}
          action={
            <Box className="flex items-center gap-1">
              <Tooltip title="Retry loading">
                <IconButton
                  aria-label="retry loading dashboard"
                  color="inherit"
                  size="small"
                  onClick={handleRetry}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button color="inherit" size="small" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </Box>
          }
        >
          <AlertTitle>{staleIndicator ? 'Some data failed to load' : "Couldn't load dashboard"}</AlertTitle>
          {error}
          {staleIndicator && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>
              Previously loaded data is still displayed but may be stale.
            </Typography>
          )}
        </Alert>
      )}

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Balance"
          value={loadingSummary || summary === null ? null : summary.balance}
          subValue={balanceLabel}
          variant="balance"
          loading={loadingSummary}
        />
        <MetricCard
          title="Total Revenue"
          value={loadingSummary || summary === null ? null : summary.totalRevenue}
          variant="revenue"
          loading={loadingSummary}
        />
        <MetricCard
          title="Total Expenses"
          value={loadingSummary || summary === null ? null : summary.totalExpenses}
          variant="expense"
          loading={loadingSummary}
        />
        <MetricCard
          title="Savings"
          value={loadingSummary || summary === null ? null : savingsAmount}
          subValue={loadingSummary ? undefined : savingsRateLabel}
          variant="savings"
          loading={loadingSummary}
        />
      </Box>

      <Box className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #263253',
            bgcolor: '#151d33',
            boxShadow: 'none',
            overflow: 'hidden',
          }}
          className="xl:col-span-2"
        >
          <Box className="p-4 sm:p-5 md:p-6">
            <RevenueExpenseChart data={trend} loading={loadingTrend} />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #263253',
            bgcolor: '#151d33',
            boxShadow: 'none',
            overflow: 'hidden',
          }}
        >
          <Box className="p-4 sm:p-5 md:p-6">
            <CategoryBreakdownChart data={breakdown} loading={loadingBreakdown} />
          </Box>
        </Paper>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid #263253',
          bgcolor: '#151d33',
          boxShadow: 'none',
          overflow: 'hidden',
        }}
      >
        <Box className="p-4 sm:p-5 md:p-6">
          <RecentTransactions
            transactions={recent}
            loading={loadingRecent}
            limit={5}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default Dashboard;
