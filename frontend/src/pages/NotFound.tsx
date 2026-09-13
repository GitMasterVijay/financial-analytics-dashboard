import { Box, Button, Container, CssBaseline, Paper, ThemeProvider, Typography, createTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const goHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    document.title = '404 — Page Not Found | Financial Analytics';
    return () => {
      document.title = 'Financial Analytics Dashboard';
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f7fb',
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6, md: 8 },
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 40px -20px rgba(15,23,42,0.15)',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '5rem', sm: '7rem', md: '8rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1 0%, #1976d2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                mb: 2,
              }}
              aria-label="404"
            >
              404
            </Typography>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                mb: 1.5,
                fontSize: { xs: '1.4rem', sm: '1.75rem' },
              }}
            >
              Page Not Found
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                mb: 4,
                maxWidth: 360,
                mx: 'auto',
              }}
            >
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={goHome}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '1rem',
              }}
            >
              {isLoading
                ? 'Loading...'
                : isAuthenticated
                  ? 'Back to Dashboard'
                  : 'Back to Login'}
            </Button>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default NotFound;
