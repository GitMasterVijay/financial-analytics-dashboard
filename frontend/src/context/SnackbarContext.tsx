import { Alert, type AlertColor, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
  duration: number;
}

interface SnackbarContextValue {
  showSuccess: (message: string, durationMs?: number) => void;
  showError: (message: string, durationMs?: number) => void;
  showWarning: (message: string, durationMs?: number) => void;
  showInfo: (message: string, durationMs?: number) => void;
  hide: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
    duration: 4000,
  });

  const show = useCallback(
    (message: string, severity: AlertColor, durationMs = 4000) => {
      setState({ open: true, message, severity, duration: durationMs });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, durationMs = 3500) => show(message, 'success', durationMs),
    [show]
  );

  const showError = useCallback(
    (message: string, durationMs = 5000) => show(message, 'error', durationMs),
    [show]
  );

  const showWarning = useCallback(
    (message: string, durationMs = 4500) => show(message, 'warning', durationMs),
    [show]
  );

  const showInfo = useCallback(
    (message: string, durationMs = 4000) => show(message, 'info', durationMs),
    [show]
  );

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo<SnackbarContextValue>(
    () => ({ showSuccess, showError, showWarning, showInfo, hide }),
    [showSuccess, showError, showWarning, showInfo, hide]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={state.duration}
        onClose={hide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={hide}
          severity={state.severity}
          variant="filled"
          sx={{
            width: '100%',
            minWidth: { xs: 280, sm: 360 },
            borderRadius: 2,
            boxShadow: '0 10px 25px -10px rgba(15,23,42,0.25)',
          }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (ctx === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return ctx;
}
