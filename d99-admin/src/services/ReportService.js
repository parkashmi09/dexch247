import api from './api';

export const getAccountStatement = async (params) => {
  const response = await api.post('/admin/reports/accountstatement', params);
  return response.data;
};

export const getUserWinLoss = async (params) => {
  const response = await api.post('/admin/reports/user-win-loss', params);
  return response.data;
};
