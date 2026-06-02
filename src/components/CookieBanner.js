import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice in the past
    const consentChoice = localStorage.getItem('cookie-consent');
    if (!consentChoice) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // 1. Save setting so they don't see the banner next time
    localStorage.setItem('cookie-consent', 'granted');
    setIsVisible(false);
    // 2. Explicitly update and fire the hit right now
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
      window.gtag('config', 'G-BE3QMHZ0JD');
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#222', color: '#fff', padding: '15px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 9999, fontFamily: 'sans-serif'
    }}>
      <span>We use cookies to optimize your search experience and track campaign metrics.</span>
      <button onClick={handleAccept} style={{
        background: '#007bff', color: '#fff', border: 'none',
        padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'
      }}>
        Accept Cookies
      </button>
    </div>
  );
}