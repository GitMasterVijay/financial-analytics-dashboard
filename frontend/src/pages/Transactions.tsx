import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Pagination,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { extractErrorMessage } from '../services/api';
import { transactionService } from '../services/transactionService';
import type {
  PaginationMeta,
  SortOrder,
  Transaction,
  TransactionCategory,
  TransactionSortField,
  TransactionStatus,
} from '../types/transaction';
import type { ExportFilterState } from '../types/exportCsv';
import ExportCsvDialog from '../components/ExportCsvDialog';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';

const USER_OPTIONS = ['user_001', 'user_002', 'user_003', 'user_004'];
const CATEGORY_OPTIONS: TransactionCategory[] = ['Revenue', 'Expense'];
const STATUS_OPTIONS: TransactionStatus[] = ['Paid', 'Pending'];
const LIMIT_OPTIONS = [10, 25, 50, 100];
const ALLOWED_SORT_FIELDS: readonly TransactionSortField[] = [
  'id',
  'date',
  'amount',
  'category',
  'status',
  'user_id',
] as const;

interface TransactionFilters {
  search: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  category: TransactionCategory | '';
  status: TransactionStatus | '';
  userId: string;
}

const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  category: '',
  status: '',
  userId: '',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

interface TransactionsProps {
  onNavigate?: unknown;
}

