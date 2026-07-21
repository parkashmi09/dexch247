import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  subscribeToRealTimeUpdates,
  updateBalanceRealTime,
  updateTransactionsRealTime,
  setRealTimeConnectionStatus,
} from '../features/user/userSlice';
import {
  getSocket,
  subscribeToBalanceUpdates,
  subscribeToTransactionUpdates,
  disconnectSocket,
} from '../apiservices/userService';

export const useRealTime = () => {
  const dispatch = useDispatch();
  const { user, realTimeConnected } = useSelector((state) => state.user);

  // Initialize real-time socket connection via Redux thunk
  const initializeRealTime = useCallback(() => {
    if (user?.user_id && !realTimeConnected) {
      dispatch(subscribeToRealTimeUpdates());
    }
  }, [dispatch, user?.user_id, realTimeConnected]);

  // Emit a manual balance refresh request over the socket
  const requestBalanceUpdate = useCallback(() => {
    const socket = getSocket();
    if (socket && user?.user_id) {
      socket.emit('getBalance', { userId: user.user_id });
    }
  }, [user?.user_id]);

  // Tear down the socket and mark disconnected in Redux
  const disconnectRealTime = useCallback(() => {
    disconnectSocket();
    dispatch(setRealTimeConnectionStatus(false));
  }, [dispatch]);

  // Subscribe to balance updates; dispatches to Redux and calls optional callback
  const subscribeToBalance = useCallback(
    (callback) => {
      if (!user?.user_id) return null;

      return subscribeToBalanceUpdates(user.user_id, (balance) => {
        dispatch(updateBalanceRealTime(balance));
        if (callback) callback(balance);
      });
    },
    [dispatch, user?.user_id]
  );

  // Subscribe to transaction updates; dispatches to Redux and calls optional callback
  const subscribeToTransactions = useCallback(
    (callback) => {
      if (!user?.user_id) return null;

      return subscribeToTransactionUpdates(user.user_id, (transactions) => {
        dispatch(updateTransactionsRealTime(transactions));
        if (callback) callback(transactions);
      });
    },
    [dispatch, user?.user_id]
  );

  // Auto-initialize on mount; clean up on unmount
  useEffect(() => {
    initializeRealTime();

    return () => {
      if (realTimeConnected) {
        disconnectRealTime();
      }
    };
  }, [initializeRealTime, realTimeConnected, disconnectRealTime]);

  return {
    realTimeConnected,
    initializeRealTime,
    requestBalanceUpdate,
    disconnectRealTime,
    subscribeToBalance,
    subscribeToTransactions,
    socket: getSocket(),
  };
};
