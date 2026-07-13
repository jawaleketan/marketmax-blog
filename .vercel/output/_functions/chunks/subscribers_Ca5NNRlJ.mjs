import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region api/subscribers.js
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
function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
var subscribers_default = async (request) => {
	if (request.method === "OPTIONS") return new Response(null, {
		status: 204,
		headers: corsHeaders
	});
	if (!supabaseUrl || !supabaseKey) {
		if (request.method === "GET") return new Response(JSON.stringify({ count: 0 }), { headers: {
			"Content-Type": "application/json",
			...corsHeaders
		} });
		return new Response(JSON.stringify({
			success: true,
			message: "Service unavailable locally."
		}), {
			status: 201,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
	}
	if (request.method === "GET") {
		const res = await supabaseRest("subscribers?confirmed=eq.true&select=id");
		const data = await res.json();
		if (!res.ok) return new Response(JSON.stringify({ error: data.message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		return new Response(JSON.stringify({ count: data?.length || 0 }), { headers: {
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
		const { email } = body;
		if (!email || !isValidEmail(email)) return new Response(JSON.stringify({ error: "Valid email required" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		const existing = await (await supabaseRest(`subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}&select=id,confirmed`)).json();
		if (existing && existing.length > 0) {
			if (existing[0].confirmed) return new Response(JSON.stringify({
				success: true,
				message: "Already subscribed!"
			}), { headers: {
				"Content-Type": "application/json",
				...corsHeaders
			} });
			const updateRes = await supabaseRest(`subscribers?id=eq.${existing[0].id}`, {
				method: "PATCH",
				body: JSON.stringify({ confirmed: true })
			});
			if (!updateRes.ok) {
				const data = await updateRes.json();
				return new Response(JSON.stringify({ error: data.message }), {
					status: 500,
					headers: {
						"Content-Type": "application/json",
						...corsHeaders
					}
				});
			}
			return new Response(JSON.stringify({
				success: true,
				message: "Welcome back! You're now subscribed."
			}), {
				status: 201,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders
				}
			});
		}
		const res = await supabaseRest("subscribers", {
			method: "POST",
			body: JSON.stringify({
				email: email.toLowerCase(),
				confirmed: true
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
			success: true,
			message: "Subscribed! Welcome aboard."
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
//#region src/pages/api/subscribers.js
var subscribers_exports = /* @__PURE__ */ __exportAll({
	ALL: () => ALL,
	prerender: () => false
});
async function ALL({ request }) {
	return subscribers_default(request);
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/subscribers@_@js
var page = () => subscribers_exports;
//#endregion
export { page };
