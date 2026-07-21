import('./services/CricketService.js').then(async ({ default: CricketService }) => {
  try {
    const events = await CricketService.fetchCricketData(4);
    console.log('--- fetchCricketData output ---');
    console.log(JSON.stringify(events, null, 2).substring(0, 500));
    const gmid = events.data.t1[0]?.gmid;
    console.log('Selected gmid:', gmid);
    if (!gmid) return process.exit(0);
    const odds = await CricketService.GetMatchPrivateData(gmid, 4);
    console.log('--- GetMatchPrivateData output ---');
    console.log(JSON.stringify(odds, null, 2).substring(0, 500));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
