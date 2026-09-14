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
