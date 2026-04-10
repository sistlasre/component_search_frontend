import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Context
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import PartDetail from './components/PartDetail';
import SearchResults from './components/SearchResults';
import SubcategoryPage from './components/SubcategoryPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/category/:categoryName" element={<SubcategoryPage />} />
              <Route path="/part/:partNumber" element={<PartDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;