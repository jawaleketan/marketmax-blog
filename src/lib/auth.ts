import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

let cachedEnv: Record<string, string> | null = null;

function loadEnv(): Record<string, string> {
  if (cachedEnv) return cachedEnv;
  cachedEnv = {};
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) return;
      cachedEnv[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    });
  } catch {}
  return cachedEnv;
}

function getEnv(key: string): string {
  return process.env[key] || loadEnv()[key] || "";
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((c) => {
    const [key, ...val] = c.split("=");
    if (key) cookies[key.trim()] = val.join("=").trim();
  });
  return cookies;
}

export async function getCurrentUser(request: Request): Promise<AdminUser | null> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const accessToken = cookies["sb-access-token"];

  if (!accessToken) return null;

  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_ANON_KEY");

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error } = await client.auth.getUser(accessToken);

  if (error || !user) return null;

  const serviceClient = createClient(url, getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: admin } = await serviceClient
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!admin) return null;

  return { id: user.id, email: user.email || "", role: admin.role };
}

export async function signIn(email: string, password: string) {
  const client = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"));
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  if (!data.session) return { error: "No session created" };

  return { session: data.session, user: data.user };
}

export async function signOut(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const accessToken = cookies["sb-access-token"];
  if (accessToken) {
    const client = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await client.auth.admin.signOut(accessToken);
  }
}
