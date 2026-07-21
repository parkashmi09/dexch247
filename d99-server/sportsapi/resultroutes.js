


import express from 'express';
import mw from './sportsmiddleware.js';
import ctlresult from '../sportsapi/sportsResultcontroller.js';

const router = express.Router();

// Result
router.get('/event-result', mw, ctlresult.getEventResult);
router.get('/event-list-result', mw, ctlresult.getEventListResult);

export default router;
