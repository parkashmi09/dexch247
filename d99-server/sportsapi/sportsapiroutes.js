

//===========


// routes/sportsRoutes.js
import express from "express";
import mw from "./sportsmiddleware.js";
import sportsQueue from "./queues/sportsQues.js";
// import ctlinplay from "./sportsapiallmatchescontroller.js";
// import ctlallmatches from "../sportsapiallmatchescontroller.js";
import ctlresult from "./sportsResultcontroller.js";
import { QueueEvents } from "bullmq";

const router = express.Router();

const queueEvents = new QueueEvents("sports", {
  connection: sportsQueue.client, // reuse ioredis from the queue
});

queueEvents
  .waitUntilReady()
  .then(() => {
    console.log("QueueEvents ready – synchronous sports routes online ✅");
  })
  .catch((err) => {
    console.error("QueueEvents failed to start", err);
    process.exit(1); // fail fast if Redis is mis-configured
  });

/* ───────────────────────── helper ───────────────────────────── */
function queueHandler(controllerName) {
  return async (req, res, next) => {
    try {
      const job = await sportsQueue.add(controllerName, {
        controller: controllerName,
        payload: {
          params: req.params,
          query: req.query,
          body: req.body,
        },
      });

      /* ── WAIT FOR WORKER & FORWARD ORIGINAL JSON ── */
      const { statusCode, data } = await job.waitUntilFinished(queueEvents);

      return res.status(statusCode || 200).json(data);
    } catch (err) {
      next(err);
    }
  };
}

/* ────────────────  ROUTES  ──────────────── */

// In-play
// router.post("/inplay", mw, queueHandler("getInplayData"));
router.get("/allinplay", mw, queueHandler("getAllEnabledGames"));
// router.get("/inplayGameId/:gameId", mw, ctlinplay.getInPlayByGameId);

// Result
router.get("/event-result", mw, ctlresult.getEventResult);
router.get("/event-list-result", mw, ctlresult.getEventListResult);

// Matches
router.get("/all-matches", mw, queueHandler("getAllMatches"));
router.get("/matches/:gameId", mw, queueHandler("getMatchesByGameId"));
router.get(
  "/matches-by-date/:dateType",
  mw,
  queueHandler("getMatchesByDate")
);

// router.get("/matches/:dateType/:gameId", mw, ctlallmatches.getMatchesByDateGame);

// Series & events
router.get("/getSeries", mw, queueHandler("getCompetitions"));
router.get("/getMatchesBySportsID", mw, queueHandler("getEventsBySportsID"));
router.get(
  "/getMatchesBySportsIDSeriesID",
  mw,
  queueHandler("getEventsBySeriesAndSportsID")
);
router.get("/allSportsID", mw, queueHandler("getAllSportsID"));

// IDs & odds
router.get("/market-ids-v1", mw, queueHandler("getMarketIdsV1"));
router.get("/market-ids-v2", mw, queueHandler("getMarketIdsV2"));
router.get("/market-odds", mw, queueHandler("getMarketOdds"));
router.get("/bookmakerFancy", mw, queueHandler("getBookmakerFancy"));
router.get("/lineMarket", mw, queueHandler("getLineMarket"));
router.get("/marketDetails", mw, queueHandler("getMarketDetails"));

// Events
router.get("/eventList", mw, queueHandler("getEventListBySeriesId"));
router.get("/event-details", queueHandler("getEventDetailsByEventId"));

// Sports-config
router.get("/sports-config", mw, queueHandler("getSportsConfig"));
router.post("/sports-config", mw, queueHandler("addGame"));
router.put("/sports-config/:id", mw, queueHandler("updateGame"));
router.delete("/sports-config/:id", mw, queueHandler("deleteGame"));

// Sports CRUD
router.get("/sports", mw, queueHandler("getAllSports"));
router.get("/sports/:id", mw, queueHandler("getSportById"));
router.put("/sports/:id", mw, queueHandler("updateSport"));

/* ────────────────  JOB STATUS ENDPOINT  ──────────────── */
router.get("/job/:id", async (req, res) => {
  const job = await sportsQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const state = await job.getState();
  if (state === "completed")
    return res.json({ state, result: job.returnvalue });
  if (state === "failed")
    return res.json({ state, reason: job.failedReason });

  res.json({ state, progress: job.progress });
});

export default router;

