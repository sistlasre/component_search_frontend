import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "@fontsource/ibm-plex-sans/400.css"; // Regular weight
import "@fontsource/ibm-plex-sans/500.css"; // Medium weight (good for UI)
import "@fontsource/ibm-plex-sans/700.css"; // Bold
import './App.css';
// Context
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import PartDetail from './components/PartDetail';
import SearchResults from './components/SearchResults';
import SubcategoryPage from './components/SubcategoryPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import VerifyAccount from './components/VerifyAccount';
import AccountManagement from './components/AccountManagement';
import MyOrders from './components/MyOrders';
import PublicRoute from './components/PublicRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <SessionProvider>
      <AuthProvider>
      <CartProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/category/:categoryName" element={<SubcategoryPage />} />
              <Route path="/part/:partNumber" element={<PartDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/account" element={<AccountManagement />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
      </AuthProvider>
      </SessionProvider>
    </Router>
  );
}

export default App;