import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Transactions from '../pages/Transactions';
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Transactions />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
]);

export default router;
