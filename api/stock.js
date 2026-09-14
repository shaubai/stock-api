// TWSE Stock API Proxy
// This endpoint proxies requests to Taiwan Stock Exchange API
// to avoid CORS issues in web browsers

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
    // Get stock symbols from query parameter
    // Example: ?symbols=2330,2317,2454
    const { symbols } = req.query;

    if (!symbols) {
      res.status(400).json({ error: 'Missing symbols parameter' });
      return;
    }

    // Convert comma-separated symbols to TWSE format
    // Example: 2330,2317 -> tse_2330.tw|tse_2317.tw
    const symbolList = symbols.split(',').map(s => s.trim());
    const exChList = symbolList.map(s => `tse_${s}.tw`).join('|');

    // Call TWSE API
    const twseUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${exChList}`;
    const response = await fetch(twseUrl);

    if (!response.ok) {
      throw new Error(`TWSE API returned ${response.status}`);
    }

    const data = await response.json();

    // Return the data
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({
      error: 'Failed to fetch stock data',
      message: error.message
    });
  }
};
