# Profit Loss Report

## Overview
The Profit Loss Report provides a comprehensive view of the profit and loss status for all direct downline users and staff. It aggregates data from the `Wallet` model to show the current financial standing.

## API Endpoint
`GET /api/admin/pl/all`

## Authentication
Requires a valid Bearer token.
Middleware: `authMiddleware`

## Query Parameters
| Parameter | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `page` | Integer | Page number for pagination | 1 |
| `limit` | Integer | Number of records per page | 50 |
| `search` | String | Search by username | (empty) |

## Logic
1.  **Authentication**: Verifies the logged-in user (Owner or Staff).
2.  **Downline Identification**:
    *   **Owners**: Fetches direct staff via `parent_owner_id` and direct users via `parent_owner_id`.
    *   **Staff**: Fetches direct staff via `parent_id` and direct users via `parent_staff_id`.
3.  **Data Retrieval**: Queries the `Wallet` table for wallets matching the identified child Staff IDs or User IDs.
4.  **Placeholders**: Currently, `casino_pts`, `sport_pts`, and `third_party_pts` are set to `0` as placeholders for future implementation.
5.  **Profit/Loss**: Uses the `profit_loss` field from the `Wallet` model.

## Response Format
```json
{
  "success": true,
  "data": [
    {
      "wallet_id": 4,
      "username": "testuser2",
      "level": "User",
      "casino_pts": 0,
      "sport_pts": 0,
      "third_party_pts": 0,
      "profit_loss": "100.00",
      "verdict": "profit"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "total_pages": 1
  },
  "summary": {
    "grand_total": "100.00"
  }
}
```
