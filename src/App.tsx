import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
<<<<<<< HEAD
=======
const CategoryPage = lazy(() => import('./pages/Category'));
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Auth = lazy(() => import('./pages/Auth'));
const Account = lazy(() => import('./pages/Account'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminHomepage = lazy(() => import('./pages/admin/AdminHomepage'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));

<<<<<<< HEAD
import Loader from './components/Loader';

const queryClient = new QueryClient();

function PageLoader() {
  return <Loader text="Loading page" />;
=======
const queryClient = new QueryClient();

function PageLoader() {
  return <div className="py-20 text-center text-ink-400 text-sm">Loading...</div>;
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#0a0a0a', color: '#fff', fontSize: '13px', borderRadius: '0' } }} />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
<<<<<<< HEAD
                <Route path="/category/:slug" element={<Shop />} />
=======
                <Route path="/category/:slug" element={<CategoryPage />} />
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                <Route path="/login" element={<Auth mode="login" />} />
                <Route path="/register" element={<Auth mode="register" />} />
                <Route path="/account" element={<Account />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
