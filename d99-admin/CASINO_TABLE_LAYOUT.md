# Casino Table Layout – Plan

## Overview

Common layout for all casino table (game) pages. One consistent structure so every game follows the same pattern and the agent/instructions are clear.

## Layout Structure

### Two-column layout

| Left section | Right section |
|--------------|----------------|
| Casino header | **My Bets** (always rendered first) |
| Video box | |
| Bet table | |
| Last result | |

- **Left**: Game area (header → video → bet table → result).
- **Right**: **My Bets** only — always visible on desktop; no separate “Place Bet” panel.

## Left section (top to bottom)

1. **Casino header**  
   - Game name, Round ID, tabs (GAME / PLACED BET) as per `CasinoHeading`.

2. **Video box**  
   - Live stream iframe.  
   - **Overlays (already in VideoBox):**
     - **Top-left:** Card/result visuals (e.g. Player A / Player B cards) via `ResultVisuals` / `playerInfo`.
     - **Bottom-right:** Flipper timer (`FlipperTimer`) — one-by-one digits as per game flow.

3. **Bet table**  
   - Game-specific bet grid (e.g. `BetTeenTable`, `BetTableTrio`, etc.).

4. **Last result**  
   - Use the common **`CasinoLastResult`** component (see below).  
   - It renders: “Last Result” heading + “View All” link + **game-type-specific result UI**.  
   - Result is chosen by **strict `gameType` switch** (same idea as `ResultVisuals`); do not render page-specific result components directly — always use `CasinoLastResult` with the correct `gameType` so behaviour is referable and consistent.

## Right section

- **My Bets** only.  
- Rendered first (top) in the right column.  
- No “My Place Bet” or separate place-bet panel on the right.

### View More modal (implemented)

- **Modal:** `src/components/ViewMoreModal/index.jsx` — fetches data when opened via `getCasinoAllBets(sectionKey)`, shows loading state, then renders the table with the result. Props: `show`, `onHide`, `title` (default `"View More"`), `sectionKey` (game name, e.g. `teen`). Reference: lord-admin `ViewMoreModal.jsx`.
- **Table UI:** `src/components/ViewMoreModal/TableUi/index.jsx` — component `BetViewMoreTable`. Receives `data` (array of bets); uses the same table structure and design as assign-agent (see `TableUi/style.css`, aligned with `src/pages/assign-agent/style.css`). Headers: **No**, **UserName**, **Nation**, **Amount**, **User Rate**, **Place Date**, **IP**, **Browser Details**. Rows are mapped from `data`; cell values come from API fields (e.g. `username`/`userName`, `stake`/`amount`, `placeDate`/`created_at`, `ip`, `browserDetails`/`browser`). No filters; table only. Empty state: "There are no records to show".
- **Trigger:** My Bets "View More" link. Game page passes `onViewMore` to `MyBet` (e.g. `onViewMore={() => setShowViewMoreModal(true)}`) and renders `<ViewMoreModal show={showViewMoreModal} onHide={() => setShowViewMoreModal(false)} title="View More" sectionKey={gameName} />`. Example: `src/pages/diamondCasinoAllGames/teen/index.jsx`.
- **API:** `getCasinoAllBets(gameName)` in `src/apiservices/CasionApi.jsx` — GET `.../d99/bet-list/casino/all-downline?gameName={gameName}`. Called when the modal is opened; response `res.data` passed as `data` to `BetViewMoreTable`.
- **Styling:** Modal overlay/header/body in `ViewMoreModal/ViewMoreModal.module.css`. Table uses `TableUi/style.css` for assign-agent–style table (bordered, same thead/tbody/empty row look).

## APIs (aligned with lord-admin casino)

Use the same API pattern as lord-admin for **Last Result** and **My Bets**:

