import { API_BASE_URL, API_ENDPOINTS } from '../config/api'
const API_URL = API_BASE_URL;

const checkResponse = async (response) => {
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    try {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Network response was not ok';
        throw new Error(errorMessage);
    } catch (e) {
        // If JSON parse fails or other error, fallback to status text or default
        throw new Error(response.statusText || 'Network response was not ok');
    }
  }
  return response;
};

export const getCasinoGameDetails = async (type, signal = null) => {
  try {
    const response = await fetch(`${API_URL}/casino/casino/all-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        type: type,        
        data: {}           
      }),
      signal
    });

    await checkResponse(response);

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching casino game details:', error);
    throw error;
  }
};

export const Getlivestream = async (gmid, signal = null) => {    
    try {
        const response = await fetch(`${API_URL}/user/cricket/live-stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gmid }),
        signal
        });
        await checkResponse(response);
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request cancelled:', error.message);
            return null;
        }
        console.error('Error fetching livestream:', error);
        throw error;
    }
}

export const placeCasinoBet = async (betData, signal = null) => {
  try {
    const response = await fetch(`${API_URL}/casino/casino/placebet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(betData),
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error placing casino bet:', error);
    throw error;
  }
};

export const getMatchExposure = async (userId, matchId, signal = null) => {
  try {
    const response = await fetch(`${API_URL}/user/exposures/get-exposure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        user_id: userId,
        match_id: matchId
      }),
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching match exposure:', error);
    throw error;
  }
};

export const getMyBets = async (userId, matchId, signal = null) => {
  try {
    const response = await fetch(`${API_URL}/casino/casino/mybets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        user_id: userId,
        match_id: matchId
      }),
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching my bets:', error);
    throw error;
  }
};

/**
 * Casino open/downline bets – same API as lord-admin My Bets.
 * GET .../bet-list/casino/open-downline?gameName={gameName}
 * Poll every 5s on game pages. Returns { success, data: [] }.
 */
export const getCasinoOpenBets = async (gameName, signal = null) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('staffToken') || localStorage.getItem('ownerToken');
    const url = `${API_URL}/d99/bet-list/casino/open-downline${gameName ? `?gameName=${encodeURIComponent(gameName)}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching casino open bets:', error);
    throw error;
  }
};

/**
 * Casino all-downline bets – for View More modal (full list).
 * GET .../bet-list/casino/all-downline?gameName={gameName}
 * Returns { success, data: [] }. Same pattern as lord-admin.
 */
export const getCasinoAllBets = async (gameName, signal = null) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('staffToken') || localStorage.getItem('ownerToken');
    const url = `${API_URL}/d99/bet-list/casino/all-downline${gameName ? `?gameName=${encodeURIComponent(gameName)}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching casino all bets:', error);
    throw error;
  }
};

export const getLastResults = async (type, signal = null) => {
  try {
    const response = await fetch(`${API_URL}/casino/casino/last-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching last results:', error);
    throw error;
  }
};

export const getDetailResults = async (type, mid, signal = null) => {
  try {
    const response = await fetch(`${API_URL}/casino/casino/detail-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, mid }),
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching detail results:', error);
    throw error;
  }
};

export const getUserExposure = async (userId, signal = null) => {
  try {
    const response = await fetch(`${API_URL}/user/bets/exposure/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      signal
    });

    await checkResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', error.message);
      return null;
    }
    console.error('Error fetching user exposure:', error);
    throw error;
  }
};