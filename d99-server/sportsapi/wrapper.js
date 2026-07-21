

import adapt from './utils/adpat.js';

// In-play
import { getInplayData, getAllEnabledGames, getInPlayByGameId } from '../sportsapi/sportsapiinplaycontroller.js';
import { getAllSportsdata, getAllMatches, getMatchesByGameId, getMatchesByDate, getMatchesByDateGame } from '../sportsapi/sportsapiallmatchescontroller.js';
import { getCompetitions } from '../sportsapi/sportsapiseriescontroller.js';
import { getEventsBySportsID, getEventsBySeriesAndSportsID } from '../sportsapi/sportsmatchescontroller.js';
import { getAllSportsID } from '../sportsapi/sportsapigamesidcontroller.js';
import { getMarketIdsV1, getMarketIdsV2, getMarketOdds } from '../sportsapi/sportsapimarketcontroller.js';
import { getBookmakerFancy } from '../sportsapi/sportsapibookmarkfancycontroller.js';
import { getLineMarket } from '../sportsapi/sportsapigetlinecontroller.js';
import { getMarketDetails } from '../sportsapi/sportsapimarketdetailscontroller.js';
import { getEventListBySeriesId, getEventDetailsByEventId } from '../sportsapi/sportsapieventscontroller.js';
import { getSportsConfig, addGame, updateGame, deleteGame } from '../sportsapi/sportsconfigcontroller.js';
import { getAllSports, getSportById, updateSport } from '../sportsapi/sportsconfigcontroller.js';
import { getEventResult, getEventListResult } from '../sportsapi/sportsResultcontroller.js';

// Exports
export const Inplay = {
  getInplayData: adapt(getInplayData),
  getAllEnabledGames: adapt(getAllEnabledGames),
  getAllSportsdata: adapt(getAllSportsdata),
  getInPlayByGameId: adapt(getInPlayByGameId),
};

export const Matches = {
  getAllMatches: adapt(getAllMatches),
  getMatchesByGameId: adapt(getMatchesByGameId),
  getMatchesByDate: adapt(getMatchesByDate),
  getMatchesByDateGame: adapt(getMatchesByDateGame),
  getCompetitions: adapt(getCompetitions),
  getEventsBySportsID: adapt(getEventsBySportsID),
  getEventsBySeriesAndSportsID: adapt(getEventsBySeriesAndSportsID),
};

export const IDsOdds = {
  getAllSportsID: adapt(getAllSportsID),
  getMarketIdsV1: adapt(getMarketIdsV1),
  getMarketIdsV2: adapt(getMarketIdsV2),
  getMarketOdds: adapt(getMarketOdds),
  getBookmakerFancy: adapt(getBookmakerFancy),
  getLineMarket: adapt(getLineMarket),
  getMarketDetails: adapt(getMarketDetails),
};

export const Events = {
  getEventListBySeriesId: adapt(getEventListBySeriesId),
  getEventDetailsByEventId: adapt(getEventDetailsByEventId),
};

export const SportsConfig = {
  getSportsConfig: adapt(getSportsConfig),
  addGame: adapt(addGame),
  updateGame: adapt(updateGame),
  deleteGame: adapt(deleteGame),
  getAllSports: adapt(getAllSports),
  getSportById: adapt(getSportById),
  updateSport: adapt(updateSport),
};

export const Results = {
  getEventResult: adapt(getEventResult),
  getEventListResult: adapt(getEventListResult),
};
