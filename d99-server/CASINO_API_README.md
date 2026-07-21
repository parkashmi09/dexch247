# Casino API Integration

This document explains how to use the updated Casino Controller that integrates with the Diamond API.

## Environment Variables Required

Add the following environment variables to your `.env` file:

```env
DIAMOND_BASE_URL=https://diamond-api.scoreswift.xyz
DIAMOND_API_KEY=your_api_key_here
```

## API Endpoints

### 1. POST /api/user/casino/all-data

Fetches casino data using POST request with body parameters.

**Request Body:**
```json
{
  "type": "baccarat2",
  "data": "22"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Response data from Diamond API
  }
}
```

### 2. GET /api/user/casino/result

Fetches casino data using GET request with query parameters.

**Query Parameters:**
- `type` (required): The casino game type
- `data` (required): Additional data parameter

**Example URL:**
```
GET /api/user/casino/result?type=baccarat2&data=22
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Response data from Diamond API
  }
}
```

## Error Handling

Both endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Type and data are required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to fetch casino data"
}
```

## Usage Examples

### Using POST endpoint:
```javascript
const response = await fetch('/api/user/casino/all-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'baccarat2',
    data: '22'
  })
});

const result = await response.json();
```

### Using GET endpoint:
```javascript
const response = await fetch('/api/user/casino/result?type=baccarat2&data=22');
const result = await response.json();
```

## Diamond API Integration

The controller makes requests to the Diamond API endpoint:
- **URL:** `${DIAMOND_BASE_URL}/casino/result`
- **Method:** GET
- **Headers:** 
  - `Accept: */*`
  - `key: ${DIAMOND_API_KEY}`
- **Query Parameters:**
  - `type`: Casino game type
  - `data`: Additional data parameter

## Notes

- The controller automatically handles API key authentication
- All responses are wrapped in a consistent format with `success` and `data`/`error` fields
- Proper error handling is implemented for both API errors and validation errors
- Console logging is included for debugging purposes 