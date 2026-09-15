import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import router from './routes/AppRoutes';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0b1020',
      paper: '#151d33',
    },
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    divider: '#263253',
    text: {
      primary: '#e5e9f2',
      secondary: '#aab4cf',
      disabled: '#7683a6',
    },
    action: {
      hover: 'rgba(59, 130, 246, 0.08)',
      selected: 'rgba(59, 130, 246, 0.14)',
      hoverOpacity: 0.08,
      disabledOpacity: 0.5,
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
    overline: { fontWeight: 600, letterSpacing: '0.08em' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: 10,
          boxShadow: 'none',
          ...(ownerState.variant === 'contained' && {
            '&:hover': { boxShadow: '0 4px 12px -4px rgba(59,130,246,0.4)' },
          }),
        }),
        sizeSmall: { paddingInline: '14px', fontSize: '0.82rem' },
        sizeMedium: { paddingInline: '18px', fontSize: '0.88rem' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        outlined: { borderWidth: '1.5px' },
      },
    },
    MuiTextField: {
      defaultProps: {
        slotProps: {
          inputLabel: { shrink: true },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#101a33',
          '& fieldset': { borderColor: '#263253' },
          '&:hover fieldset': { borderColor: '#334372 !important' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#101a33',
          '& fieldset': { borderColor: '#263253' },
          '&:hover fieldset': { borderColor: '#334372 !important' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: '#aab4cf' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#1a2440',
            color: '#aab4cf',
            fontWeight: 700,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#263253', color: '#e5e9f2' },
        body: { color: '#e5e9f2' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover .MuiTableCell-body': { backgroundColor: '#1a2440' },
          '&.Mui-selected .MuiTableCell-body': { backgroundColor: '#1e2a4a' },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: '#aab4cf',
          borderColor: '#263253',
          '&.Mui-selected': {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#2563eb' },
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: '#263253' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#151d33',
          backgroundImage: 'none',
          border: '1px solid #263253',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.6)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#151d33',
          backgroundImage: 'none',
          border: '1px solid #263253',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          border: '1px solid transparent',
          backgroundImage: 'none',
          ...(ownerState.severity === 'success' && {
            backgroundColor: 'rgba(16,185,129,0.12)',
            borderColor: 'rgba(16,185,129,0.3)',
            color: '#6ee7b7',
            [`.${theme.palette.mode === 'dark' ? 'MuiAlert-icon' : 'MuiSvgIcon-root'}`]: {
              color: '#34d399',
            },
          }),
          ...(ownerState.severity === 'error' && {
            backgroundColor: 'rgba(239,68,68,0.12)',
            borderColor: 'rgba(239,68,68,0.3)',
            color: '#fca5a5',
          }),
          ...(ownerState.severity === 'warning' && {
            backgroundColor: 'rgba(245,158,11,0.14)',
            borderColor: 'rgba(245,158,11,0.3)',
            color: '#fcd34d',
          }),
          ...(ownerState.severity === 'info' && {
            backgroundColor: 'rgba(59,130,246,0.14)',
            borderColor: 'rgba(59,130,246,0.3)',
            color: '#93c5fd',
          }),
        }),
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
