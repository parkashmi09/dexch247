import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import { launchLivecasinoGame } from "../apiservices/livecasinoApi.js";
import api from "../apiservices/axiosClient.js";
import { API_URL } from "../config.js";
import img01 from "../assets/crashgameimg/01-aviator-spribe.jpg";
import img02 from "../assets/crashgameimg/02-betcore-140511.jpg";
import img03 from "../assets/crashgameimg/03-betcore-154912.jpg";
import img04 from "../assets/crashgameimg/04-betcore-170114.jpg";
import img05 from "../assets/crashgameimg/05-betcore-168613.jpg";
import img06 from "../assets/crashgameimg/06-creedroomz-500000674.jpg";
import img07 from "../assets/crashgameimg/07-creedroomz-33060327.jpg";
import img08 from "../assets/crashgameimg/08-creedroomz-500000203.jpg";
import img09 from "../assets/crashgameimg/09-ssg-jetx.jpg";
import img10 from "../assets/crashgameimg/10-ssg-cricketx.jpg";
import img11 from "../assets/crashgameimg/11-ssg-balloon.jpg";
import img12 from "../assets/crashgameimg/12-creedroomz-500000397.gif";
import img13 from "../assets/crashgameimg/13-creedroomz-141422.jpg";
import img14 from "../assets/crashgameimg/14-darwin-AVIATSR.jpg";
import img15 from "../assets/crashgameimg/15-darwin-CRAE.jpg";
import img16 from "../assets/crashgameimg/16-darwin-CRAESP.jpg";
import img17 from "../assets/crashgameimg/17-gemini-MultiPlayerAviator.jpg";
import img18 from "../assets/crashgameimg/18-jili-261.jpg";
import img19 from "../assets/crashgameimg/19-jili-224.jpg";
import img20 from "../assets/crashgameimg/20-jili-235.jpg";
import img21 from "../assets/crashgameimg/21-turbo-crashx.jpg";
import img22 from "../assets/crashgameimg/22-turbo-aero.jpg";
import img23 from "../assets/crashgameimg/23-ssg-aviator.jpg";

// Reference /aviator-list tiles: fixed curated thumbnail + the game each tile
// launches (resolved against the API by name; vendor is a tiebreak hint only,
// since provider vendor names have changed over time).
const TILES = [
  { image: img01, name: "Spribe Aviator", vendor: "topbet" },
  { image: img02, name: "Chicken Road 2", vendor: "topbet" },
  { image: img03, name: "Chicken Road Cross", vendor: "mac88" },
  { image: img04, name: "When Lambo", vendor: "onlyplay" },
  { image: img05, name: "Mega Fire Blaze: Plinko", vendor: "playtech" },
  { image: img06, name: "AviatorX2", vendor: "mac88" },
  { image: img07, name: "Blastoff", vendor: "aura gaming" },
  { image: img08, name: "Plane Crash", vendor: "mac88" },
  { image: img09, name: "Jet XT", vendor: "mac88" },
  { image: img10, name: "Cricket Crash", vendor: "onlyplay" },
  { image: img11, name: "Fury Balloon", vendor: "veliplay" },
  { image: img12, name: "Aviator", vendor: "topbet" },
  { image: img13, name: "F777 Fighter", vendor: "onlyplay" },
  { image: img14, name: "Aviator", vendor: "aura gaming" },
  { image: img15, name: "Dragon's Crash", vendor: "bgaming" },
  { image: img16, name: "Meta Crash", vendor: "100hp" },
  { image: img17, name: "Aviator", vendor: "aura gaming" },
  { image: img18, name: "Crash Bonus", vendor: "jili" },
  { image: img19, name: "Go Rush", vendor: "jili" },
  { image: img20, name: "Limbo", vendor: "jili" },
  { image: img21, name: "CrashX", vendor: "turbogames asia" },
  { image: img22, name: "Aero", vendor: "turbogames asia" },
  { image: img23, name: "Spribe Aviator", vendor: "topbet" },
];

