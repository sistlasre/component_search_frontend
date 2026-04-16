import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, getOrCreateSessionId } from '../services/userManagementService';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());

  useEffect(() => {
    // Fire-and-forget: register/refresh the session row. Failures are
    // non-fatal — the local id is still usable for queuing cart mutations
    // and will get registered on the next successful call.
    let cancelled = false;
    const register = async () => {
      try {
        const resp = await apiService.ensureSession();
        if (!cancelled && resp?.data?.session?.session_id) {
          setSessionId(resp.data.session.session_id);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Session registration failed:', err?.message || err);
      }
    };
    register();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
};
