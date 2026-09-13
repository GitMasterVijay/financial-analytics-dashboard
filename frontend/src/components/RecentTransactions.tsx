import {
  Avatar,
  Box,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import type { Transaction } from '../types/transaction';
import { formatCurrencyINR } from '../utils/format';

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
  limit?: number;
}

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

function isValidImageUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
}

function getAvatarFallback(userId: string): string {
  return userId.replace('user_', '');
}

function RecentTransactions({
  transactions,
  loading = false,
  limit = 5,
}: RecentTransactionsProps) {
  const rows = loading
    ? Array.from({ length: limit })
    : transactions.slice(0, limit);

  const isEmpty = !loading && rows.length === 0;

  return (
    <Box>
      <Box className="flex items-end justify-between mb-4">
        <div>
          <Typography variant="h6" className="!font-bold !text-slate-800">
            Recent Transactions
          </Typography>
          <Typography variant="body2" className="!text-slate-500">
            Latest activity
          </Typography>
        </div>
      </Box>

      {isEmpty ? (
        <Box
          className="rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 py-12"
        >
          <Typography variant="body1" className="!text-slate-500 !font-medium">
            No recent transactions
          </Typography>
          <Typography variant="caption" className="!text-slate-400 mt-1">
            No transactions match the current filters
          </Typography>
        </Box>
      ) : (
        <List disablePadding className="!divide-y !divide-slate-100">
          {rows.map((row, idx) => (
            <ListItem
              key={loading ? `skel-${idx}` : (row as Transaction).id}
              disableGutters
              className="!py-3 first:!pt-0 last:!pb-0"
            >
              {loading ? (
                <Box className="flex items-center w-full gap-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box className="flex-1">
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                  <Skeleton variant="text" width={90} height={28} />
                </Box>
              ) : (
                <>
                  <ListItemAvatar className="!min-w-[56px]">
                    <Avatar
                      src={isValidImageUrl((row as Transaction).user_profile) ? (row as Transaction).user_profile : undefined}
                      alt={`${(row as Transaction).user_id} profile`}
                      sx={{
                        bgcolor:
                          (row as Transaction).category === 'Revenue'
                            ? '#d1fae5'
                            : '#fee2e2',
                        color:
                          (row as Transaction).category === 'Revenue'
                            ? '#047857'
                            : '#b91c1c',
                        width: 40,
                        height: 40,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {isValidImageUrl((row as Transaction).user_profile) ? undefined : (getAvatarFallback((row as Transaction).user_id) || <PersonIcon />)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1">
                        <div className="flex-1 min-w-0">
                          <Typography
                            variant="subtitle2"
                            className="!font-semibold !text-slate-800 !truncate"
                          >
                            {(row as Transaction).user_id}
                          </Typography>
                          <Typography variant="caption" className="!text-slate-500">
                            {formatDate((row as Transaction).date)}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Chip
                            size="small"
                            label={(row as Transaction).category}
                            color={
                              (row as Transaction).category === 'Revenue'
                                ? 'success'
                                : 'error'
                            }
                            variant="outlined"
                            sx={{ height: 22, fontWeight: 600, fontSize: '0.7rem' }}
                          />
                          <Chip
                            size="small"
                            label={(row as Transaction).status}
                            variant="outlined"
                            color={
                              (row as Transaction).status === 'Paid'
                                ? 'primary'
                                : 'warning'
                            }
                            sx={{ height: 22, fontWeight: 500, fontSize: '0.7rem' }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color:
                                (row as Transaction).category === 'Revenue'
                                  ? '#047857'
                                  : '#b91c1c',
                              minWidth: 92,
                              textAlign: 'right',
                            }}
                          >
                            {(row as Transaction).category === 'Revenue' ? '+' : '−'}
                            {formatCurrency((row as Transaction).amount)}
                          </Typography>
                        </div>
                      </div>
                    }
                  />
                </>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default RecentTransactions;
