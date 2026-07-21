/**
 * Default sports list with correct etid values matching the third-party sports API.
 * Used as initial/fallback data in Sidebar, General Lock, and anywhere sports need to render
 * before the API responds.
 */
const DEFAULT_SPORTS = [
  { etid: 4, name: 'Cricket' },
  { etid: 1, name: 'Football' },
  { etid: 2, name: 'Tennis' },
  { etid: 8, name: 'Table Tennis' },
  { etid: 22, name: 'Badminton' },
  { etid: 68, name: 'Esoccer' },
  { etid: 15, name: 'Basketball' },
  { etid: 18, name: 'Volleyball' },
  { etid: 59, name: 'Snooker' },
  { etid: 19, name: 'Ice Hockey' },
  { etid: 11, name: 'E Games' },
  { etid: 9, name: 'Futsal' },
  { etid: 39, name: 'Handball' },
  { etid: 66, name: 'Kabaddi' },
  { etid: 5, name: 'Golf' },
  { etid: 55, name: 'Rugby League' },
  { etid: 6, name: 'Boxing' },
  { etid: 7, name: 'Beach Volleyball' },
  { etid: 3, name: 'Mixed Martial Arts' },
  { etid: 16, name: 'MotoGP' },
  { etid: 17, name: 'Chess' },
  { etid: 29, name: 'Cycling' },
  { etid: 32, name: 'Motorbikes' },
  { etid: 33, name: 'Athletics' },
  { etid: 35, name: 'Basketball 3X3' },
  { etid: 37, name: 'Sumo' },
  { etid: 38, name: 'Virtual sports' },
  { etid: 52, name: 'Motor Sports' },
  { etid: 53, name: 'Baseball' },
  { etid: 54, name: 'Rugby Union' },
  { etid: 57, name: 'Darts' },
  { etid: 58, name: 'American Football' },
  { etid: 62, name: 'Soccer' },
  { etid: 64, name: 'Esports' },
  { etid: 67, name: 'Boat Racing' },
  { etid: 69, name: 'Wrestling' },
]

export default DEFAULT_SPORTS

/**
 * Returns sports list formatted for the general-lock events data structure.
 * Each sport has sportsId, name, enabled flag, and empty tree for lazy loading.
 */
export const getSportsEventsData = () =>
  DEFAULT_SPORTS.map(s => ({
    sportsId: s.etid,
    name: s.name,
    enabled: false,
    tree: [{
      submarketId: 'loading',
      name: 'Loading...',
      enabled: false,
      subtree: []
    }]
  }))
