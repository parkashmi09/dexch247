import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import MobileMenuTabs from "../components/home/MobileMenuTabs.jsx";
import SidebarTabs from "../components/listPage/SidebarTabs.jsx";
import ScrollableTabs from "../components/listPage/ScrollableTabs.jsx";
import { getLivecasinoGames } from "../apiservices/livecasinoApi.js";
import { getGameImage, onGameImageError } from "../utils/gameImage.js";

const VENDORS = [
  { id: "creedroomz", name: "Creedroomz" },
  { id: "vivo", name: "Vivo Gaming" },
  { id: "evolution", name: "Evolution" },
  { id: "ezugi", name: "EZUGI" },
  { id: "cockfight", name: "CockFight" },
  { id: "winfinity", name: "WINFINITY" },
  { id: "jacktop", name: "Jacktop" },
  { id: "spribe", name: "Spribe" },
  { id: "microgaming", name: "Microgaming" },
  { id: "pgsoft", name: "PG Soft" },
  { id: "hacksaw", name: "Hacksaw" },
  { id: "netent", name: "NetEnt" },
];

const CATEGORIES = [
  { id: "roulette", name: "Roulette" },
  { id: "blackjack", name: "Blackjack" },
  { id: "baccarat", name: "Baccarat" },
  { id: "poker", name: "Poker" },
  { id: "keno", name: "Keno" },
  { id: "other", name: "Other" },
];

const DEFAULT_VENDOR = "creedroomz";
const DEFAULT_CATEGORY = "roulette";

export default function LiveCasinoListPage() {
  const params = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user.user);

  const vendor = params.provider || DEFAULT_VENDOR;
  const category = params.categoryId || DEFAULT_CATEGORY;

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all pages and show everything (no pagination), same as slot/fantasy pages
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGames([]);

    (async () => {
      try {
        const first = await getLivecasinoGames(vendor, 1, category);
        if (cancelled) return;
        let all = first?.payload?.games || [];
        const totalPages = first?.payload?.pagination?.total_pages || 1;
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              getLivecasinoGames(vendor, i + 2, category).catch(() => null)
            )
          );
          if (cancelled) return;
          rest.forEach((r) => { all = all.concat(r?.payload?.games || []); });
        }
        setGames(all);
      } catch {
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [vendor, category]);

  const handleLaunch = (game) => {
    const userId = user?.user_id || user?.id || user?._id;
    if (!userId) {
      toast.error("Please login to play games");
      return;
    }
    navigate(`/play-casino/${game.vendor || vendor}/${game.game_uid}`);
  };

  const vendorTabs = VENDORS.map((v) => ({
    id: v.id,
    label: v.name,
    to: `/live-casino-list/${v.id}`,
  }));

  const categoryTabs = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    to: `/live-casino-list/${vendor}/${c.id}`,
  }));

  return (
    <Layout variant="list-page slot-page">
      <MobileMenuTabs />
      <div className="container-fluid container-fluid-5">
        <div className="row row5">
          <SidebarTabs
            tabs={vendorTabs}
            activeId={vendor}
            listClassName="nav nav-pills casino-tab"
          />
          <div className="col-xl-10 col-12">
            <ScrollableTabs
              tabs={vendorTabs}
              activeId={vendor}
              className="casino-tab-list d-xl-none"
              listId="live-casino-tab"
              listClassName="nav nav-pills casino-tab"
            />
            <ScrollableTabs
              tabs={categoryTabs}
              activeId={category}
              listId="live-casino-sub-tab"
            />
            <div className="tab-content mt-xl-2 mt-1">
              <div className="tab-pane active">
                {loading ? (
                  <div className="casino-list mt-2 mt-lg-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div className="casino-list-item" key={i}>
                        <div style={{ paddingTop: "100%", background: "#1a1a2e" }} />
                      </div>
                    ))}
                  </div>
                ) : games.length === 0 ? (
                  <div className="text-center p-4">No games found</div>
                ) : (
                  <div className="casino-list">
                    {games.map((game) => (
                      <div
                        className="casino-list-item rect rect2"
                        key={game.id || game.game_uid}
                        onClick={() => handleLaunch(game)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className="casino-list-item-banner"
                          style={{
                            position: "relative",
                            backgroundColor: "black",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center center",
                          }}
                        >
                          <img
                            src={getGameImage(game)}
                            onError={(e) => onGameImageError(e, game)}
                            alt={game.game_name || game.title || "casino-banner"}
                            loading="lazy"
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>
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
