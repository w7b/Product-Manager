import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ProductsPage from '../pages/dashboard/ProductsPage'
import ProductDetailPage from '../pages/dashboard/ProductDetailPage'
import CategoriesPage from '../pages/dashboard/CategoriesPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import StockPage from '../pages/dashboard/StockPage'
import OrdersPage from '../pages/dashboard/OrdersPage'
import OrderDetailPage from '../pages/dashboard/OrderDetailPage'
import UsersPage from '../pages/dashboard/UsersPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/dashboard" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Private — wrapped in AppLayout */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"            element={<DashboardPage />} />
        <Route path="products"             element={<ProductsPage />} />
        <Route path="products/:id"         element={<ProductDetailPage />} />
        <Route path="categories"           element={<CategoriesPage />} />
        <Route path="stock"                element={<StockPage />} />
        <Route path="orders"               element={<OrdersPage />} />
        <Route path="orders/:id"           element={<OrderDetailPage />} />
        <Route path="users"                element={<AdminRoute><UsersPage /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
