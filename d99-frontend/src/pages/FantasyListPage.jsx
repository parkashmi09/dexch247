import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import MobileMenuTabs from "../components/home/MobileMenuTabs.jsx";
import SidebarTabs from "../components/listPage/SidebarTabs.jsx";
import ScrollableTabs from "../components/listPage/ScrollableTabs.jsx";
import { getGamesByVendor, launchLivecasinoGame } from "../apiservices/livecasinoApi.js";
import { getGameImage } from "../utils/gameImage.js";
import { API_URL } from "../config.js";

const PROVIDERS = [
  { id: "smartsoft", name: "Smart" },
  { id: "spribe", name: "Spribe" },
  { id: "tadagaming", name: "Tadagaming" },
  { id: "mini", name: "Mini" },
  { id: "evoplay", name: "Evoplay" },
  { id: "inout", name: "Inout" },
  { id: "bgaming", name: "BGaming" },
  { id: "funky games", name: "Funky Games" },
  { id: "galaxsys", name: "Galaxsys" },
  { id: "ws168", name: "WS168" },
];

const DEFAULT_PROVIDER = "smartsoft";

// Exclude slot/live/table types — keep only fantasy/casual/crash/dice/etc
const EXCLUDE_RE = /(slot|video slot|live|casinolive|casino live|baccarat|roulette|blackjack|poker|table game|sports|esports|lobby|html5 3d)/i;

export default function FantasyListPage() {
  const params = useParams();
  const user = useSelector((s) => s.user.user);
  const reduxBalance = useSelector((s) => s.user.balance);

  const provider = params.provider || DEFAULT_PROVIDER;

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

  // Fetch all pages for vendor, filter to fantasy types
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGames([]);

    (async () => {
      try {
        const first = await getGamesByVendor(provider, 1);
        if (cancelled) return;
        let allGames = first?.payload?.games || [];
        const totalPages = first?.payload?.pagination?.total_pages || 1;

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              getGamesByVendor(provider, i + 2).catch(() => null)
            )
          );
          if (cancelled) return;
          rest.forEach((r) => {
            allGames = allGames.concat(r?.payload?.games || []);
          });
        }

        // Filter: keep only fantasy/casual types
        const filtered = allGames.filter((g) => {
          const t = (g.game_type || "").trim();
          return t && !EXCLUDE_RE.test(t);
        });

        setGames(filtered);
      } catch {
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [provider]);

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

  const providerTabs = PROVIDERS.map((p) => ({
    id: p.id,
    label: p.name,
    to: `/fantasy-list/${p.id}`,
  }));

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
      <MobileMenuTabs />
      <div className="container-fluid container-fluid-5">
        <div className="row row5">
          <SidebarTabs
            tabs={providerTabs}
            activeId={provider}
            listClassName="nav nav-pills casino-tab"
          />
          <div className="col-xl-10 col-12">
            <ScrollableTabs
              tabs={providerTabs}
              activeId={provider}
              className="casino-tab-list d-xl-none"
              listId="fantasy-tab"
              listClassName="nav nav-pills casino-tab"
            />
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
                ) : games.length === 0 ? (
                  <div className="text-center p-4">No games found for this provider</div>
                ) : (
                  <div className="casino-list mt-2 mt-lg-0">
                    {games.map((game) => (
                      <div
                        className="casino-list-item rect rect2"
                        key={game.id || game.game_uid}
                        onClick={() => handleLaunch(game)}
                        style={{ cursor: "pointer", opacity: launching ? 0.5 : 1 }}
                      >
                        <div
                          className="casino-list-item-banner"
                          style={{ backgroundImage: `url(${getGameImage(game)})` }}
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
