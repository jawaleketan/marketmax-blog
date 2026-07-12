import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function error(status, msg) {
  return { statusCode: status, headers, body: JSON.stringify({ error: msg }) };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const store = getStore("view-counts");

    if (event.httpMethod === "GET") {
      const slug = event.queryStringParameters?.slug;
      if (!slug) {
        const all = await store.list();
        const counts = {};
        for (const key of all.blobs) {
          const raw = await store.get(key);
          if (raw) counts[key] = parseInt(raw, 10);
        }
        return { statusCode: 200, headers, body: JSON.stringify(counts) };
      }
      const raw = await store.get(slug);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ slug, count: raw ? parseInt(raw, 10) : 0 }),
      };
    }

    if (event.httpMethod === "POST") {
      const { slug } = JSON.parse(event.body || "{}");
      if (!slug) return error(400, "Missing slug");

      // Retry loop to handle concurrent writes (race condition fix)
      for (let attempt = 0; attempt < 5; attempt++) {
        const { value, metadata } = await store.getWithMetadata(slug);
        const current = value ? parseInt(value, 10) : 0;
        const next = current + 1;

        try {
          await store.set(slug, String(next), {
            metadata: {
              etag: metadata?.etag,
              updatedAt: new Date().toISOString(),
            },
          });
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ slug, count: next }),
          };
        } catch (e) {
          // ETag mismatch — retry with fresh value
          if (attempt === 4) throw e;
          continue;
        }
      }
    }

    return error(405, "Method not allowed");
  } catch (err) {
    console.error("View count error:", err);
    return error(500, "Internal error");
  }
};
