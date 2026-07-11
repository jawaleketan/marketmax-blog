const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join("/tmp", "view-counts.json");

function readCounts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function writeCounts(counts) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(counts));
  } catch {}
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const counts = readCounts();

  if (event.httpMethod === "GET") {
    const slug = event.queryStringParameters?.slug;
    if (!slug) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing slug" }) };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ slug, count: counts[slug] || 0 }),
    };
  }

  if (event.httpMethod === "POST") {
    const { slug } = JSON.parse(event.body || "{}");
    if (!slug) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing slug" }) };
    }
    counts[slug] = (counts[slug] || 0) + 1;
    writeCounts(counts);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ slug, count: counts[slug] }),
    };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
