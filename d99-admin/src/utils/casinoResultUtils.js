/**
 * Common utility function to map last results from API response
 * @param {Object} response - API response object
 * @param {String} gameType - Game type (e.g., 'teen62', 'mogambo', 'cmeter1')
 * @returns {Array} Mapped results array with mid and win values
 */
export const mapLastResults = (response, gameType) => {
  if (!response?.success || !response?.data?.data?.res) {
    return [];
  }

  const results = response.data.data.res;

  // Map results based on game type
  switch (gameType) {
    case 'teen62':
      // For teen62: "1" = "Player A", "2" = "Player B"
      return results.map(item => ({
        mid: item.mid, // Use mid as round ID
        win: item.win === "1" ? "Player A" : item.win === "2" ? "Player B" : item.win,
        originalWin: item.win // Keep original for reference
      }));

    case 'teen1':
      // For teen1: "1" = "P" (Player), "2" = "D" (Dealer)
      return results.map(item => ({
        mid: item.mid,
        win: item.win === "1" ? "P" : item.win === "2" ? "D" : item.win,
        originalWin: item.win
      }));

    case 'mogambo':
      // For mogambo: "1" = "W" (Win), "2" = "L" (Lose)
      return results.map(item => ({
        mid: item.mid,
        win: item.win === "1" ? "W" : item.win === "2" ? "L" : item.win,
        originalWin: item.win
      }));

    default:
      // Default: return as-is with mid
      return results.map(item => ({
        mid: item.mid,
        win: item.win,
        originalWin: item.win
      }));
  }
};

/**
 * Get display value for win result (for display in UI)
 * @param {String} win - Win value from mapped result
 * @param {String} gameType - Game type
 * @returns {String} Display value
 */
export const getWinDisplayValue = (win, gameType) => {
  if (gameType === 'teen62') {
    // For teen62, show "A" or "B" in the result circle, but "Player A"/"Player B" in modal
    if (win === "Player A") return "A";
    if (win === "Player B") return "B";
  }
  return win;
};

