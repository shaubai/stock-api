# Stock API Proxy

A simple Node.js API proxy for Taiwan Stock Exchange (TWSE) data, deployed on Vercel.

## Purpose

This API solves CORS issues when accessing TWSE APIs from web browsers.

## Endpoints

### GET /api/stock

Get real-time stock quotes.

**Parameters:**
- `symbols` - Comma-separated stock symbols (e.g., `2330,2317,2454`)

**Example:**
```
GET /api/stock?symbols=2330,2317,2454
```

### GET /api/history

Get historical stock data.

**Parameters:**
- `symbol` - Stock symbol (e.g., `2330`)
- `date` - Date in YYYYMMDD format (e.g., `20260901`)

**Example:**
```
GET /api/history?symbol=2330&date=20260901
```

### GET /api/id-list

Returns a cached ID list fetched from an external JSON API
(`ID_LIST_SOURCE_URL`). Cache is refreshed once a day by a Vercel Cron job
(`/api/cron/refresh-id-list`, see `vercel.json`), so this endpoint normally
just reads Firestore and responds immediately. If the cache is missing or
older than 24h (e.g. cron hasn't run yet), it synchronously refreshes as a
fallback.

**Example:**
```
GET /api/id-list
```

**Response:**
```json
{ "idList": [...], "cached": true, "updatedAt": 1234567890000 }
```

## Environment Variables

Set these in the Vercel project settings (Settings → Environment Variables):

- `FIREBASE_SERVICE_ACCOUNT_KEY` — the Firebase service account JSON, as a
  single-line string. To generate:
  1. Go to the Firebase Console → Project Settings → Service Accounts
     (project: `nav-stock-analysis-app-16f6d`, same project the Flutter app
     uses for Firestore)
  2. Click "Generate new private key" — downloads a JSON file
  3. Minify it to one line (e.g. `jq -c . key.json`) and paste the whole
     thing as the env var value
  4. **Keep this file out of git** — it's a credential, not a config file
- `ID_LIST_SOURCE_URL` — the external JSON API URL that `/api/id-list`
  fetches and caches
- `CRON_SECRET` — a random secret string; Vercel automatically sends this
  as a bearer token when it triggers the cron job, and
  `api/cron/refresh-id-list.js` verifies it to reject non-cron requests.
  Generate any random string (e.g. `openssl rand -hex 32`).

## Local Development

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

## Tech Stack

- Node.js
- Vercel Serverless Functions
- node-fetch

## Data Source

- Taiwan Stock Exchange (TWSE) official APIs
- Real-time quotes: ~20 second delay
- Historical data: Daily OHLCV
