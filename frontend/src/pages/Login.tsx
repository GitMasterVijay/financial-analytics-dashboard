import { zodResolver } from '@hookform/resolvers/zod';
import {
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
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { type LoginFormData, loginSchema } from '../types/auth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
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
  >
    <path
      d="M12 7C14.76 7 17 9.24 17 12C17 12.94 16.74 13.82 16.32 14.61L19 17.29C20.41 15.79 21.5 13.96 22 12C20.27 7.61 16.05 4.5 11 4.5L11.71 5.21C11.8 5.3 11.89 5.39 11.99 5.47ZM2.71 2.71L1.39 4.03L5.25 7.89C2.25 9.72 0.33 12.74 0 12C1.73 16.39 5.95 19.5 11 19.5C12.89 19.5 14.68 19.03 16.23 18.18L19.98 21.93L21.29 20.62L2.71 2.71ZM11 19.5C6.27 19.5 2.3 16.48 1.2 12.04C2.57 9.73 4.68 7.89 7.22 6.87L10.59 10.24C10.21 10.76 10 11.35 10 12C10 13.66 11.34 15 13 15C13.65 15 14.24 14.79 14.76 14.41L18.1 17.75C16.04 18.92 13.64 19.5 11 19.5ZM9.18 5.12L12.19 8.13C12.46 8.05 12.73 8 13 8C15.24 8 17 9.76 17 12C17 12.27 16.95 12.54 16.87 12.81L18.86 14.8C19.44 13.95 19.92 13.01 20.26 12C18.5 8.46 15.04 6 11 6C10.39 6 9.8 6.05 9.22 6.15L9.18 5.12Z"
      fill="currentColor"
    />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (_data: LoginFormData) => {
    setIsSubmitting(true);
    // Simulate async submission; API integration will be added in a later step
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
            px: 2,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: '100%',
              maxWidth: 440,
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 2,
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                Financial Analytics
              </Typography>
              <Typography
                component="h2"
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Dashboard
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ width: '100%' }}
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
                          tabIndex={-1}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:disabled': {
                    opacity: 0.7,
                  },
                }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </Paper>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 4 }}
          >
            Welcome back. Please sign in to access your analytics dashboard.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Login;
