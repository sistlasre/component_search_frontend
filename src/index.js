import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import ReactGA from 'react-ga4';

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