import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

interface AppLayoutProps {
  children: ReactNode;
}

const drawerWidth = 268;

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
  { path: '/transactions', label: 'Transactions', icon: <ReceiptLongIcon sx={{ fontSize: 20 }} /> },
];

function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((v) => !v);
  };

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
    setMobileOpen(false);
  };

  const drawer = (
    <div className="flex flex-col h-full bg-app-nav text-text-primary">
      <Toolbar
        className="!px-6 !min-h-[72px] flex items-center gap-3 border-b border-border-subtle"
        disableGutters
      >
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-[0_4px_12px_-4px_rgba(16,185,129,0.5)] cursor-pointer"
          onClick={() => navigateTo('/dashboard')}
          aria-label="Go to dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 17L9 11L13 15L21 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 7H21V13"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          className="cursor-pointer select-none"
          onClick={() => navigateTo('/dashboard')}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}
            className="!text-text-primary"
          >
            Fin<span className="text-accent-green">Flow</span>
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: '0.68rem', fontWeight: 500 }}
            className="!text-text-tertiary block !mt-0"
          >
            Analytics Suite
          </Typography>
        </div>
      </Toolbar>

      <div className="px-4 pt-5 pb-2">
        <Typography
          variant="overline"
          sx={{ fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 700 }}
          className="!text-text-tertiary"
        >
          Overview
        </Typography>
      </div>
      <List className="py-1 flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding className="!mb-1">
              <ListItemButton
                onClick={() => navigateTo(item.path)}
                selected={active}
                className="!rounded-xl !px-3 !py-2.5 relative overflow-hidden group"
                sx={{
                  backgroundColor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                  '&:hover': {
                    backgroundColor: active ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
                  },
                }}
              >
                {active && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: '18%',
                      bottom: '18%',
                      width: 3,
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: '#3b82f6',
                      boxShadow: '0 0 12px 1px rgba(59,130,246,0.6)',
                    }}
                  />
                )}
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? '#60a5fa' : '#7683a6',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.93rem',
                        color: active ? '#e5e9f2' : '#aab4cf',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#263253' }} />
      <div className="p-4">
        <Box className="rounded-xl p-3 bg-app-card border border-border-subtle">
          <Typography variant="caption" className="!text-text-tertiary block !mb-1.5">
            Signed in
          </Typography>
          <Box className="flex items-center gap-2.5 min-w-0">
            <UserAvatar
              src="/analyst-avatar.svg"
              userId={user?.email ?? 'user'}
              size={30}
            />
            <Box className="min-w-0 flex-1">
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                className="!text-text-primary"
              >
                {user?.email ?? 'Analyst User'}
              </Typography>
              <Typography
                variant="caption"
                className="!text-text-tertiary block"
              >
                Analyst
              </Typography>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0b1020' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#0f172a',
          color: '#e5e9f2',
          borderBottom: '1px solid #263253',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar className="!min-h-[68px]">
          <Tooltip title="Open navigation menu" placement="bottom">
            <IconButton
              color="inherit"
              aria-label="open navigation drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: 'none' },
                color: '#aab4cf',
                '&:hover': { color: '#e5e9f2' },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Box className="flex flex-col">
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' } }}
              className="!text-text-primary"
            >
              {location.pathname.startsWith('/transactions')
                ? 'Transactions'
                : 'Dashboard Overview'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.75rem' }}
              className="!text-text-tertiary"
            >
              Financial performance · live data
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box className="flex items-center gap-2 sm:gap-3">
            <Box
              className="hidden sm:flex items-center gap-2 mr-1 px-3.5 py-1.5 rounded-full bg-app-card border border-border-subtle"
            >
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                <div
                  className="absolute inset-0 w-2 h-2 rounded-full bg-accent-green"
                  style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                />
              </div>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                className="!text-text-secondary"
              >
                Live
              </Typography>
            </Box>

            <Tooltip title={user?.email ?? ''} placement="bottom">
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  maxWidth: 180,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                className="!mr-1 hidden md:!inline !text-text-secondary"
              >
                {user?.email}
              </Typography>
            </Tooltip>

            <Tooltip
              title={user ? `Account menu (${user.email})` : 'Account menu'}
              placement="bottom-end"
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                className="!border !border-border-subtle !bg-app-card hover:!bg-app-card-2 !transition-colors"
                sx={{ p: 0.5, width: 42, height: 42 }}
              >
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user?.email ? (
                    <UserAvatar src="/analyst-avatar.svg" userId={user.email} size={34} />
                  ) : (
                    <AccountCircle sx={{ color: '#aab4cf', fontSize: 28 }} />
                  )}
                </Box>
              </IconButton>
            </Tooltip>
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
              <MenuItem disabled sx={{ pb: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }} className="!text-text-tertiary">
                  Signed in as
                </Typography>
              </MenuItem>
              <MenuItem disabled sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} className="!text-text-primary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5, borderColor: '#263253' }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#fca5a5', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="dashboard navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #263253',
              bgcolor: '#0f172a',
              backgroundImage: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #263253',
              bgcolor: '#0f172a',
              backgroundImage: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="flex-1 w-full"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '68px', sm: '68px' } }} />
        <div className="w-full p-4 sm:p-6 md:p-8">{children}</div>
      </Box>
    </Box>
  );
}

export default AppLayout;