| Purpose      | API / source | Notes |
|-------------|--------------|--------|
| **Game data** | `getCasinoGameDetails(gameName)` | `src/apiservices/CasionApi.jsx`. Polled (e.g. every 1.5s). Response may include `lrs` (last results) at `data.lrs`, `data.data.lrs`, or `data.data.data.lrs`. |
| **Last result** | From **game data** or `getLastResults(type)` | Prefer last results from `getCasinoGameDetails` response: `gameData?.lrs ?? gameData?.data?.data?.lrs ?? gameData?.data?.lrs ?? []`. Pass this as `data` to `CasinoLastResult`. If the game-details API does not return `lrs`, call `getLastResults(gameType)` (e.g. `getLastResults('teen')`) and pass the returned list as `data`. Same endpoints as lord-admin: `POST .../casino/casino/last-results` with `{ type }`. |
| **My Bets**   | `getCasinoOpenBets(gameName)` **(same as lord-admin)** | `src/apiservices/CasionApi.jsx`. **GET** `.../d99/bet-list/casino/open-downline?gameName={gameName}`. Call with game name from route (e.g. `teen`); poll every 5s like lord-admin. Optional: `getMyBets(userId, matchId)` remains available for match-scoped bets if needed. |
| **View More (full list)** | `getCasinoAllBets(gameName)` | `src/apiservices/CasionApi.jsx`. **GET** `.../d99/bet-list/casino/all-downline?gameName={gameName}`. Used when the user clicks "View More" in My Bets; fetches full downline list for the modal. Same pattern as lord-admin. |
| **Exposure** | `getMatchExposure(userId, matchId)` | For bet table exposure; `src/apiservices/CasionApi.jsx`. Same as lord-admin: `POST .../user/matchexposures/match` (or DIAMONDEXCH99's `.../user/exposures/get-exposure`) with `user_id`, `match_id`. |

- **Game pages** should pass API-backed `data` and `gameData` into `CasinoLastResult`, and API-backed `bets` into `MyBet` (from `getCasinoOpenBets` or `getMyBets`). To enable the View More modal, pass `onViewMore` to `MyBet` (e.g. `onViewMore={() => setShowViewMoreModal(true)}`) and render `ViewMoreModal` with `show`, `onHide`, `title="View More"`, and `sectionKey={gameName}`. Do not use hardcoded result arrays for the last-result block.

## Removed

- **My Place Bet panel**  
  - The sliding/overlay “Place Bet” UI is not part of this layout.  
  - Remove it from the table layout; betting is done via the bet table only (or handled elsewhere if required later).

## Component: `CasinoTableLayout`

- **Location:** `src/pages/casinoComponents/casinoTableLayout/`
- **Props:**
  - `children` – left column content (header + VideoBox + bet table + **CasinoLastResult**).
  - `rightSide` – React node for the right column (typically `<MyBet bets={myBets} />`).
- **Behaviour:**
  - Flex (or grid) container: left column (~67%) and right column (~33%).
  - On small screens: stack or hide right column / show My Bets in a different way (e.g. under the table or in a tab), consistent with current mobile behaviour.

---

## Component: `CasinoLastResult`

- **Location:** `src/pages/casinoComponents/casinoLastResult/`
- **Purpose:** Single common place for the “Last Result” block. Renders the heading + “View All” link, then the correct result UI based on **`gameType`** (strict switch — referable and stored in context here).
- **Props:**
  - `gameType` **(required)** – string used in the switch (e.g. `"teen"`, `"pteen"`, `"trio"`, `"poker"`). Normalized to lowercase.
  - `data` – array of result items passed to the underlying result component (default `[]`).
  - `gameData` – game/match data object passed to the underlying result component (default `{}`).
  - `viewAllLink` – URL for “View All” (default `"/casino/results"`).
  - Any other props are passed through to the inner result component.
- **Usage on game pages:**  
  Use only this component for the last-result block; do not render `ResultTeen` / `ResultTrio` / etc. directly. Example:
  ```jsx
  <CasinoLastResult gameType="teen" data={resultdata} gameData={gameData} />
  ```

### Strict `gameType` → result component mapping (reference)

| `gameType` (normalized) | Result component |
|-------------------------|------------------|
| `teen20`, `pteen20` | `ResultTeen20` |
| `teen`, `pteen`, `teen8`, `teen9`, `teen20b`, `teen20c`, `teen32`, `teen33`, `teen41`, `teen42`, `teen62`, `teen6`, `teen1`, `teenmuf`, `teensin`, `patti2` | `ResultTeen` |
| `trio` | `ResultTrio` |
| `trap` | `ResultTrap` |
| `poker` | `ResultPoker` |
| `poker20` | `ResultPoker20` |
| `poker6` | `ResultPoker6` |
| `baccarat` | `ResultBaccarat` |
| `baccarat2`, `pbaccarat` | `ResultBaccarat2` |
| `dt20`, `pdt20`, `dragontiger` | `ResultDragonTiger` |
| `dt202` | `ResultDragonTiger202` |
| `dt6` | `ResultDragonTiger6` |
| `lucky7`, `plucky7` | `ResultLucky7` |
| `card32`, `pcard32` | `ResultCard32` |
| `card32eu` | `ResultCard32B` |
| `sicbo`, `sicbo2` | `Result` (simple circles) |
| `mogambo` | `ResultMogambo` |
| `lucky15` | `ResultLucky15` |
| *(default)* | `Result` (simple A/B circles) |

- **Adding a new game:** In `casinoLastResult/index.jsx`, add the import for the result component, then add a new `case` (or extend an existing one) in the `ResultByGameType` switch. Keep this list and the `.md` in sync so the mapping stays referable.

## Game flow (reference)

- Timer counts down in VideoBox (bottom-right).
- Cards/result visuals update in VideoBox (top-left).
- User places bets via the bet table; “My Bets” list updates on the right.
- Last result section shows recent results below the bet table.

## Files to create/update

1. **Create:** `src/pages/casinoComponents/casinoTableLayout/index.jsx`  
   - Renders left column (`children`) and right column (`rightSide`).

2. **Create:** `src/pages/casinoComponents/casinoTableLayout/CasinoTableLayout.module.css`  
   - Two-column layout and responsive rules.

3. **Create:** `src/pages/casinoComponents/casinoLastResult/index.jsx`  
   - “Last Result” heading + “View All” link + strict `gameType` switch to result component.  
   - **Create:** `casinoLastResult/CasinoLastResult.module.css` for section/heading/viewAll styles.

4. **Update:** Game pages (e.g. `teen/index.jsx`) to:
   - Use `CasinoTableLayout`.
   - In the left column (children): CasinoHeading, VideoBox, BetTable, then **`CasinoLastResult`** with the correct `gameType` (e.g. `gameType="teen"`). Do **not** render `ResultTeen` / `ResultTrio` / etc. directly.
   - Pass `rightSide={<MyBet bets={myBets} />}`.
   - Remove the “Place Bet” panel and any duplicate “My Place Bet” block.
   - Keep My Bets only on the right.

## VideoBox (no structural change)

- Card visuals: top-left (`playerInfo` in `VideoBox.module.css`).
- Flipper timer: bottom-right (`timer` in `VideoBox.module.css`).
- Behaviour stays as-is; layout only composes it in the left column.

---

## Bet table: naming, structure, exposure

### Naming convention

- **Bet table components** must use the prefix **BetTable + game name** (e.g. `BetTableTeen`, `BetTableTeen1`).
- The Teen 1-day game uses **BetTableTeen**, implemented in `src/pages/casinoComponents/betTeenTable/index.jsx` (exported as default; page may still import as `BetTeenTable`).

### Table structure and CSS reference

- The bet table **HTML structure and CSS class names** must match the **reference UI** exactly.
- **Reference CSS:** `src/styles/casino-table-reference.css`.
  - Contains: teen1day layout (`.teen1daycasino-container`, `.teen1dayleft`, `.teen1dayright`, `.teen1daycenter`, `.teen1dayother`), shared casino box styles (`.casino-box-row`, `.casino-nation-name`, `.casino-bl-box`, `.casino-bl-box-item`), back/lay (`.casino-table .back`, `.lay`), suspended overlay (`.suspended`), exposure/book (`.casino-book`, `.book-red`), range (`.icon-range`), and teenpatti1day widths.
- This file is imported from `src/styles/index.css`. Use these **global** class names in bet table components so layout and appearance match the reference.

### Exposure

- **Exposure** is consistently mapped across all bet table sections.
- **Initially:** exposure is **0** (no exposure until API or my-bets data provides a value). Default `exposures` prop is `{}`; display shows `0` when there is no value for that selection/type.
- Exposure can come from: (1) `exposures` prop (keyed by selection/team name), or (2) `myBets` items’ `exposer` (or `exposure_amount`) when matched to the same selection/type.

### Sections and suspension

- Every tab/section (e.g. Player A Main, Consecutive, Player B Main, Consecutive, Card 1–6 Odd/Even) is **suspended and mapped consistently**:
  - Back/Lay cells get class `suspended` when `gstatus === 'SUSPENDED'` or odds are 0; lock overlay and cursor apply from reference CSS.
  - Each section’s odds and exposure are bound to the same data keys so behaviour is predictable and referable.

### Info icon and range (min/max)

- Each bet type (e.g. Player, 3 Baccarat, Total, Pair Plus, Black, Red) may show an **info icon** (e.g. `fa-info-circle`) next to the label.
- **Clicking the info icon** toggles (collapse/expand) the range line. When expanded, the range is shown as **R: &lt;min&gt;-&lt;max&gt;** (e.g. `R: 100-5L`).
- **Min/max values** come from the game API: `sub[].min` and `sub[].max` per selection. Display: thousands as `K` (e.g. 1000 → 1K), lakhs as `L` (e.g. 100000 → 1L); otherwise the raw number.
- Use class **`.icon-range`** for the range text; **`.collapse`** when closed, **`.collapse.show`** when open (see `casino-table-reference.css`). Toggle via React state.

---

## Result modal layout by game type (every instance)

Use this in **game-page result modals** (e.g. ResultTeen, ResultTeen20) and in **Casino Result Report** (`/admin/reports/casinoresult/:gameName`) so layout and parsing are the same everywhere.

### Shared result modal body components (replacement)

We have **two** modal body components with Player A / Player B cards and description table; a **switch** picks which one to render. Both **game pages** and the **report** use the same components so there is no duplicated modal body markup.

| Component | Location | Used for |
|-----------|----------|----------|
| **CasinoResultBodyTeen** | `src/pages/casinoComponents/casinoResultModal/CasinoResultBodyTeen.jsx` | 1-day Teenpatti (teen, pteen, teen8, teen9, …). Cards A=[0,2,4] B=[1,3,5]; labels Winner, Odd/Even, Consecutive. |
| **CasinoResultBodyTeen20** | `src/pages/casinoComponents/casinoResultModal/CasinoResultBodyTeen20.jsx` | 20-20 Teenpatti (teen20, pteen20). Cards A=first 3 B=next 3; labels Winner, 3 Baccarat, score, Total, Pair Plus, Red Black. |
| **CasinoResultBodyByGameType** | `src/pages/casinoComponents/casinoResultModal/CasinoResultBodyByGameType.jsx` | Switch on `gameType` (normalized): renders `CasinoResultBodyTeen20` for teen20/pteen20, `CasinoResultBodyTeen` for teen/pteen and others; default = Teen. |

**Replacement:** Everywhere we show a result detail modal we now use:

- **ResultModalLayout** (wrapper: title, Round-ID, Match Time, loading, close) from `src/components/resultModalLayout`.
- **Children** = **CasinoResultBodyByGameType** with `gameType` and `detailResult` (API `t1`).

So:

- **Game pages:** `ResultTeen` and `ResultTeen20` no longer render their own modal body; they use `ResultModalLayout` + `CasinoResultBodyByGameType` with `detailResult` and `gameType` (or `apiType`).
- **Casino Result Report:** Uses `ResultModalLayout` + `CasinoResultBodyByGameType` with `gameType` from the report and `detailResult` from the detail API. No inline cards/description or local parsing.

Both pages therefore share the same two table bodies (Teen and Teen20) and the same switch. Exports: `casinoResultModal/index.jsx` exports `CasinoResultModal` (legacy full modal) and the three body components above.

### API

- **Detail:** `getDetailResults(gameType, mid)` → response `data.data.t1` (or `data.t1`) with: `rid`, `mtime`, `ename`, `rdesc`, `card`, `winnat`, `win`.
- **Modal title:** Use `detailResult.ename` (e.g. "Premium 20-20 Teenpatti"); layout component may append " Result".

### 1-day Teenpatti (teen, pteen, etc.)

- **Card order:** 6 cards = A1, B1, A2, B2, A3, B3 → Player A = indices `[0, 2, 4]`, Player B = `[1, 3, 5]`.
- **rdesc:** `#`-separated, 4 parts: `Winner#Suits#Odd/Even#Consecutive`. Parse: `winner`, `oddEven`, `consecutive` (suits optional for display).
- **Description labels:** Winner | Odd/Even | Consecutive.

### 20-20 Teenpatti (teen20, pteen20)

- **Card order:** 6 cards = A1, A2, A3, B1, B2, B3 → Player A = first 3, Player B = next 3 (`slice(0,3)` / `slice(3,6)`).
- **rdesc:** `#`-separated, 6 parts: `Winner#3 Baccarat#(A : x | B : y)#Total#Pair Plus#Red Black`. Part 1 may contain `~` (e.g. `Player B(High Baccarat)~(A : 9 | B : 8)`): before `~` = baccarat line, after `~` = score line.
- **Description labels:** Winner | 3 Baccarat | (blank for score line) | Total | Pair Plus | Red Black.

### Card images

- Use **`getCardImage(token)`** from `src/pages/casinoComponents/resultVisuals/cardAssets.js` so all modals use `/img/cards/{token}.png`. Card string from API is comma-separated tokens (e.g. `QDD,KDD,ACC,5CC,JSS,4DD`).

---

## Card assets (result visuals only)

- **Result visuals cards:** `public/img/cards/` only (no imports; all cards live here).
  - Card back: `1.png` (used when token is empty / `"0"` / `"1"`).
  - Face cards: `{token}.png` (e.g. `10.png`, `6DD.png`, `ASS.png`, `KHH.png`).
- **Mapping:** `src/pages/casinoComponents/resultVisuals/cardAssets.js` — exports `getCardImage(token)` and `CARD_BACK`; builds URLs `/img/cards/1.png` and `/img/cards/${token}.png` only. No card image imports; visuals use this module for every card `img` `src`.
- **Suit icons in result UIs:** When a result component needs suit icons (e.g. Race20), use **`/img/cardsIcons/`** or `src/assets/img/cardsIcons` as appropriate.

## Reference summary

- **Layout:** `CasinoTableLayout` — left (header, VideoBox, bet table, **CasinoLastResult**), right (My Bets).
- **Last result:** Always use **`CasinoLastResult`** with `gameType`; result UI is chosen by the strict switch above. Keep the mapping in this `.md` and in `casinoLastResult/index.jsx` in sync so it stays referable and stored in context.
- **Result detail modal:** Use **ResultModalLayout** + **CasinoResultBodyByGameType** (gameType, detailResult) on both game pages and Casino Result Report. Two body components implemented: **CasinoResultBodyTeen** (1-day) and **CasinoResultBodyTeen20** (20-20); switch in `CasinoResultBodyByGameType` picks the correct one. No duplicated modal body markup.
- **My Bets / View More:** My Bets list uses **`getCasinoOpenBets(gameName)`** (poll every 5s). "View More" opens **`ViewMoreModal`** with `sectionKey={gameName}`; modal fetches **`getCasinoAllBets(gameName)`** (all-downline) and renders **`BetViewMoreTable`** (`ViewMoreModal/TableUi`) with columns No, UserName, Nation, Amount, User Rate, Place Date, IP, Browser Details. No in-modal filters. Game page must pass `onViewMore` to `MyBet` and render `ViewMoreModal` (see teen page).
- **APIs:** Last result and My Bets use the same APIs as lord-admin — see **APIs (aligned with lord-admin casino)** above. Game data (`getCasinoGameDetails`) can supply `lrs` for last result; My Bets use **`getCasinoOpenBets(gameName)`**; View More uses **`getCasinoAllBets(gameName)`**.