function Transactions(_props: TransactionsProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [draftFilters, setDraftFilters] = useState<TransactionFilters>({ ...DEFAULT_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({ ...DEFAULT_FILTERS });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<TransactionSortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [rows, setRows] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [staleData, setStaleData] = useState(false);

  const [exportOpen, setExportOpen] = useState(false);

  const handle401 = useCallback(() => {
    logout('Your session has expired. Please sign in again.');
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const anyFilterActive = useMemo(() => {
    const f = appliedFilters;
    return Boolean(
      f.search ||
        f.startDate ||
        f.endDate ||
        f.minAmount ||
        f.maxAmount ||
        f.category ||
        f.status ||
        f.userId
    );
  }, [appliedFilters]);

  const anyDraftActive = useMemo(() => {
    return Object.values(draftFilters).some((v) => v !== '');
  }, [draftFilters]);

  const buildParams = useCallback(
    (
      filters: TransactionFilters,
      curPage: number,
      curLimit: number,
      curSortBy: TransactionSortField,
      curSortOrder: SortOrder
    ) => {
      const params = new URLSearchParams();
      params.set('page', String(curPage));
      params.set('limit', String(curLimit));
      params.set('sortBy', curSortBy);
      params.set('sortOrder', curSortOrder);
      if (filters.search) params.set('search', filters.search);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.minAmount) params.set('minAmount', filters.minAmount);
      if (filters.maxAmount) params.set('maxAmount', filters.maxAmount);
      if (filters.category) params.set('category', filters.category);
      if (filters.status) params.set('status', filters.status);
      if (filters.userId) params.set('userId', filters.userId);
      return params;
    },
    []
  );

  const loadTransactions = useCallback(
    async (
      filters: TransactionFilters,
      curPage: number,
      curLimit: number,
      curSortBy: TransactionSortField,
      curSortOrder: SortOrder,
      isRetry = false
    ) => {
      setLoading(true);
      setError(null);
      const hadPriorData = hasData;
      try {
        const params = buildParams(filters, curPage, curLimit, curSortBy, curSortOrder);
        const data = await transactionService.list(params.toString());
        setRows(data.transactions);
        setPagination(data.pagination);
        setHasData(true);
        setStaleData(false);
        if (isRetry) {
          snackbar.showSuccess('Transactions reloaded successfully.');
        }
      } catch (err: unknown) {
        const msg = extractErrorMessage(err);
        const status =
          typeof (err as { response?: { status?: number } }).response?.status === 'number'
            ? (err as { response: { status: number } }).response.status
            : null;
        if (status === 401) {
          handle401();
          return;
        }
        if (hadPriorData) {
          setStaleData(true);
          setError(`${msg} — currently displayed data may be stale.`);
        } else {
          setRows([]);
          setPagination(null);
          setHasData(false);
          setError(msg);
        }
        if (isRetry) {
          snackbar.showError(`Could not reload transactions: ${msg}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [buildParams, handle401, hasData, snackbar]
  );

  useEffect(() => {
    void loadTransactions(appliedFilters, page, limit, sortBy, sortOrder);
  }, [appliedFilters, page, limit, sortBy, sortOrder, loadTransactions]);

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ ...draftFilters });
  };

  const handleReset = () => {
    setDraftFilters({ ...DEFAULT_FILTERS });
    setAppliedFilters({ ...DEFAULT_FILTERS });
    setPage(1);
  };

  const handleRetry = () => {
    void loadTransactions(appliedFilters, page, limit, sortBy, sortOrder, true);
  };

  const handleSortChange = (field: TransactionSortField) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (_event: MouseEvent<HTMLButtonElement> | null, value: number) => {
    setPage(value);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const exportFilters: ExportFilterState = {
    search: appliedFilters.search,
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
    minAmount: appliedFilters.minAmount,
    maxAmount: appliedFilters.maxAmount,
    category: appliedFilters.category,
    status: appliedFilters.status,
    userId: appliedFilters.userId,
  };

  const skeletonRows = Array.from({ length: limit });

  const showEmptyState = !loading && rows.length === 0 && error === null;

  return (
    <Box className="w-full flex flex-col gap-5 sm:gap-6">
      <Box className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Typography variant="h4" className="!font-bold !text-slate-900">
            Transactions
          </Typography>
          <Typography variant="body1" className="!text-slate-500 mt-1">
            Browse, filter, and export company transaction records.
          </Typography>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tooltip title="Reload transaction list">
            <span>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                disabled={loading}
                className="!capitalize"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Download filtered transactions as CSV">
            <span>
              <Button
                variant="contained"
                size="medium"
                startIcon={<FileDownloadIcon />}
                onClick={() => setExportOpen(true)}
                className="!capitalize"
              >
                Export CSV
              </Button>
            </span>
          </Tooltip>
        </div>
      </Box>

      <Paper
        elevation={0}
        className="!rounded-2xl !border !border-slate-200 !bg-white !shadow-sm"
      >
        <Box className="p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-600">
              <SearchIcon aria-hidden="true" />
              <Typography variant="subtitle2" className="!font-semibold">
                Filters
              </Typography>
              {anyFilterActive && (
                <Chip
                  size="small"
                  label="Active"
                  color="primary"
                  variant="outlined"
                  className="!rounded-full"
                />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="text"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                className="!capitalize"
                disabled={loading || (!anyFilterActive && !anyDraftActive)}
              >
                Reset Filters
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleApply}
                className="!capitalize"
                disabled={loading}
              >
                Apply
              </Button>
            </div>
          </div>

          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TextField
              size="small"
              fullWidth
              label="Search"
              placeholder="ID, category, status, user..."
              value={draftFilters.search}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, search: e.target.value }))
              }
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="tx-cat-label">Category</InputLabel>
              <Select
                labelId="tx-cat-label"
                label="Category"
                value={draftFilters.category}
                onChange={(e) =>
                  setDraftFilters((p) => ({
                    ...p,
                    category: e.target.value as TransactionCategory | '',
                  }))
                }
                disabled={loading}
              >
                <MenuItem value=""><em>All categories</em></MenuItem>
                {CATEGORY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="tx-st-label">Status</InputLabel>
              <Select
                labelId="tx-st-label"
                label="Status"
                value={draftFilters.status}
                onChange={(e) =>
                  setDraftFilters((p) => ({
                    ...p,
                    status: e.target.value as TransactionStatus | '',
                  }))
                }
                disabled={loading}
              >
                <MenuItem value=""><em>All statuses</em></MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="tx-user-label">User</InputLabel>
              <Select
                labelId="tx-user-label"
                label="User"
                value={draftFilters.userId}
                onChange={(e) =>
                  setDraftFilters((p) => ({ ...p, userId: e.target.value }))
                }
                disabled={loading}
              >
                <MenuItem value=""><em>All users</em></MenuItem>
                {USER_OPTIONS.map((u) => (
                  <MenuItem key={u} value={u}>{u}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TextField
              size="small"
              fullWidth
              label="Start Date"
              type="date"
              value={draftFilters.startDate}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, startDate: e.target.value }))
              }
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              fullWidth
              label="End Date"
              type="date"
              value={draftFilters.endDate}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, endDate: e.target.value }))
              }
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              fullWidth
              label="Min Amount"
              type="number"
              placeholder="0.00"
              value={draftFilters.minAmount}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, minAmount: e.target.value }))
              }
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />
            <TextField
              size="small"
              fullWidth
              label="Max Amount"
              type="number"
              placeholder="10000.00"
              value={draftFilters.maxAmount}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, maxAmount: e.target.value }))
              }
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {error !== null && (
        <Alert
          severity={staleData ? 'warning' : 'error'}
          className="!rounded-2xl"
          action={
            <Box className="flex items-center gap-1">
              <Tooltip title="Retry loading">
                <IconButton
                  aria-label="retry loading transactions"
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
          <AlertTitle>
            {staleData ? 'Using stale data' : "Couldn't load transactions"}
          </AlertTitle>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        className="!rounded-2xl !border !border-slate-200 !bg-white !shadow-sm !overflow-hidden"
      >
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 border-b border-slate-100">
          <Typography variant="subtitle2" className="!font-semibold !text-slate-700">
            {loading ? (
              <Skeleton variant="text" width={180} />
            ) : pagination ? (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} transactions
                {staleData && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="warning"
                    label="Stale"
                    className="!ml-2"
                  />
                )}
              </>
            ) : (
              showEmptyState ? 'No results' : 'Transactions'
            )}
          </Typography>
          <Box className="flex items-center gap-2">
            <FormControl size="small" sx={{ width: 130 }}>
              <InputLabel id="tx-limit-label">Per page</InputLabel>
              <Select
                labelId="tx-limit-label"
                label="Per page"
                value={limit}
                onChange={(e) => handleLimitChange(e.target.value as number)}
                disabled={loading}
              >
                {LIMIT_OPTIONS.map((l) => (
                  <MenuItem key={l} value={l}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 'none' }}>
          <Table className="!min-w-[780px]" stickyHeader={false}>
            <TableHead className="!bg-slate-50">
              <TableRow>
                {ALLOWED_SORT_FIELDS.map((field) => {
                  const labelMap: Record<TransactionSortField, string> = {
                    id: 'ID',
                    date: 'Date',
                    amount: 'Amount',
                    category: 'Category',
                    status: 'Status',
                    user_id: 'User',
                  };
                  const active = sortBy === field;
                  return (
                    <TableCell
                      key={field}
                      sortDirection={active ? sortOrder : false}
                      className="!py-3 !font-bold !text-slate-600 !text-xs !uppercase !tracking-wide !border-b !border-slate-200"
                    >
                      <TableSortLabel
                        active={active}
                        direction={active ? sortOrder : 'asc'}
                        onClick={() => handleSortChange(field)}
                        className="!whitespace-nowrap"
                      >
                        {labelMap[field]}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                skeletonRows.map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    {ALLOWED_SORT_FIELDS.map((f) => (
                      <TableCell key={f} className="!py-3">
                        <Skeleton variant="text" width={f === 'user_id' ? 110 : 85} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : showEmptyState ? (
                <TableRow>
                  <TableCell
                    colSpan={ALLOWED_SORT_FIELDS.length}
                    className="!py-16 !border-b-0"
                  >
                    <Box className="flex flex-col items-center justify-center text-slate-500 px-4 text-center">
                      <Typography variant="h6" className="!font-semibold !text-slate-700">
                        {anyFilterActive
                          ? 'No transactions match your filters'
                          : 'No transactions found'}
                      </Typography>
                      <Typography variant="body2" className="!mt-2 !text-slate-500">
                        {anyFilterActive
                          ? 'Try adjusting or clearing your filters, or use different criteria.'
                          : 'Check back later for updated transaction records.'}
                      </Typography>
                      {anyFilterActive && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleReset}
                          className="!capitalize !mt-4"
                        >
                          Clear filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    className="!h-[60px] [&>td]:!border-b !border-b-slate-100"
                  >
                    <TableCell className="!font-mono !text-slate-700">#{row.id}</TableCell>
                    <TableCell className="!text-slate-600">{formatDate(row.date)}</TableCell>
                    <TableCell
                      className={
                        row.category === 'Revenue'
                          ? '!font-bold !text-emerald-700'
                          : '!font-bold !text-rose-700'
                      }
                    >
                      {row.category === 'Revenue' ? '+' : '\u2212'}
                      {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.category}
                        color={row.category === 'Revenue' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        color={row.status === 'Paid' ? 'primary' : 'warning'}
                        variant="outlined"
                        sx={{ fontWeight: 500, fontSize: '0.72rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-2">
                        <Box
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{
                            backgroundColor:
                              row.user_id === 'user_001'
                                ? '#6366f1'
                                : row.user_id === 'user_002'
                                  ? '#10b981'
                                  : row.user_id === 'user_003'
                                    ? '#f59e0b'
                                    : '#ef4444',
                          }}
                          aria-hidden="true"
                        >
                          {row.user_id.replace('user_', '')}
                        </Box>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-slate-700 !truncate"
                        >
                          {row.user_id}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-t border-slate-100">
          <Typography variant="caption" className="!text-slate-500 text-center sm:text-left">
            {loading ? (
              <Skeleton variant="text" width={220} />
            ) : pagination ? (
              <>
                Page {pagination.page} of {pagination.totalPages} · Total {pagination.total}{' '}
                records
              </>
            ) : (
              showEmptyState ? 'No records to display' : ''
            )}
          </Typography>
          <Box className="flex justify-center sm:justify-end">
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                size="small"
                shape="rounded"
                page={page}
                count={pagination.totalPages}
                onChange={handlePageChange}
                color="primary"
                disabled={loading}
              />
            )}
          </Box>
        </Box>
      </Paper>

      <ExportCsvDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        filters={exportFilters}
        on401={handle401}
      />
    </Box>
  );
}

export default Transactions;
