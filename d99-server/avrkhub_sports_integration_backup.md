# AVRKHUB Sports API Integration Backup

This file contains the code changes made for the AVRKHUB Sports API integration (Events/Odds) before they were reverted.

## 1. .env Changes
```env
# Sports API (Odds/Events) version switch: v1 = old Diamond, v2 = new AVRKHUB (default: v2)
SPORTS_API_VERSION=v1
AVRKHUB_SPORTS_BASE_URL=https://diamond-sports-api-demo-s2.avrkhub.in
AVRKHUB_SPORTS_KEY=A2L9X7P3Q8ZM
```

## 2. services/CricketService.js Implementation

### fetchCricketData (v2 block)
```javascript
      if (SPORTS_API_VERSION === 'v2') {
        const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/get_latest_events`, {
          params: { key: AVRKHUB_SPORTS_KEY },
          timeout: 6000
        });
        const rawData = response.data?.data?.data || [];
        const t1 = rawData
          .filter(e => String(e.sportId) === String(id))
          .map(e => ({
            gmid: e.id,
            ename: e.name,
            name: e.name,
            status: "OPEN",
            gscode: 1
          }));
        // Also write into the key that odds cron reads so odds keep working
        const flatList = t1; // same shape
        redis.setex(`alleventss:${id}`, 120, JSON.stringify(flatList)).catch(() => {});
        return { success: true, data: { t1, t2: [] } };
      }
```

### GetMatchPrivateData (v2 block)
```javascript
      if (SPORTS_API_VERSION === 'v2') {
        const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/gamedataPrivate`, {
            params: { gmid, etid: sid, key: AVRKHUB_SPORTS_KEY },
            timeout: 6000
        });
        let innerData = response.data?.data || [];
        // Unwrap if AVRKHUB double-wraps in { data: [...] }
        if (innerData && !Array.isArray(innerData) && Array.isArray(innerData.data)) {
            innerData = innerData.data;
        }
        // Also cache in old key so odds cron stays warm
        if (Array.isArray(innerData) && innerData.length > 0) {
            redis.setex(`odds:${gmid}`, 3, JSON.stringify(innerData)).catch(() => {});
        }
        return { success: true, data: innerData };
      }
```

### fetchTreeData (v2 block)
```javascript
    if (SPORTS_API_VERSION === 'v2') {
       const key = `tree_data_v2`;
       return await getCachedData(key, async () => {
          const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/treedata`, {
             params: { key: AVRKHUB_SPORTS_KEY },
             timeout: 6000
          });
          return response.data;
       });
    }
```

## 3. controller/sports/cricket/cricketController.js Changes

### fetchCricketData
```javascript
        try {
            const cricketData = await CricketService.fetchCricketData(id);
            return res.status(200).json({
                success: true,
                data: cricketData
            });
        }
```

### GetMatchPrivateData
```javascript
        try {
            const matchPrivateData = await CricketService.GetMatchPrivateData(gmid,sid);
            return res.status(200).json({
                success: true,
                data: matchPrivateData
            });
        }
```
