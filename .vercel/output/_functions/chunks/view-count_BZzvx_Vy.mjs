import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region api/view-count.js
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_ANON_KEY;
var corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
};
function supabaseHeaders() {
	return {
		apikey: supabaseKey,
		Authorization: `Bearer ${supabaseKey}`,
		"Content-Type": "application/json"
	};
}
var view_count_default = async (request) => {
	if (request.method === "OPTIONS") return new Response(null, {
		status: 204,
		headers: corsHeaders
	});
	if (!supabaseUrl || !supabaseKey) {
		if (request.method === "GET") {
			const slug = new URL(request.url).searchParams.get("slug");
			if (slug) return new Response(JSON.stringify({
				slug,
				count: 0
			}), { headers: {
				"Content-Type": "application/json",
				...corsHeaders
			} });
			return new Response(JSON.stringify({}), { headers: {
				"Content-Type": "application/json",
				...corsHeaders
			} });
		}
		return new Response(JSON.stringify({
			slug: "",
			count: 0
		}), { headers: {
			"Content-Type": "application/json",
			...corsHeaders
		} });
	}
	let slug = new URL(request.url).searchParams.get("slug");
	if (!slug && request.method === "POST") try {
		slug = (await request.json())?.slug;
	} catch {}
	if (!slug) {
		if (request.method === "GET") {
			const res = await fetch(`${supabaseUrl}/rest/v1/page_views?select=slug,count&order=count.desc`, { headers: supabaseHeaders() });
			const data = await res.json();
			if (!res.ok) return new Response(JSON.stringify({ error: data.message }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders
				}
			});
			const counts = {};
			data?.forEach((row) => {
				counts[row.slug] = row.count;
			});
			return new Response(JSON.stringify(counts), { headers: {
				"Content-Type": "application/json",
				...corsHeaders
			} });
		}
	}
	if (request.method === "GET") {
		const count = (await (await fetch(`${supabaseUrl}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}&select=count`, { headers: supabaseHeaders() })).json())?.[0]?.count || 0;
		return new Response(JSON.stringify({
			slug,
			count
		}), { headers: {
			"Content-Type": "application/json",
			...corsHeaders
		} });
	}
	if (request.method === "POST") {
		const currentCount = (await (await fetch(`${supabaseUrl}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}&select=count`, { headers: supabaseHeaders() })).json())?.[0]?.count || 0;
		const newCount = currentCount + 1;
		let res;
		if (currentCount > 0) res = await fetch(`${supabaseUrl}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}`, {
			method: "PATCH",
			headers: {
				...supabaseHeaders(),
				Prefer: "return=representation"
			},
			body: JSON.stringify({ count: newCount })
		});
		else res = await fetch(`${supabaseUrl}/rest/v1/page_views`, {
			method: "POST",
			headers: {
				...supabaseHeaders(),
				Prefer: "return=representation"
			},
			body: JSON.stringify({
				slug,
				count: 1
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
			slug,
			count: newCount
		}), { headers: {
			"Content-Type": "application/json",
			...corsHeaders
		} });
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
//#region src/pages/api/view-count.js
var view_count_exports = /* @__PURE__ */ __exportAll({
	ALL: () => ALL,
	prerender: () => false
});
async function ALL({ request }) {
	return view_count_default(request);
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/view-count@_@js
var page = () => view_count_exports;
//#endregion
export { page };
