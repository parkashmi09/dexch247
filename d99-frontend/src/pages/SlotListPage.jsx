import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import MobileMenuTabs from "../components/home/MobileMenuTabs.jsx";
import SidebarTabs from "../components/listPage/SidebarTabs.jsx";
import ScrollableTabs from "../components/listPage/ScrollableTabs.jsx";
import { getSlotGames, launchLivecasinoGame } from "../apiservices/livecasinoApi.js";
import { getGameImage } from "../utils/gameImage.js";
import { API_URL } from "../config.js";

const PROVIDERS = [
  { id: "amigo", name: "Amigo", slugs: ["amigo"] },
  { id: "jili", name: "Jili", slugs: ["jili"] },
  { id: "turbogames", name: "Turbo Games", slugs: ["turbogames asia", "turbogames world"] },
  { id: "redtiger", name: "Red Tiger", slugs: ["evolution-redtiger"] },
  { id: "booongo", name: "Booongo", slugs: ["bng", "bng3oks"] },
  { id: "pgsoft", name: "Pocket Game", slugs: ["pgsoft"] },
  { id: "evoplay", name: "Evoplay", slugs: ["evoplay-aisa", "evoplay-eu"] },
  { id: "habanero", name: "Habanero", slugs: ["habanero"] },
  { id: "hacksaw", name: "Hacksaw Gaming", slugs: ["hacksaw", "hacksaw asia", "hacksaw latam", "hacksaw world"] },
  { id: "kalamba", name: "Kalamba Games", slugs: ["kalamba"] },
  { id: "nolimit", name: "Nolimit city", slugs: ["evolution-nlc"] },
  { id: "relaxgaming", name: "Relax Gaming", slugs: ["relaxgaming"] },
  { id: "kingmidas", name: "Kingmidas", slugs: ["km", "km-onegaming"] },
];

const DEFAULT_PROVIDER = "amigo";

export default function SlotListPage() {
  const params = useParams();
  const user = useSelector((s) => s.user.user);
  const reduxBalance = useSelector((s) => s.user.balance);

  const providerId = params.providerId || DEFAULT_PROVIDER;
  const selectedProvider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
  const slugs = selectedProvider.slugs;

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

  // Fetch all pages for ALL slugs, merge
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGames([]);

    (async () => {
      try {
        const firstResponses = await Promise.all(
          slugs.map((s) => getSlotGames(s, 1).catch(() => null))
        );
        if (cancelled) return;

        const plans = firstResponses.map((resp, idx) => ({
          slug: slugs[idx],
          firstGames: resp?.payload?.games || [],
          totalPages: resp?.payload?.pagination?.total_pages || 1,
        }));

        const extraFetches = [];
        plans.forEach((plan) => {
          for (let p = 2; p <= plan.totalPages; p++) {
            extraFetches.push(getSlotGames(plan.slug, p).catch(() => null));
          }
        });

        const extraResponses = await Promise.all(extraFetches);
        if (cancelled) return;

        // Merge + dedupe (same game can appear under multiple region slugs)
        const seen = new Set();
        const allGames = [
          ...plans.flatMap((p) => p.firstGames),
          ...extraResponses.flatMap((r) => r?.payload?.games || []),
        ].filter((g) => {
          const key = g.game_uid || g.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setGames(allGames);
      } catch {
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slugs.join(",")]);

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
    to: `/slot-list/${p.id}`,
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
    <Layout variant="list-page slot-page" rightSidebar={slotIframe}>
      <MobileMenuTabs />
      <div className="container-fluid container-fluid-5">
        <div className="row row5">
          <SidebarTabs
            tabs={providerTabs}
            activeId={providerId}
            listClassName="nav nav-pills casino-tab"
          />
          <div className="col-xl-10 col-12">
            <ScrollableTabs
              tabs={providerTabs}
              activeId={providerId}
              className="casino-tab-list d-xl-none"
              listId="slot-tab"
              listClassName="nav nav-pills casino-tab"
            />
            <div className="casino-sub-tab-list">
              <ul className="nav nav-pills casino-sub-tab" id="slot-sub-tab">
                <li className="nav-item">
                  <a className="nav-link active" href={`/slot-list/${providerId}`}>
                    <span>New Slots</span>
                  </a>
                </li>
              </ul>
            </div>
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
                    {games.map((game) => {
                      const icon = getGameImage(game);
                      return (
                        <div
                          className="casino-list-item rect rect2"
                          key={game.id || game.game_uid}
                          onClick={() => handleLaunch(game)}
                          style={{ cursor: "pointer", opacity: launching ? 0.5 : 1 }}
                        >
                          <div
                            className="casino-list-item-banner"
                            style={{
                              backgroundSize: "contain",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center center",
                              backgroundImage: icon ? `url("${icon}")` : "none",
                              backgroundColor: "black",
                            }}
                          >
                            {/* Hidden probe img: if the icon 404s, clear the background so only black shows */}
                            {icon && (
                              <img
                                src={icon}
                                alt="casino-banner"
                                style={{ display: "none" }}
                                onError={(e) => {
                                  const banner = e.currentTarget.parentNode;
                                  if (banner) banner.style.backgroundImage = "none";
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
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
