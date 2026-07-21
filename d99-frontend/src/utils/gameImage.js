// Resolve a game's thumbnail: prefer the locally-hosted copy
// (game_uid -> /livecasinoimg/... via gameImageMap manifest, served by the
// Apache `Alias /livecasinoimg` from src/assets/livecasinoimg), then the
// provider's remote icon, then a placeholder. Many provider CDNs (imgix,
// coincasino) are dead/blocked, so the local copy is what actually renders.
// onGameImageError handles runtime load failures by stepping down the chain.
import gameImageMap from "../data/gameImageMap.json";

const PLACEHOLDER = "/assets/casino-icons/default.jpg";

export const getGameImage = (game) => {
  if (!game) return PLACEHOLDER;
  return (
    gameImageMap[game.game_uid] ||
    game.game_icon ||
    game.url_thumb ||
    game.image ||
    PLACEHOLDER
  );
};

export const onGameImageError = (e, game) => {
  const img = e.currentTarget;
  // Step down the chain: local manifest copy -> remote provider icon -> placeholder
  const remote = game && (game.game_icon || game.url_thumb || game.image);
  if (remote && !img.dataset.triedRemote && img.src !== remote) {
    img.dataset.triedRemote = "1";
    img.src = remote;
    return;
  }
  if (img.src.indexOf("default.jpg") === -1) {
    img.onerror = null;
    img.src = PLACEHOLDER;
  }
};
