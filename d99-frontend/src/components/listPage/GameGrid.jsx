import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const FALLBACK = "/assets/casino-icons/default.jpg";

/**
 * Renders a grid of game cards. Supports multiple card styles:
 * - "casino" : background-image with fallback, link to /casino/:slug (CasinoListPage)
 * - "live"   : CDN background-image, rect rect2 class (LiveCasinoListPage)
 * - "slot"   : contain/black bg style, rect class (SlotListPage)
 * - "fantasy": contain/black bg + play overlay, rect rect2 class (FantasyListPage)
 *
 * @param {boolean} [disableLinks] - render cards without links (e.g. premium/virtual games)
 */
export default function GameGrid({ games, variant = "casino", wrapperClass = "", disableLinks = false }) {
  if (games.length === 0) {
    return <div className="text-center p-4 w-100">No games available</div>;
  }

  return (
    <div className={`casino-list${wrapperClass ? ` ${wrapperClass}` : ""}`}>
      {games.map((game, idx) => {
        switch (variant) {
          case "casino": {
            const banner = (
              <div
                className="casino-list-item-banner"
                style={{
                  backgroundImage: `url("${game.file}"), url("${FALLBACK}")`,
                }}
              />
            );
            return (
              <div className="casino-list-item" key={game.slug || idx}>
                {disableLinks ? (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => toast("Coming Soon!", { icon: "🚀" })}
                  >
                    {banner}
                  </div>
                ) : (
                  <Link to={`/casino/${game.slug}`}>{banner}</Link>
                )}
              </div>
            );
          }

          case "live":
            return (
              <div className="casino-list-item rect rect2" key={idx}>
                <div
                  className="casino-list-item-banner"
                  style={{ backgroundImage: `url("${game}")` }}
                />
              </div>
            );

          case "slot":
            return (
              <div className="casino-list-item rect" key={idx}>
                <div
                  className="casino-list-item-banner"
                  style={{
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                    backgroundImage: `url("${game}")`,
                    backgroundColor: "black",
                  }}
                >
                  <img src={game} alt="casino-banner" style={{ display: "none" }} />
                </div>
              </div>
            );

          case "fantasy":
            return (
              <div className="casino-list-item rect rect2" key={idx}>
                <div
                  className="casino-list-item-banner"
                  style={{
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                    backgroundImage: `url("${game}")`,
                    backgroundColor: "black",
                  }}
                >
                  <div className="fancy-play">
                    <i className="fas fa-play"></i>
                    <i className="fas fa-info-circle fancy-info"></i>
                  </div>
                  <img src={game} alt="casino-banner" style={{ display: "none" }} />
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
