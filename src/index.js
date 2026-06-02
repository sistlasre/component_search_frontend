import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import ReactGA from 'react-ga4';


// 1. Define the global gtag function manually to force browser-level consent
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

gtag('consent', 'default', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});
// Initialize GA4 with your Measurement ID
ReactGA.initialize('G-BE3QMHZ0JD');
// Send the initial pageview (which grabs the UTMs from the URL)
ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);