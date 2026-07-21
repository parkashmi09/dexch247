import { useEffect, useState } from 'react';
import {
  getBalance,
  requestBalanceUpdate,
  subscribeToBalanceUpdates,
  clearSocket,
} from '../apiservices/userService';

export function useRealTimeBalance(userId, token) {
  const [balance, setBalance] = useState(null);
  const [exposure, setExposure] = useState(null);

  useEffect(() => {
    let unsubscribe;

    if (userId && token) {
      // Step 1: Initial API fetch (also initializes the socket)
      getBalance(token, userId)
        .then((data) => {
          setBalance(data.inr_balance);
          setExposure(data.exposure);

          // Step 2: Ask the server to push a fresh update via the socket
          setTimeout(() => {
            requestBalanceUpdate(userId);
          }, 500);
        })
        .catch((err) => {
          console.error('useRealTimeBalance: error fetching balance:', err);
        });

      // Step 3: Listen for real-time push updates
      unsubscribe = subscribeToBalanceUpdates(userId, (balanceData) => {
        setBalance(balanceData.inr_balance);
        setExposure(balanceData.exposure);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, token]);

  return { balance, exposure };
}
