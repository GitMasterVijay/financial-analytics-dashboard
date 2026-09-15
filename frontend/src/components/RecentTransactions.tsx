 import {
  Box,
  Chip,
  List,
  ListItem,
  Skeleton,
  Typography,
} from '@mui/material';
import type { Transaction } from '../types/transaction';
import { formatCurrencyINR } from '../utils/format';
import UserAvatar from './UserAvatar';

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
    <Box
      sx={{
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        background:
          'linear-gradient(145deg, rgba(20, 30, 56, 0.96), rgba(11, 19, 38, 0.98))',
        border: '1px solid rgba(99, 115, 150, 0.18)',
        boxShadow:
          '0 20px 50px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.025)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2.25, sm: 2.75 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid rgba(99, 115, 150, 0.12)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0))',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {/* Header Icon */}
          <Box
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, rgba(34,211,238,0.16), rgba(59,130,246,0.12))',
              border: '1px solid rgba(56,189,248,0.16)',
              boxShadow: '0 8px 24px rgba(14,165,233,0.08)',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#67e8f9',
                lineHeight: 1,
              }}
            >
              ↗
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#f1f5f9',
                fontSize: { xs: '1rem', sm: '1.08rem' },
                fontWeight: 750,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              Recent Transactions
            </Typography>

            <Typography
              sx={{
                color: '#7180a3',
                fontSize: '0.75rem',
                mt: 0.45,
              }}
            >
              Latest financial activity
            </Typography>
          </Box>
        </Box>

        {/* Live Indicator */}
        {!loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.25,
              py: 0.7,
              borderRadius: 999,
              backgroundColor: 'rgba(52, 211, 153, 0.07)',
              border: '1px solid rgba(52, 211, 153, 0.14)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#34d399',
                boxShadow: '0 0 10px rgba(52,211,153,0.75)',
              }}
            />

            <Typography
              sx={{
                color: '#6ee7b7',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
              }}
            >
              LIVE
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          px: { xs: 1.25, sm: 2, md: 2.5 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Empty State */}
        {isEmpty ? (
          <Box
            sx={{
              minHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08))',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.7rem',
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                ≡
              </Typography>
            </Box>

            <Typography
              sx={{
                color: '#cbd5e1',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              No recent transactions
            </Typography>

            <Typography
              sx={{
                color: '#64748b',
                fontSize: '0.75rem',
                mt: 0.7,
                maxWidth: 300,
                lineHeight: 1.6,
              }}
            >
              No transactions match the current filters
            </Typography>
          </Box>
        ) : (
          <List
            disablePadding
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            {rows.map((row, idx) => {
              /* Loading State */
              if (loading) {
                return (
                  <ListItem
                    key={`skeleton-${idx}`}
                    disableGutters
                    sx={{
                      minHeight: 88,
                      px: { xs: 1.25, sm: 1.75 },
                      py: 1.5,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(148,163,184,0.07)',
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={46}
                      height={46}
                      sx={{
                        flexShrink: 0,
                        bgcolor: 'rgba(148,163,184,0.1)',
                        mr: 1.5,
                      }}
                    />

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Skeleton
                        variant="text"
                        width="35%"
                        height={22}
                        sx={{
                          bgcolor: 'rgba(148,163,184,0.09)',
                        }}
                      />

                      <Skeleton
                        variant="text"
                        width="22%"
                        height={18}
                        sx={{
                          bgcolor: 'rgba(148,163,184,0.06)',
                        }}
                      />

                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.75,
                          mt: 0.5,
                        }}
                      >
                        <Skeleton
                          variant="rounded"
                          width={72}
                          height={26}
                          sx={{
                            bgcolor: 'rgba(148,163,184,0.08)',
                            borderRadius: 999,
                          }}
                        />

                        <Skeleton
                          variant="rounded"
                          width={68}
                          height={26}
                          sx={{
                            bgcolor: 'rgba(148,163,184,0.08)',
                            borderRadius: 999,
                          }}
                        />
                      </Box>
                    </Box>

                    <Skeleton
                      variant="text"
                      width={95}
                      height={30}
                      sx={{
                        bgcolor: 'rgba(148,163,184,0.09)',
                        ml: 1,
                      }}
                    />
                  </ListItem>
                );
              }

              const transaction = row as Transaction;
              const isRevenue = transaction.category === 'Revenue';

              return (
                <ListItem
                  key={transaction.id}
                  disableGutters
                  sx={{
                    position: 'relative',
                    minHeight: { xs: 104, sm: 96 },
                    px: { xs: 1.25, sm: 1.75 },
                    py: { xs: 1.5, sm: 1.75 },
                    borderRadius: 3,
                    overflow: 'hidden',

                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012))',

                    border: '1px solid rgba(148,163,184,0.09)',

                    transition:
                      'all 180ms cubic-bezier(0.4,0,0.2,1)',

                    '&:hover': {
                      transform: 'translateX(3px)',
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))',
                      borderColor: isRevenue
                        ? 'rgba(52,211,153,0.22)'
                        : 'rgba(248,113,113,0.22)',
                      boxShadow: isRevenue
                        ? '0 12px 30px rgba(16,185,129,0.07)'
                        : '0 12px 30px rgba(239,68,68,0.06)',
                    },

                    /* Revenue / Expense indicator */
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 16,
                      bottom: 16,
                      width: 3,
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: isRevenue
                        ? '#34d399'
                        : '#f87171',
                      boxShadow: isRevenue
                        ? '0 0 12px rgba(52,211,153,0.35)'
                        : '0 0 12px rgba(248,113,113,0.3)',
                    },
                  }}
                >
                  {/* Avatar */}
                  <Box
                    sx={{
                      width: { xs: 44, sm: 50 },
                      height: { xs: 44, sm: 50 },
                      flexShrink: 0,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: { xs: 1.25, sm: 1.5 },
                      backgroundColor: isRevenue
                        ? 'rgba(52,211,153,0.06)'
                        : 'rgba(248,113,113,0.06)',
                      border: isRevenue
                        ? '1px solid rgba(52,211,153,0.13)'
                        : '1px solid rgba(248,113,113,0.13)',
                    }}
                  >
                    <UserAvatar
                      src={transaction.user_profile}
                      userId={transaction.user_id}
                      size={40}
                      fontScale={0.65}
                    />
                  </Box>

                  {/* LEFT INFORMATION */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* User ID */}
                    <Typography
                      sx={{
                        color: '#e2e8f0',
                        fontSize: {
                          xs: '0.82rem',
                          sm: '0.9rem',
                        },
                        fontWeight: 700,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {transaction.user_id}
                    </Typography>

                    {/* Date + Transaction ID */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        mt: 0.45,
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#7180a3',
                          fontSize: {
                            xs: '0.68rem',
                            sm: '0.72rem',
                          },
                        }}
                      >
                        {formatDate(transaction.date)}
                      </Typography>

                      <Box
                        sx={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          backgroundColor: '#475569',
                        }}
                      />

                      <Typography
                        sx={{
                          color: '#53627f',
                          fontSize: '0.67rem',
                        }}
                      >
                        #{transaction.id}
                      </Typography>
                    </Box>

                    {/* =================================================
                        CATEGORY + STATUS
                        Moved below date and enlarged
                    ================================================= */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        mt: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Category */}
                      <Chip
                        label={transaction.category}
                        size="small"
                        sx={{
                          height: 27,
                          borderRadius: 999,
                          fontSize: {
                            xs: '0.7rem',
                            sm: '0.74rem',
                          },
                          fontWeight: 700,
                          letterSpacing: '0.01em',

                          color: isRevenue
                            ? '#6ee7b7'
                            : '#fca5a5',

                          backgroundColor: isRevenue
                            ? 'rgba(52,211,153,0.10)'
                            : 'rgba(248,113,113,0.10)',

                          border: isRevenue
                            ? '1px solid rgba(52,211,153,0.22)'
                            : '1px solid rgba(248,113,113,0.22)',

                          '& .MuiChip-label': {
                            px: 1.15,
                          },
                        }}
                      />

                      {/* Status */}
                      <Chip
                        label={transaction.status}
                        size="small"
                        sx={{
                          height: 27,
                          borderRadius: 999,
                          fontSize: {
                            xs: '0.7rem',
                            sm: '0.74rem',
                          },
                          fontWeight: 650,
                          letterSpacing: '0.01em',

                          color:
                            transaction.status === 'Paid'
                              ? '#93c5fd'
                              : '#fcd34d',

                          backgroundColor:
                            transaction.status === 'Paid'
                              ? 'rgba(59,130,246,0.10)'
                              : 'rgba(245,158,11,0.10)',

                          border:
                            transaction.status === 'Paid'
                              ? '1px solid rgba(96,165,250,0.22)'
                              : '1px solid rgba(251,191,36,0.22)',

                          '& .MuiChip-label': {
                            px: 1.15,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* =================================================
                      RIGHT SIDE — AMOUNT ONLY
                  ================================================= */}
                  <Box
                    sx={{
                      flexShrink: 0,
                      ml: { xs: 1, sm: 2 },
                      alignSelf: 'flex-start',
                      pt: 0.25,
                    }}
                  >
                    <Typography
                      sx={{
                        color: isRevenue
                          ? '#34d399'
                          : '#f87171',
                        fontSize: {
                          xs: '0.82rem',
                          sm: '0.95rem',
                          md: '1rem',
                        },
                        fontWeight: 800,
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                        whiteSpace: 'nowrap',
                        textAlign: 'right',
                      }}
                    >
                      {isRevenue ? '+' : '−'}
                      {formatCurrency(transaction.amount)}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#475569',
                        fontSize: '0.62rem',
                        textAlign: 'right',
                        mt: 0.35,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {isRevenue ? 'INCOME' : 'EXPENSE'}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default RecentTransactions;