import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';

// Check browser cookie/local storage settings before initializing
const hasConsent = localStorage.getItem('cookie-consent') === 'granted';

if (hasConsent && window.gtag) {
  // 1. Update consent settings to granted
  window.gtag('consent', 'update', {
    'ad_storage': 'granted',
    'analytics_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted'
  });
  // 2. Safely fire the pageview with UTM parameters intact
  window.gtag('config', 'G-BE3QMHZ0JD');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);