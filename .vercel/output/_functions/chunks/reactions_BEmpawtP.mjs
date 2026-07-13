import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region api/reactions.js
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_ANON_KEY;
var corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
};
function supabaseRest(path, options = {}) {
	const url = `${supabaseUrl}/rest/v1/${path}`;
	return fetch(url, {
		...options,
		headers: {
			apikey: supabaseKey,
			Authorization: `Bearer ${supabaseKey}`,
			"Content-Type": "application/json",
			Prefer: options.prefer || "return=representation",
			...options.headers
		}
	});
}
var VALID_TYPES = [
	"like",
	"helpful",
	"insightful"
];
var reactions_default = async (request) => {
	if (request.method === "OPTIONS") return new Response(null, {
		status: 204,
		headers: corsHeaders
	});
	if (!supabaseUrl || !supabaseKey) {
		if (request.method === "GET") return new Response(JSON.stringify({
			like: 0,
			helpful: 0,
			insightful: 0
		}), { headers: {
			"Content-Type": "application/json",
			...corsHeaders
		} });
		return new Response(JSON.stringify({ error: "Service unavailable locally" }), {
			status: 503,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
	}
	const slug = new URL(request.url).searchParams.get("slug");
	if (request.method === "GET") {
		if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		const res = await supabaseRest(`reactions?slug=eq.${encodeURIComponent(slug)}&select=type`);
		const data = await res.json();
		if (!res.ok) return new Response(JSON.stringify({ error: data.message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		const counts = {
			like: 0,
			helpful: 0,
			insightful: 0
		};
		data?.forEach((r) => {
			if (counts[r.type] !== void 0) counts[r.type]++;
		});
		return new Response(JSON.stringify(counts), { headers: {
			"Content-Type": "application/json",
			...corsHeaders
		} });
	}
	if (request.method === "POST") {
		let body;
		try {
			body = await request.json();
		} catch {
			return new Response(JSON.stringify({ error: "Invalid JSON" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders
				}
			});
		}
		const { type, fingerprint, slug: bodySlug } = body;
		if (!bodySlug || !type || !fingerprint) return new Response(JSON.stringify({ error: "Missing required fields: slug, type, fingerprint" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		if (!VALID_TYPES.includes(type)) return new Response(JSON.stringify({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		const existing = await (await supabaseRest(`reactions?slug=eq.${encodeURIComponent(bodySlug)}&type=eq.${type}&fingerprint=eq.${encodeURIComponent(fingerprint)}&select=id`)).json();
		if (existing && existing.length > 0) {
			await supabaseRest(`reactions?id=eq.${existing[0].id}`, {
				method: "DELETE",
				prefer: "return=minimal"
			});
			return new Response(JSON.stringify({
				toggled: "removed",
				type
			}), { headers: {
				"Content-Type": "application/json",
				...corsHeaders
			} });
		}
		const res = await supabaseRest("reactions", {
			method: "POST",
			body: JSON.stringify({
				slug: bodySlug,
				type,
				fingerprint
			})
		});
		const data = await res.json();
		if (!res.ok) return new Response(JSON.stringify({ error: data.message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		return new Response(JSON.stringify({
			toggled: "added",
			type
		}), {
			status: 201,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
	}
	return new Response(JSON.stringify({ error: "Method not allowed" }), {
		status: 405,
		headers: {
			"Content-Type": "application/json",
			...corsHeaders
		}
	});
};
//#endregion
//#region src/pages/api/reactions.js
var reactions_exports = /* @__PURE__ */ __exportAll({
	ALL: () => ALL,
	prerender: () => false
});
async function ALL({ request }) {
	return reactions_default(request);
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/reactions@_@js
var page = () => reactions_exports;
//#endregion
export { page };
