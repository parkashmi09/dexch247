/**
 * Result visuals card URLs only. All cards live in public/img/cards (no imports).
 * Back = 1.png; face = {token}.png (e.g. 10.png, 6DD.png, ASS.png).
 */
const CARDS_BASE = '/img/cards';

export const CARD_BACK = `${CARDS_BASE}/1.png`;

/**
 * Returns card image URL for token. Empty / "0" / "1" = back (1.png); else {token}.png.
 */
export function getCardImage(token) {
    const t = String(token || '').trim();
    if (!t || t === '0' || t === '1') return CARD_BACK;
    return `${CARDS_BASE}/${t}.png`;
}

/**
 * Face value for 3 Card Total: A=1, 2-9=number, 10/J/Q/K=10. Back/empty=0.
 */
export function getCardValue(token) {
    const t = String(token || '').trim();
    if (!t || t === '0' || t === '1') return 0;
    const rank = t.startsWith('10') ? '10' : t.charAt(0).toUpperCase();
    if (rank === 'A') return 1;
    if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;
    const n = parseInt(rank, 10);
    return isNaN(n) ? 0 : Math.min(10, Math.max(0, n));
}
