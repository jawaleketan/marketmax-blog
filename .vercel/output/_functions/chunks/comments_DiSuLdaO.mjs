import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region api/comments.js
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
function isSpam(body, email) {
	return [
		/\b(viagra|cialis|casino|lottery|winner|congratulations|click here|buy now)\b/i,
		/https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i,
		/(.)\1{10,}/
	].some((p) => p.test(body) || p.test(email || ""));
}
function sanitize(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").trim().slice(0, 2e3);
}
var comments_default = async (request) => {
	if (request.method === "OPTIONS") return new Response(null, {
		status: 204,
		headers: corsHeaders
	});
	if (!supabaseUrl || !supabaseKey) {
		if (request.method === "GET") return new Response(JSON.stringify([]), { headers: {
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
	const slug = new URL(request.url).searchParams.get("slug");
	if (request.method === "GET") {
		if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		const res = await supabaseRest(`comments?slug=eq.${encodeURIComponent(slug)}&approved=eq.true&select=id,author_name,body,created_at&order=created_at.asc`);
		const data = await res.json();
		if (!res.ok) return new Response(JSON.stringify({ error: data.message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		return new Response(JSON.stringify(data || []), { headers: {
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
		const { slug: bodySlug, author_name, author_email, body: commentBody } = body;
		if (!bodySlug || !author_name || !commentBody) return new Response(JSON.stringify({ error: "Missing required fields: slug, author_name, body" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		if (author_name.length > 100) return new Response(JSON.stringify({ error: "Name too long" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		if (isSpam(commentBody, author_email)) return new Response(JSON.stringify({
			success: true,
			message: "Comment submitted for review."
		}), {
			status: 201,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			}
		});
		const res = await supabaseRest("comments", {
			method: "POST",
			body: JSON.stringify({
				slug: bodySlug,
				author_name: sanitize(author_name),
				author_email: author_email ? sanitize(author_email) : null,
				body: sanitize(commentBody),
				approved: false
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
			message: "Comment submitted for moderation. It will appear after approval."
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
//#region src/pages/api/comments.js
var comments_exports = /* @__PURE__ */ __exportAll({
	ALL: () => ALL,
	prerender: () => false
});
async function ALL({ request }) {
	return comments_default(request);
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/comments@_@js
var page = () => comments_exports;
//#endregion
export { page };
