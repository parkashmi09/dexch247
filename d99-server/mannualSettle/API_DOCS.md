# Manual Settlement API Documentation

## Base URL
`/api/internalsettle`

---

## 1. Get MO/BM Matches (`/momatches`)

Fetches a list of Match Odds (MO) and Bookmaker (BM) matches, grouped by `game_type`.

### Request
**Method:** `GET`  
**Endpoint:** `/momatches`  
**Headers:**
- `Authorization`: Bearer <token>

**Query Parameters:**
| Parameter | Type    | Description                           | Default |
|-----------|---------|---------------------------------------|---------|
| `limit`   | Integer | Number of records to return           | 100     |
| `offset`  | Integer | Number of records to skip             | 0       |

### Response
**Success Code:** `200 OK`

**Response Body:**
```json
{
  "success": true,
  "data": [
    {
      "matchId": "123456",
      "eventId": "987654",
      "gameType": "MO",          // "MO" or "BM"
      "matchTitle": "Team A vs Team B",
      "teamOne": "Team A",
      "teamTwo": "Team B",
      "totalBets": 15,
      "counts": 2                // Count of selections (runners)
    },
    {
      "matchId": "123456",
      "eventId": "987654",
      "gameType": "BM",
      "matchTitle": "Team A vs Team B",
      "teamOne": "Team A",
      "teamTwo": "Team B",
      "totalBets": 10,
      "counts": 2
    }
  ]
}
```

---

## 2. Get Fancy Open Bets (`/fanmatches`)

Fetches open fancy bets (FAN), grouped by specific market types.
Returns separate arrays for known market types and a specialized detailed breakdown for others.

### Request
**Method:** `GET`  
**Endpoint:** `/fanmatches`  
**Headers:**
- `Authorization`: Bearer <token>

**Query Parameters:**
| Parameter | Type    | Description                           | Default |
|-----------|---------|---------------------------------------|---------|
| `limit`   | Integer | Number of records to return           | 100     |
| `offset`  | Integer | Number of records to skip             | 0       |

### ResponseStructure

The response data object contains keys for specific fancy markets.
Any market type NOT in the predefined list is returned in `others`.

**Keys for Predefined Markets:**
- `1st Innings 6 Overs Line`
- `2nd Innings 6 Overs Line`
- `...` (various over lines)
- `Over By Over`
- `Ball By Ball`
- `Normal`
- `khado`
- `meter`
- `fancy1`
- `oddeven`
- `others` (Fallback for any other market type)

**Response Body Example:**
```json
{
  "success": true,
  "data": {
    "1st Innings 6 Overs Line": [
      {
        "matchId": "112233",
        "eventId": "445566",
        "matchTitle": "Team X vs Team Y",
        "marketType": "1st Innings 6 Overs Line",
        "gameType": "FAN",
        "totalBets": 5,
        "bets": [
          {
            "id": 101,
            "userId": 50,
            "betType": "Yes",
            "selectionName": "45",
            "marketType": "1st Innings 6 Overs Line",
            "gameType": "FAN",
            "teamOne": "Team X",
            "teamTwo": "Team Y",
            "odds": 1.9,
            "stakeAmount": 1000,
            "liability": 1000,
            "status": "open",
            "createdAt": "2024-02-16T10:00:00.000Z",
            "counts": 2
            // ... other bet fields
          }
        ]
      }
    ],
    "others": [
       {
        "matchId": "998877",
        "eventId": "556677",
        "matchTitle": "Team Z vs Team W",
        "marketType": "Game winner 1/3", // Specific market type is preserved here
        "gameType": "FAN",
        "totalBets": 3,
        "bets": [ ... ]
      }
    ]
  }
}
```
