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
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
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
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';
import { formatCurrencyINR } from '../utils/format';

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
  return formatCurrencyINR(value);
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

  const handlePageChange = (_event: ChangeEvent<unknown> | MouseEvent<HTMLButtonElement> | null, value: number) => {
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

  const outlineBtnSx = {
    borderColor: '#263253',
    color: '#aab4cf',
    '&:hover': {
      borderColor: '#3b82f6',
      bgcolor: 'rgba(59,130,246,0.08)',
      color: '#e5e9f2',
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: { xs: 4, sm: 5 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <div>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#e5e9f2',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Transactions
          </Typography>
          <Typography variant="body1" sx={{ color: '#8892b0', mt: 1 }}>
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
                sx={outlineBtnSx}
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
                sx={{
                  fontWeight: 600,
                  boxShadow: '0 6px 18px -6px rgba(59,130,246,0.55)',
                }}
              >
                Export CSV
              </Button>
            </span>
          </Tooltip>
        </div>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #263253',
          bgcolor: '#151d33',
          boxShadow: '0 4px 16px -8px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
            }}
            className="sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#aab4cf',
              }}
            >
              <SearchIcon aria-hidden="true" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e5e9f2' }}>
                Filters
              </Typography>
              {anyFilterActive && (
                <Chip
                  size="small"
                  label="Active"
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 999, fontWeight: 600 }}
                />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="text"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                disabled={loading || (!anyFilterActive && !anyDraftActive)}
                sx={{
                  color: '#8892b0',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.04)',
                    color: '#e5e9f2',
                  },
                }}
              >
                Reset Filters
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleApply}
                disabled={loading}
                sx={{ fontWeight: 600 }}
              >
                Apply
              </Button>
            </div>
          </div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
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

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
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
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
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
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {error !== null && (
        <Alert
          severity={staleData ? 'warning' : 'error'}
          sx={{ borderRadius: 3 }}
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
        sx={{
          borderRadius: 3,
          border: '1px solid #263253',
          bgcolor: '#151d33',
          boxShadow: '0 4px 16px -8px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            px: { xs: 3, sm: 4 },
            py: 2.5,
            borderBottom: '1px solid #263253',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: '#aab4cf' }}
          >
            {loading ? (
              <Skeleton variant="text" width={180} />
            ) : pagination ? (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                <Box component="span" sx={{ color: '#e5e9f2', fontWeight: 700 }}>
                  {pagination.total}
                </Box>{' '}
                transactions
                {staleData && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="warning"
                    label="Stale"
                    sx={{ ml: 1 }}
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
          <Table sx={{ minWidth: 780 }} stickyHeader={false}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: '#1a2440',
                  '& .MuiTableCell-head': {
                    borderBottom: '1px solid #263253',
                  },
                }}
              >
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
                      sx={{
                        py: 2,
                        px: 2.5,
                        fontWeight: 800,
                        color: '#aab4cf',
                        fontSize: '0.72rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <TableSortLabel
                        active={active}
                        direction={active ? sortOrder : 'asc'}
                        onClick={() => handleSortChange(field)}
                        sx={{ whiteSpace: 'nowrap' }}
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
                  <TableRow
                    key={`skel-${i}`}
                    sx={{
                      '& .MuiTableCell-body': {
                        borderBottom: '1px solid #1e2a4a',
                      },
                    }}
                  >
                    {ALLOWED_SORT_FIELDS.map((f) => (
                      <TableCell key={f} sx={{ py: 2.5 }}>
                        <Skeleton
                          variant="text"
                          width={f === 'user_id' ? 110 : 85}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : showEmptyState ? (
                <TableRow>
                  <TableCell
                    colSpan={ALLOWED_SORT_FIELDS.length}
                    sx={{ py: 16, borderBottom: 'none' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#8892b0',
                        px: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: '#e5e9f2' }}
                      >
                        {anyFilterActive
                          ? 'No transactions match your filters'
                          : 'No transactions found'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: '#8892b0' }}>
                        {anyFilterActive
                          ? 'Try adjusting or clearing your filters, or use different criteria.'
                          : 'Check back later for updated transaction records.'}
                      </Typography>
                      {anyFilterActive && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleReset}
                          sx={{ mt: 3, ...outlineBtnSx }}
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
                    sx={{
                      height: 60,
                      '& .MuiTableCell-body': {
                        borderBottom: '1px solid #1e2a4a',
                      },
                      transition: 'background-color 120ms ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.02)',
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        color: '#aab4cf',
                        fontWeight: 500,
                      }}
                    >
                      #{row.id}
                    </TableCell>
                    <TableCell sx={{ color: '#cbd5e1' }}>{formatDate(row.date)}</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color:
                          row.category === 'Revenue' ? '#34d399' : '#f87171',
                        fontSize: '0.95rem',
                      }}
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
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          height: 24,
                          borderRadius: 999,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        color={row.status === 'Paid' ? 'primary' : 'warning'}
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.72rem',
                          height: 24,
                          borderRadius: 999,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <UserAvatar
                          src={row.user_profile}
                          userId={row.user_id}
                          size={28}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#e5e9f2',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
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

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 3,
            px: { xs: 3, sm: 4 },
            py: 3,
            borderTop: '1px solid #263253',
            bgcolor: 'rgba(0,0,0,0.12)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              textAlign: { xs: 'center', sm: 'left' },
              fontWeight: 500,
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={220} />
            ) : pagination ? (
              <>
                Page {pagination.page} of{' '}
                <Box component="span" sx={{ color: '#aab4cf', fontWeight: 600 }}>
                  {pagination.totalPages}
                </Box>{' '}
                · Total{' '}
                <Box component="span" sx={{ color: '#aab4cf', fontWeight: 700 }}>
                  {pagination.total}
                </Box>{' '}
                records
              </>
            ) : (
              showEmptyState ? 'No records to display' : ''
            )}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-end' },
            }}
          >
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
