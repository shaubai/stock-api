// GET /api/cron/refresh-id-list
//
// Scheduled by Vercel Cron (see vercel.json's `crons` config) to run once a
// day, force-refreshing the ID list cache regardless of its current age.
// This is the primary refresh mechanism — api/id-list.js's on-demand
// fallback refresh only exists as a safety net for when this hasn't run
// yet (e.g. right after first deploy) or has failed.
//
// Vercel signs cron requests with a bearer token matching the CRON_SECRET
// env var, so we verify that to make sure this isn't triggered by an
// arbitrary public request (this endpoint does a Firestore write, so it
// shouldn't be left open).

const { refreshCache } = require('../../lib/idListCache');

module.exports = async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const idList = await refreshCache();
    console.log(`Refreshed id list cache: ${idList.length} ids`);
    res.status(200).json({ success: true, count: idList.length });
  } catch (error) {
    console.error('Error refreshing id list cache:', error);
    res.status(500).json({
      error: 'Failed to refresh id list cache',
      message: error.message,
    });
  }
};
