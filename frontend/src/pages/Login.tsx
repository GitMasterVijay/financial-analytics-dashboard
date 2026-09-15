import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type LoginFormData, loginSchema } from '../types/auth';
import { useSnackbar } from '../context/SnackbarContext';

const darkLoginTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: { main: '#10b981' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    info: { main: '#8b5cf6' },
    background: {
      default: '#0b1020',
      paper: '#151d33',
    },
    text: {
      primary: '#e5e9f2',
      secondary: '#aab4cf',
    },
    divider: '#263253',
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#263253',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b82f6',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { slotProps: { inputLabel: { shrink: true } } },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        contained: {
          boxShadow: '0 6px 18px -6px rgba(59,130,246,0.55)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

const VisibilityIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
      fill="currentColor"
    />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 7C14.76 7 17 9.24 17 12C17 12.94 16.74 13.82 16.32 14.61L19 17.29C20.41 15.79 21.5 13.96 22 12C20.27 7.61 16.05 4.5 11 4.5L11.71 5.21C11.8 5.3 11.89 5.39 11.99 5.47ZM2.71 2.71L1.39 4.03L5.25 7.89C2.25 9.72 0.33 12.74 0 12C1.73 16.39 5.95 19.5 11 19.5C12.89 19.5 14.68 19.03 16.23 18.18L19.98 21.93L21.29 20.62L2.71 2.71ZM11 19.5C6.27 19.5 2.3 16.48 1.2 12.04C2.57 9.73 4.68 7.89 7.22 6.87L10.59 10.24C10.21 10.76 10 11.35 10 12C10 13.66 11.34 15 13 15C13.65 15 14.24 14.79 14.76 14.41L18.1 17.75C16.04 18.92 13.64 19.5 11 19.5ZM9.18 5.12L12.19 8.13C12.46 8.05 12.73 8 13 8C15.24 8 17 9.76 17 12C17 12.27 16.95 12.54 16.87 12.81L18.86 14.8C19.44 13.95 19.92 13.01 20.26 12C18.5 8.46 15.04 6 11 6C10.39 6 9.8 6.05 9.22 6.15L9.18 5.12Z"
      fill="currentColor"
    />
  </svg>
);

function Login() {
  const { isAuthenticated, isLoading, login, logoutReason } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const snackbar = useSnackbar();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (logoutReason) {
      setInfoMessage(logoutReason);
    }
  }, [logoutReason]);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await login(data.email, data.password);
      snackbar.showSuccess('Signed in successfully.');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Sign in failed. Please try again.');
      }
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={darkLoginTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#0b1020',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '50%',
              height: '50%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '50%',
              height: '50%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <CircularProgress size={44} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Verifying your session...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <ThemeProvider theme={darkLoginTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="lg" disableGutters>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              p: 6,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '-15%',
                left: '-20%',
                width: '70%',
                height: '60%',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '-20%',
                right: '-15%',
                width: '70%',
                height: '60%',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 6,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    background:
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px -8px rgba(16,185,129,0.6)',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 19L8.5 12L12 16L17 9L20.5 13.5"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: '#e5e9f2', letterSpacing: '-0.01em' }}
                  >
                    Fin<span style={{ color: '#34d399' }}>Flow</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', letterSpacing: '0.08em' }}>
                    ANALYTICS SUITE
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: '#e5e9f2',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  mb: 2,
                  fontSize: { md: '2.75rem', lg: '3.25rem' },
                }}
              >
                Financial clarity,
                <br />
                <Box
                  component="span"
                  sx={{
                    background:
                      'linear-gradient(90deg, #34d399 0%, #60a5fa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  delivered simply.
                </Box>
              </Typography>

              <Typography variant="body1" sx={{ color: '#8892b0', maxWidth: 480, mb: 6 }}>
                Unlock powerful insights into your company's revenue streams, expense
                patterns, and savings trajectory — all in one secure analytics
                workspace.
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  maxWidth: 480,
                }}
              >
                {[
                  {
                    title: 'Real-time analytics',
                    desc: 'Live dashboards with filters, sorting, and precise INR formatting.',
                    color: '#34d399',
                  },
                  {
                    title: 'Granular transaction search',
                    desc: 'Pinpoint records by user, category, status, amount, and date ranges.',
                    color: '#60a5fa',
                  },
                  {
                    title: 'Secure CSV export',
                    desc: 'Export filtered reports for compliance and reconciliation workflows.',
                    color: '#a78bfa',
                  },
                ].map((f) => (
                  <Box
                    key={f.title}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid #263253',
                      bgcolor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: f.color,
                        boxShadow: `0 0 10px ${f.color}`,
                        mt: 1,
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: '#e5e9f2', mb: 0.5 }}
                      >
                        {f.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8892b0' }}>
                        {f.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
              px: 2,
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: { md: 'none' },
                alignItems: 'center',
                gap: 1.5,
                mb: 5,
              }}
              className="!flex"
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background:
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px -6px rgba(16,185,129,0.5)',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 19L8.5 12L12 16L17 9L20.5 13.5"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: '#e5e9f2', letterSpacing: '-0.01em' }}
              >
                Fin<span style={{ color: '#34d399' }}>Flow</span>
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                width: '100%',
                maxWidth: 460,
                p: { xs: 3.5, sm: 5 },
                borderRadius: 4,
                border: '1px solid #263253',
                boxShadow: '0 20px 60px -20px rgba(0,0,0,0.6)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <Box sx={{ mb: 4, textAlign: 'left' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#e5e9f2',
                    mb: 1,
                    fontSize: { xs: '1.6rem', sm: '1.9rem' },
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  Welcome back
                </Typography>
                <Typography variant="body1" sx={{ color: '#8892b0' }}>
                  Sign in to access your analytics dashboard.
                </Typography>
              </Box>

              {infoMessage !== null && (
                <Alert
                  severity="info"
                  sx={{ mb: 3, borderRadius: 3 }}
                  onClose={() => setInfoMessage(null)}
                >
                  {infoMessage}
                </Alert>
              )}

              {errorMessage !== null && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                  {errorMessage}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ width: '100%' }}
                aria-label="sign in form"
              >
                <TextField
                  {...register('email')}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isSubmitting}
                  sx={{ mb: 2 }}
                />

                <TextField
                  {...register('password')}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isSubmitting}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'hide password' : 'show password'}
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            disabled={isSubmitting}
                            tabIndex={0}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ mb: 3.5 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  aria-disabled={isSubmitting}
                  sx={{
                    py: 1.75,
                    fontWeight: 700,
                    fontSize: '1rem',
                    '&:disabled': { opacity: 0.7 },
                  }}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} color="inherit" thickness={5} />
                      <span>Signing in...</span>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Box>
            </Paper>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4, color: '#64748b', maxWidth: 460 }}
            >
              Secure workspace. Your session is protected with JWT authentication
              and your data never leaves your infrastructure.
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Login;
