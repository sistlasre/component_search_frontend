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
    // 1. Tell the browser window to update Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }

    // 2. Save preference and hide banner
    localStorage.setItem('cookie-consent', 'granted');
    setIsVisible(false);

    // FORCE A FRESH PAGEVIEW EVENT RIGHT AFTER THE UPDATE
    // This sends a pristine payload to Google using the newly unlocked consent states
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title
      });
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