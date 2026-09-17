// GET /api/id-list
//
// Returns a cached ID list fetched from an external JSON API. The cache is
// refreshed once a day by a Vercel Cron job (see api/cron/refresh-id-list.js
// and vercel.json). This endpoint just reads the cache — see
// lib/idListCache.js for the one exception (cache missing/stale falls back
// to a synchronous refresh as a safety net).

const { getIdList } = require('../lib/idListCache');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { idList, cached, updatedAt } = await getIdList();
    res.status(200).json({ idList, cached, updatedAt });
  } catch (error) {
    console.error('Error fetching id list:', error);
    res.status(500).json({
      error: 'Failed to fetch id list',
      message: error.message,
    });
  }
};
