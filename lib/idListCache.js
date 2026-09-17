// Shared logic for fetching, parsing, and caching an ID list from an
// external JSON API, backed by Firestore (see firestore.js for why).
//
// Two callers:
// - api/id-list.js: on-demand endpoint, returns cached data immediately if
//   fresh, or triggers a synchronous refresh if the cache is missing/stale
//   (shouldn't normally happen if the cron job is running, but this is a
//   safety net rather than the primary refresh mechanism).
// - api/cron/refresh-id-list.js: scheduled endpoint (see vercel.json cron
//   config), always force-refreshes regardless of cache freshness.

const fetch = require('node-fetch');
const { getFirestore } = require('./firestore');

// TODO: 換成實際的外部 JSON API 連結（使用者會另外提供）
const SOURCE_API_URL = process.env.ID_LIST_SOURCE_URL || '';

const CACHE_COLLECTION = 'stock_api_cache';
const CACHE_DOC_ID = 'id_list';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 天

/// 解析外部 API 回傳的 JSON，取出 id list。
///
/// TODO: 目前是預留骨架，需要依實際的 JSON 結構調整。先假設最常見的
/// 兩種形狀之一：頂層就是陣列 [{"id": ...}, ...]，或物件裡有一個
/// list 欄位 {"data": [...]} / {"items": [...]}。拿到實際範例後
/// 再改成精確解析。
function parseIdList(json) {
  if (Array.isArray(json)) {
    return json.map((item) => (typeof item === 'object' ? item.id : item));
  }
  const candidateKeys = ['data', 'items', 'list', 'ids'];
  for (const key of candidateKeys) {
    if (Array.isArray(json[key])) {
      return json[key].map((item) =>
        typeof item === 'object' ? item.id : item
      );
    }
  }
  throw new Error(
    'Unrecognized JSON shape from source API — update parseIdList() in lib/idListCache.js'
  );
}

/// 向外部 API 拿最新資料、解析、寫入 Firestore 快取。
async function refreshCache() {
  if (!SOURCE_API_URL) {
    throw new Error(
      'ID_LIST_SOURCE_URL environment variable is not set — see README.md'
    );
  }

  const response = await fetch(SOURCE_API_URL);
  if (!response.ok) {
    throw new Error(`Source API returned ${response.status}`);
  }

  const json = await response.json();
  const idList = parseIdList(json);

  const db = getFirestore();
  await db.collection(CACHE_COLLECTION).doc(CACHE_DOC_ID).set({
    idList,
    updatedAt: Date.now(),
  });

  return idList;
}

/// 讀取快取；若不存在或已過期（超過 CACHE_TTL_MS），同步重新整理一次。
///
/// 正常情況下 cron job 應該已經讓快取保持新鮮，這裡的重新整理只是
/// 防止 cron 漏跑或第一次部署時還沒有快取資料的保護機制。
async function getIdList() {
  const db = getFirestore();
  const docRef = db.collection(CACHE_COLLECTION).doc(CACHE_DOC_ID);
  const doc = await docRef.get();

  if (doc.exists) {
    const { idList, updatedAt } = doc.data();
    const age = Date.now() - updatedAt;
    if (age < CACHE_TTL_MS) {
      return { idList, cached: true, updatedAt };
    }
  }

  // 快取不存在或已過期，同步重新整理
  const idList = await refreshCache();
  return { idList, cached: false, updatedAt: Date.now() };
}

module.exports = { getIdList, refreshCache, CACHE_TTL_MS };
