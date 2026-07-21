import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../apiservices/axiosClient';
import { useSelector } from 'react-redux';
import { isDemoUser } from '../utils/demoUtils';
import { subscribeToBalanceUpdates, initializeSocket } from '../apiservices/userService';

const ExposureContext = createContext();

const getAuthToken = () => localStorage.getItem('token');

// Fetch user profile to read user_id
const getUserProfileWithWallet = async () => {
  const res = await api.get('/admin/user/profile');
  return res.data?.data?.user || res.data;
};

const readUid = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    const res = await getUserProfileWithWallet();
    return res?.user_id || null;
  } catch (err) {
    console.error('getUserProfileWithWallet error:', err);
    return null;
  }
};

const checkIsAuthenticated = () => !!getAuthToken();

export const ExposureProvider = ({ children }) => {
  const [exposures, setExposures] = useState({});
  const [netExposure, setNetExposure] = useState(0);
  const [balance, setBalance] = useState(0);
  const [inrBalance, setInrBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, balance: reduxBalance, exposure: reduxExposure } = useSelector(
    (state) => state.user
  );
  const isDemo = isDemoUser(user);

  // Fetch exposures + wallet + net-exposure from server
  const refreshAll = useCallback(
    async (uuid) => {
      if (!uuid) return;

      if (isDemo) return;

      if (!checkIsAuthenticated()) {
        setError('Authentication required');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1) per-match exposures
        const eRes = await api.get(`/admin/user/exposures/${uuid}`);
        if (eRes.data?.success) setExposures(eRes.data.exposures);

        // 2) net exposure
        const nRes = await api.get(`/admin/user/net-exposures/${uuid}`);
        if (nRes.data?.success) setNetExposure(Number(nRes.data.exposures));

        // 3) wallet balance
        const wRes = await api.get('/user/balance');
        if (wRes.data?.success && wRes.data?.data) {
          const newBalance = +wRes.data.data.cash;
          const newInrBalance = +wRes.data.data.inr_balance;

          setBalance(newBalance);
          setInrBalance(newInrBalance);

          localStorage.setItem('credit', newBalance.toString());
          localStorage.setItem('credit_inr', newInrBalance.toString());

          window.dispatchEvent(
            new CustomEvent('credit_update', {
              detail: { balance: newBalance, inrBalance: newInrBalance },
            })
          );
        }
      } catch (err) {
        // axiosClient already handles 401 redirects; surface other errors
        if (err?.response?.status !== 401) {
          console.error('ExposureProvider.refreshAll error:', err);
          setError(err.message || 'Failed to fetch data');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isDemo]
  );

  // On mount: seed from storage, then refresh from API if authenticated
  useEffect(() => {
    const init = async () => {
      if (isDemo) {
        setBalance(reduxBalance ?? 1500);
        setInrBalance(reduxBalance ?? 1500);
        return;
      }

      const uid = await readUid();
      setBalance(Number(localStorage.getItem('credit') || 0));
      setInrBalance(Number(localStorage.getItem('credit_inr') || 0));
      if (uid && checkIsAuthenticated()) {
        refreshAll(uid);
      }
    };
    const timer = setTimeout(init, 2000);
    return () => clearTimeout(timer);
  }, [refreshAll, isDemo, reduxBalance]);

  // WebSocket subscription for real-time balance/exposure updates
  useEffect(() => {
    if (isDemo || !checkIsAuthenticated()) return;

    let unsubscribe = null;
    const initSocket = async () => {
      const uid = await readUid();
      if (!uid) return;

      // Guarantee the shared socket exists before subscribing. Otherwise, if
      // this effect runs before any getBalance() call, subscribeToBalanceUpdates
      // would no-op (socket === null) and the header would never receive pushes.
      // initializeSocket is idempotent, so this safely reuses an existing socket.
      initializeSocket(getAuthToken(), uid);

      unsubscribe = subscribeToBalanceUpdates(uid, (data) => {
        if (data.inr_balance !== undefined) {
          setBalance(+data.inr_balance);
          setInrBalance(+data.inr_balance);
          localStorage.setItem('credit', data.inr_balance.toString());
          localStorage.setItem('credit_inr', data.inr_balance.toString());
        }
        if (data.exposure !== undefined) {
          setNetExposure(+data.exposure);
        }
      });
    };

    initSocket();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isDemo]);

  // Patch a single match's exposures optimistically
  const patchMatchExposure = (matchId, newTeams) => {
    if (isDemo) return;
    setExposures((prev) => ({
      ...prev,
      [matchId]: {
        match_title: prev[matchId]?.match_title || '',
        teams: { ...(prev[matchId]?.teams || {}), ...newTeams },
      },
    }));
  };

  // Adjust balance by delta (used after a bet is placed locally)
  const patchBalance = (deltaUSDT, deltaINR = 0) => {
    if (isDemo) return;
    setBalance((prev) => {
      const updated = prev + deltaUSDT;
      localStorage.setItem('credit', updated.toString());
      return updated;
    });
    setInrBalance((prev) => {
      const updated = prev + deltaINR;
      localStorage.setItem('credit_inr', updated.toString());
      return updated;
    });
    window.dispatchEvent(
      new CustomEvent('credit_update', {
        detail: {
          balance: balance + deltaUSDT,
          inrBalance: inrBalance + deltaINR,
        },
      })
    );
  };

  const getMatchExposure = (matchId) => {
    if (isDemo) return 0;
    const match = exposures[matchId];
    if (!match) return 0;
    return Object.values(match.teams || {})
      .filter((v) => v < 0)
      .reduce((a, b) => a + b, 0);
  };

  const totalExposure = isDemo
    ? -(reduxExposure ?? 0).toFixed(2)
    : Number(netExposure).toFixed(2);

  return (
    <ExposureContext.Provider
      value={{
        exposures,
        totalExposure,
        balance: isDemo ? (reduxBalance ?? 1500) : balance,
        inrBalance: isDemo ? (reduxBalance ?? 1500) : inrBalance,
        patchMatchExposure,
        patchBalance,
        refreshAll,
        isLoading,
        error,
        isAuthenticated: checkIsAuthenticated(),
        getMatchExposure,
        readUid,
      }}
    >
      {children}
    </ExposureContext.Provider>
  );
};

export const useExposure = () => useContext(ExposureContext);
