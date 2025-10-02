import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
// Email verification pages removed - using simple registration + admin bulk email
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminBlog from './pages/admin/AdminBlog';
import AdminGallery from './pages/admin/AdminGallery';
import AdminEmail from './pages/admin/AdminEmail';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
            {/* Email verification routes removed - using simple registration */}
                  
                  {/* Protected Routes */}
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-orders" element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/order/:id" element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products" element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  } />
                  <Route path="/admin/blog" element={
                    <AdminRoute>
                      <AdminBlog />
                    </AdminRoute>
                  } />
                  <Route path="/admin/gallery" element={
                    <AdminRoute>
                      <AdminGallery />
                    </AdminRoute>
                  } />
                  <Route path="/admin/email" element={
                    <AdminRoute>
                      <AdminEmail />
                    </AdminRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
