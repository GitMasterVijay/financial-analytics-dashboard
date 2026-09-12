import { AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState, type MouseEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login', { replace: true });
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" component="header">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              cursor: 'pointer',
              mr: 3,
              userSelect: 'none',
            }}
            onClick={() => navigateTo('/dashboard')}
          >
            Financial Analytics
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigateTo('/dashboard')}
              sx={{
                fontWeight: location.pathname === '/dashboard' ? 700 : 400,
                backgroundColor: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
              }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              onClick={() => navigateTo('/transactions')}
              sx={{
                fontWeight: location.pathname === '/transactions' ? 700 : 400,
                backgroundColor: location.pathname === '/transactions' ? 'rgba(255,255,255,0.08)' : 'transparent',
              }}
            >
              Transactions
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={user?.email ?? ''}>
              <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
                {user?.email}
              </Typography>
            </Tooltip>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Signed in as
                </Typography>
              </MenuItem>
              <MenuItem disabled sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;
