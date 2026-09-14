// TWSE Historical Data API Proxy
// This endpoint proxies requests to Taiwan Stock Exchange historical data API

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get parameters from query
    // Example: ?symbol=2330&date=20260901
    const { symbol, date } = req.query;

    if (!symbol || !date) {
      res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both symbol and date are required'
      });
      return;
    }

    // Call TWSE historical data API
    // date format: YYYYMMDD (e.g., 20260901 for September 2026)
    const twseUrl = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${date}&stockNo=${symbol}&response=json`;
    const response = await fetch(twseUrl);

    if (!response.ok) {
      throw new Error(`TWSE API returned ${response.status}`);
    }

    const data = await response.json();

    // Return the data
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
};
