import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useEffect, useRef, useState } from 'react';
import { extractErrorMessage } from '../services/api';
import { transactionService } from '../services/transactionService';
import {
  EXPORT_COLUMNS,
  type ExportColumnKey,
  type ExportFilterState,
} from '../types/exportCsv';
import { useSnackbar } from '../context/SnackbarContext';

interface ExportCsvDialogProps {
  open: boolean;
  onClose: () => void;
  filters: ExportFilterState;
  on401?: () => void;
}

const ALL_KEYS: ExportColumnKey[] = EXPORT_COLUMNS.map((c) => c.key);

function filtersSummary(f: ExportFilterState): string[] {
  const parts: string[] = [];
  if (f.search) parts.push(`Search: "${f.search}"`);
  if (f.startDate) parts.push(`From ${f.startDate}`);
  if (f.endDate) parts.push(`To ${f.endDate}`);
  if (f.minAmount) parts.push(`Min $${f.minAmount}`);
  if (f.maxAmount) parts.push(`Max $${f.maxAmount}`);
  if (f.category) parts.push(`Category: ${f.category}`);
  if (f.status) parts.push(`Status: ${f.status}`);
  if (f.userId) parts.push(`User: ${f.userId}`);
  return parts;
}

function triggerBrowserDownload(blob: Blob, suggestedName: string): void {
  const url = window.URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }
}



function ExportCsvDialog({ open, onClose, filters, on401 }: ExportCsvDialogProps) {
  const snackbar = useSnackbar();
  const [selected, setSelected] = useState<Set<ExportColumnKey>>(new Set(ALL_KEYS));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noColError, setNoColError] = useState(false);
  const downloadingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setSelected(new Set(ALL_KEYS));
      setError(null);
      setLoading(false);
      setNoColError(false);
      downloadingRef.current = false;
    }
  }, [open]);

  const summary = filtersSummary(filters);

  const toggle = (key: ExportColumnKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setNoColError(false);
  };

  const selectAll = () => setSelected(new Set(ALL_KEYS));
  const clearAll = () => setSelected(new Set());

  const handleDownload = async () => {
    if (downloadingRef.current || loading) return;

    const keys = Array.from(selected);
    if (keys.length === 0) {
      setNoColError(true);
      return;
    }
    downloadingRef.current = true;
    setError(null);
    setLoading(true);
    try {
      const blob = await transactionService.exportCsv(filters, keys);

      const isErrorBlob = blob.type.includes('application/json');
      if (isErrorBlob) {
        try {
          const text = await blob.text();
          const parsed = JSON.parse(text);
          if (parsed?.success === false || parsed?.error) {
            throw new Error(parsed.message ?? 'Export failed');
          }
          if (blob.size < 500 && parsed?.message) {
            throw new Error(parsed.message);
          }
        } catch (e) {
          if (e instanceof Error && e.message) throw e;
        }
      }

      if (blob.size < 20 && blob.type.includes('text/csv')) {
        const text = await blob.text().catch(() => '');
        const hasContent = text.trim().length > 0;
        if (!hasContent) {
          setLoading(false);
          downloadingRef.current = false;
          snackbar.showWarning('No transactions matched your filters — CSV is empty.');
          onClose();
          return;
        }
      }

      const stamp = new Date()
        .toISOString()
        .replace(/[:T]/g, '-')
        .slice(0, 19);
      const filename = `transactions-export-${stamp}.csv`;

      triggerBrowserDownload(blob, filename);

      setTimeout(() => {
        setLoading(false);
        downloadingRef.current = false;
        snackbar.showSuccess(`CSV exported successfully (${keys.length} column${keys.length !== 1 ? 's' : ''}).`);
        onClose();
      }, 500);
    } catch (e: unknown) {
      setLoading(false);
      downloadingRef.current = false;
      const status =
        typeof (e as { response?: { status?: number } }).response?.status === 'number'
          ? (e as { response: { status: number } }).response.status
          : null;
      if (status === 401) {
        on401?.();
        return;
      }
      const msg = extractErrorMessage(e);
      setError(msg);
      snackbar.showError(`Export failed: ${msg}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? () => undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="export-dialog-title"
    >
      <DialogTitle id="export-dialog-title" className="!px-6 !pt-5 !pb-0">
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
          <Box
            className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"
            aria-hidden="true"
          >
            <FileDownloadIcon className="!text-blue-600" />
          </Box>
          <div>
            <Typography variant="h6" className="!font-bold !text-slate-900 !leading-tight">
              Export Transactions
            </Typography>
            <Typography variant="caption" className="!text-slate-500">
              Customize columns and download CSV
            </Typography>
          </div>
        </Box>
      </DialogTitle>

      <Divider className="!mt-4" />

      <DialogContent dividers className="!px-6 !py-5">
        {summary.length > 0 && (
          <Box className="mb-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
            <Typography variant="overline" className="!text-blue-700 !font-semibold">
              Current Filters
            </Typography>
            <Box className="mt-1 flex flex-wrap gap-1.5">
              {summary.map((s, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-blue-100 text-blue-800 !font-medium"
                >
                  {s}
                </Typography>
              ))}
            </Box>
            <Typography variant="caption" className="!mt-2 block !text-blue-600">
              Export will include all matching rows, not only the current page.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            className="!font-semibold !text-slate-700 flex-1 self-center"
          >
            Columns to include
          </Typography>
          <Tooltip title="Select every column">
            <Button
              size="small"
              variant="text"
              startIcon={<SelectAllIcon />}
              onClick={selectAll}
              className="!capitalize"
              disabled={loading}
            >
              Select all
            </Button>
          </Tooltip>
          <Tooltip title="Clear all selections">
            <Button
              size="small"
              variant="text"
              startIcon={<ClearAllIcon />}
              onClick={clearAll}
              className="!capitalize"
              disabled={loading}
            >
              Clear
            </Button>
          </Tooltip>
        </Box>

        <FormControl component="fieldset" error={noColError} fullWidth>
          <FormGroup>
            {EXPORT_COLUMNS.map((col) => (
              <FormControlLabel
                key={col.key}
                label={
                  <Box className="flex items-center justify-between flex-1">
                    <Typography variant="body2" className="!font-medium !text-slate-700">
                      {col.label}
                    </Typography>
                    <Typography variant="caption" className="!text-slate-400">
                      CSV header: {col.csvHeader}
                    </Typography>
                  </Box>
                }
                control={
                  <Checkbox
                    checked={selected.has(col.key)}
                    onChange={() => toggle(col.key)}
                    color="primary"
                    disabled={loading}
                    aria-label={`Include ${col.label} column in export`}
                  />
                }
                className="!mr-0 [&>span:first-child]:!py-1"
              />
            ))}
          </FormGroup>
          {noColError && (
            <Typography variant="caption" color="error" className="!mt-1 block">
              Please select at least one column to export.
            </Typography>
          )}
        </FormControl>

        {error !== null && (
          <Alert severity="error" className="!mt-4 !rounded-xl">
            <AlertTitle>Export failed</AlertTitle>
            {error}
          </Alert>
        )}

        {loading && (
          <Box className="!mt-4" role="status" aria-live="polite">
            <LinearProgress />
            <Typography variant="caption" className="!mt-2 block !text-slate-500 text-center">
              Generating CSV file...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="!px-6 !py-4">
        <Button onClick={onClose} disabled={loading} className="!capitalize">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownload}
          disabled={loading}
          className="!capitalize"
          aria-label="download CSV file with selected columns"
        >
          {loading ? 'Exporting...' : 'Download CSV'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExportCsvDialog;
