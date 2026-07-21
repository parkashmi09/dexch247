
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { useSelector, useDispatch } from "react-redux";
// import { launchLivecasinoGame, getLivecasinoGames } from "../../../apiservices/livecasinoApi";
// import { getUserProfileWithWallet } from "../../../apiservices/userProfileService";
// import { updateUser, updateUserBalanceAndExposure } from "../../../features/user/userSlice";

import logo from "../../../assets/img/d99logo.png";
import styles from "./LaunchedLiveSection.module.css";

export default function LaunchedLiveSection() {
  const { vendor, gameId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [gameName, setGameName] = useState(null);
  const dispatch = useDispatch();
  const reduxBalance = useSelector((state) => state.user.balance);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch user profile on mount
  useEffect(() => {
    if (!token) return;
    getUserProfileWithWallet(token)
      .then((profileResp) => {
        const rawUser = profileResp?.user || profileResp;
        const rawBalance =
          rawUser?.inr_balance ??
          rawUser?.wallet?.inr_balance ??
          rawUser?.balance ??
          rawUser?.wallet?.balance;

        const parsedBalance = (() => {
          const n = parseFloat(rawBalance);
          return Number.isFinite(n) ? n : 0;
        })();

        const userProfile = {
          _id: rawUser?.user_id ?? rawUser?._id ?? rawUser?.id,
          username: rawUser?.username,
          currency_code: rawUser?.wallet?.coin_type ?? rawUser?.currency_code ?? "INR",
          balance: parsedBalance,
          inr_balance: parsedBalance,
        };

        setLocalUser(userProfile);
        dispatch(updateUser(userProfile));
        dispatch(updateUserBalanceAndExposure({ balance: parsedBalance }));
      })
      .catch(() => {
        setLocalUser(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch game name when component mounts
  useEffect(() => {
    if (gameId && vendor) {
      // Fetch games to find the game name
      const fetchGameName = async () => {
        try {
          // Try different categories to find the game
          const categories = ['roulette', 'blackjack', 'baccarat', 'poker', 'keno', 'other'];
          for (const category of categories) {
            try {
              const data = await getLivecasinoGames(vendor, 1, category);
              const games = data?.payload?.games || [];
              const game = games.find(g => (g.game_uid === gameId || g.id === gameId || String(g.id) === String(gameId)));
              if (game && game.game_name) {
                setGameName(game.game_name);
                break;
              }
            } catch (err) {
              // Continue to next category
            }
          }
        } catch (err) {
          console.error("Error fetching game name:", err);
        }
      };
      fetchGameName();
    }
  }, [gameId, vendor]);

  // Launch game when component mounts with gameId
  useEffect(() => {
    if (gameId && !iframeUrl && !loading) {
      const userRaw = localStorage.getItem('user');
      const storedUser = userRaw ? JSON.parse(userRaw) : null;
      const effectiveUser = localUser || storedUser;
      
      if (effectiveUser && (effectiveUser._id || effectiveUser.user_id)) {
        launchGameById(gameId);
      } else if (!token) {
        toast.error('Please login to play games');
        navigate(`/livecasino/${vendor || 'evolution'}`);
      } else {
        // Wait for user to load
        const timer = setTimeout(() => {
          const userRaw2 = localStorage.getItem('user');
          const storedUser2 = userRaw2 ? JSON.parse(userRaw2) : null;
          const effectiveUser2 = localUser || storedUser2;
          if (effectiveUser2 && (effectiveUser2._id || effectiveUser2.user_id)) {
            launchGameById(gameId);
          } else {
            toast.error('Please login to play games');
            navigate(`/livecasino/${vendor || 'evolution'}`);
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, localUser, token]);

  const launchGameById = async (gameUid) => {
    const userRaw = localStorage.getItem('user');
    const storedUser = userRaw ? JSON.parse(userRaw) : null;
    const effectiveUser = localUser || storedUser;
    
    if (!effectiveUser || (!effectiveUser._id && !effectiveUser.user_id)) {
      toast.error('Please login to play games');
      navigate(`/livecasino/${vendor || 'evolution'}`);
      return;
    }
    
    setLoading(true);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://api.dexch247.com';
      const payload = {
        game_uid: gameUid,
        user_id: String(effectiveUser._id ?? effectiveUser.user_id),
        credit_amount: String(reduxBalance || 0),
        currency_code: "INR",
        language: "en",
        home_url: '',
        callback_url: `${apiBaseUrl}/jsGamesv2/bet-callback`
      };
      console.log('Launch payload:', payload);
      const res = await launchLivecasinoGame(payload);
      console.log("LiveCasino launch response:", res);
      if (res.success && res.data?.game_launch_url) {
        setIframeUrl(res.data.game_launch_url);
      } else {
        toast.error(res.message || res.error || "Failed to launch game");
        navigate(`/livecasino/${vendor || 'evolution'}`);
      }
    } catch (err) {
      console.error("Launch game error:", err);
      toast.error(err.response?.data?.message || "Failed to launch game");
      navigate(`/livecasino/${vendor || 'evolution'}`);
    } finally {
      setLoading(false);
    }
  };

  // Display game name if available, otherwise show vendor name
  const vendorTitleMap = {
    spribe: "Spribe",
    ezugi: "Ezugi",
    evolution: "Evolution",
    ideal: "iDeal",
    microgaming: "Microgaming",
    pgsoft: "PG Soft",
    hacksaw: "Hacksaw",
    netent: "NetEnt",
    creedroomz: "Creedroomz",
    vivo: "Vivo Gaming",
    cockfight: "CockFight",
    winfinity: "WINFINITY",
    jacktop: "Jacktop",
    crash: "Crash"
  };
  const sectionTitle = gameName || vendorTitleMap[vendor] || "Live Casino";

  return (
    <>
      {/* Full-page loading overlay */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(44, 62, 80, 0.95)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }}>
          <img 
            src={logo} 
            alt="Loading..." 
            style={{ 
              width: "clamp(80px, 15vw, 120px)", 
              height: "auto", 
              marginBottom: "clamp(16px, 3vw, 24px)",
              maxWidth: "100%"
            }} 
          />
          <div style={{ color: "#fff", fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 600 }}>Loading...</div>
        </div>
      )}
      
      {/* Main launch screen - no sidebar, no categories */}
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{sectionTitle}</h2>
          {iframeUrl && (
            <button
              onClick={() => navigate(`/livecasino/${vendor || 'evolution'}`)}
              className={styles.exitButton}
            >
              EXIT
            </button>
          )}
        </div>

        {iframeUrl ? (
          <div className={styles.gameContainer}>
            <iframe
              src={iframeUrl}
              title="Live Casino Game"
              className={styles.gameIframe}
              allowFullScreen
            />
          </div>
        ) : (
          <div className={styles.loadingContainer}>
            <img 
              src={logo} 
              alt="Loading..." 
              className={styles.loadingLogo}
            />
            <div className={styles.loadingText}>Preparing game...</div>
          </div>
        )}
      </div>
    </>
  );
}
