import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { Database } from "./supabase-types";

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

export const supabase = createClient<Database>(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"));

export function getSupabaseClient() {
  return createClient<Database>(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"));
}

export function getSupabaseServerClient() {
  return createClient<Database>(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY") || getEnv("SUPABASE_ANON_KEY"));
}

export function getSupabaseServiceClient() {
  return createClient<Database>(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
