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

interface AppLayoutProps {
  children: ReactNode;
}

const drawerWidth = 260;

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/transactions', label: 'Transactions', icon: <ReceiptLongIcon /> },
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
    <div className="flex flex-col h-full">
      <Toolbar className="!px-5 flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow cursor-pointer"
          onClick={() => navigateTo('/dashboard')}
        >
          F
        </div>
        <Typography
          variant="h6"
          className="!font-bold cursor-pointer text-slate-800"
          onClick={() => navigateTo('/dashboard')}
        >
          Financial
        </Typography>
      </Toolbar>
      <Divider />
      <List className="py-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding className="!px-3">
              <ListItemButton
                onClick={() => navigateTo(item.path)}
                selected={active}
                className={`!rounded-lg !my-0.5 !px-3 ${
                  active
                    ? '!bg-blue-50 !text-blue-700 hover:!bg-blue-50'
                    : '!text-slate-600 hover:!bg-slate-50'
                }`}
              >
                <ListItemIcon
                  className={active ? '!text-blue-600 !min-w-[40px]' : '!min-w-[40px] !text-slate-500'}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.95rem',
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
      <Divider />
      <div className="p-4">
        <Typography variant="caption" className="!text-slate-400">
          Loopr AI · Analytics
        </Typography>
      </div>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fb' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar className="!min-h-[64px]">
          <Tooltip title="Open navigation menu" placement="bottom">
            <IconButton
              color="inherit"
              aria-label="open navigation drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="h6" noWrap component="div" className="!font-semibold !text-slate-800">
            Analytics Overview
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box className="flex items-center gap-2">
            <Box
              className="hidden sm:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200"
            >
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <Typography variant="caption" className="!text-slate-600">
                Live
              </Typography>
            </Box>
            <Tooltip title={user?.email ?? ''}>
              <Typography
                variant="body2"
                className="!mr-2 hidden md:!inline !text-slate-600"
              >
                {user?.email}
              </Typography>
            </Tooltip>
            <Tooltip title={user ? `Account menu (${user.email})` : 'Account menu'} placement="bottom-end">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                className="!bg-slate-100 hover:!bg-slate-200"
              >
                <AccountCircle className="!text-slate-700" />
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
              borderRight: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
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
              borderRight: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
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
        <Toolbar />
        <div className="w-full p-4 sm:p-6 md:p-8">{children}</div>
      </Box>
    </Box>
  );
}

export default AppLayout;