export default function CrashPage() {
  const user = useSelector((s) => s.user.user);
  const reduxBalance = useSelector((s) => s.user.balance);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [activeGameName, setActiveGameName] = useState("");

  // Lock scroll when iframe open
  useEffect(() => {
    if (iframeUrl) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [iframeUrl]);

  // Fetch all crash games from API (same endpoint as d99-frontend CrashPage)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGames([]);

    (async () => {
      try {
        const res = await api.get(`${API_URL}/jsGames/games`, {
          params: { game_type: "Crash", page: 1, per_page: 100 },
          baseURL: "",
        });
        const payload = res.data?.payload;
        let fetched = payload?.games || [];
        const totalPages = payload?.pagination?.total_pages || 1;
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              api.get(`${API_URL}/jsGames/games`, {
                params: { game_type: "Crash", page: i + 2, per_page: 100 },
                baseURL: "",
              }).catch(() => null)
            )
          );
          rest.forEach((r) => {
            fetched = fetched.concat(r?.data?.payload?.games || []);
          });
        }
        if (!cancelled) setGames(fetched);
      } catch {
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Resolve each curated tile to a real API game (exact name+vendor → name → contains).
  // Always returns all tiles (image always shows); game may be null (launch guarded).
  const tiles = useMemo(() => {
    return TILES.map((t) => {
      const n = t.name.toLowerCase();
      const v = (t.vendor || "").toLowerCase();
      const game =
        games.find((g) => (g.game_name || "").toLowerCase() === n && (g.vendor || "").toLowerCase() === v) ||
        games.find((g) => (g.game_name || "").toLowerCase() === n) ||
        games.find((g) => (g.game_name || "").toLowerCase().includes(n)) ||
        null;
      return { image: t.image, name: t.name, game };
    });
  }, [games]);

  // Launch — same flow as /slot-list/
  const handleLaunch = async (game) => {
    if (launching) return;
    const userId = user?.user_id || user?.id || user?._id;
    if (!userId) { toast.error("Please login to play games"); return; }
    const bal = reduxBalance ?? parseFloat(localStorage.getItem("credit_inr") || "0");
    if (bal <= 0) { toast.error("Insufficient balance"); return; }

    setLaunching(true);
    setActiveGameName(game.game_name || "");
    try {
      const res = await launchLivecasinoGame({
        game_uid: game.game_uid,
        user_id: String(userId),
        credit_amount: String(bal),
        currency_code: "INR",
        language: "en",
        home_url: "",
        callback_url: `${API_URL}/jsGamesv2/bet-callback`,
      });
      if (res?.success && res.data?.game_launch_url) {
        setIframeUrl(res.data.game_launch_url);
      } else {
        toast.error(res?.message || "Failed to launch game");
        setActiveGameName("");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to launch game");
      setActiveGameName("");
    } finally {
      setLaunching(false);
    }
  };

  const handleExit = () => {
    setIframeUrl(null);
    setActiveGameName("");
  };

  const slotIframe = (
    <div className={`slot-iframe${iframeUrl ? " show" : ""}`}>
      <div className="slot-header">
        <div className="title"><h4>{activeGameName}</h4></div>
        {iframeUrl && <div className="close-slot-frame" onClick={handleExit}>EXIT</div>}
      </div>
      <iframe scrolling="no" allow="fullscreen;" src={iframeUrl || "about:blank"} style={{ width: "100%", border: "0px", background: "#000" }} />
    </div>
  );

  return (
    <Layout variant="list-page own-casino-page" rightSidebar={slotIframe}>
      <div className="container-fluid container-fluid-5 position-relative">
        <div className="row5 row">
          <div className="col-xl-12">
            <div className="tab-content mt-xl-2 mt-1">
              <div className="tab-pane active">
                {loading ? (
                  <div className="casino-list mt-2 mt-lg-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div className="casino-list-item rect rect2" key={i}>
                        <div className="casino-list-item-banner" style={{ background: "#1a1a2e" }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="casino-list mt-2 mt-lg-0">
                    {tiles.map((tile, idx) => (
                      <div
                        className="casino-list-item rect rect2"
                        key={tile.game?.game_uid || idx}
                        onClick={() => tile.game ? handleLaunch(tile.game) : toast.error("Game not available right now")}
                        style={{ cursor: "pointer", opacity: launching ? 0.5 : 1 }}
                      >
                        <div
                          className="casino-list-item-banner"
                          style={{ backgroundImage: `url(${tile.image})` }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
