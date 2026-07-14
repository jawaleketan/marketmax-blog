import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");

function loadEnv(path) {
  try {
    const content = readFileSync(path, "utf-8");
    const env = {};
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      env[key] = value;
      process.env[key] = value;
    });
    return env;
  } catch {
    return {};
  }
}

loadEnv(envPath);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.");
  console.error(`Expected .env at: ${envPath}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const readline = await import("readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("\n========================================");
  console.log("   MarketMax Blog - Admin Setup");
  console.log("========================================\n");

  const email = await ask("Admin email: ");
  const password = await ask("Admin password (min 6 chars): ");

  if (!email || !password) {
    console.error("\nEmail and password are required.");
    rl.close();
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("\nPassword must be at least 6 characters.");
    rl.close();
    process.exit(1);
  }

  console.log("\nCreating admin user in Supabase Auth...");

  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message.includes("already exists")) {
      console.log("User already exists in Auth. Fetching user ID...");

      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find((u) => u.email === email);

      if (existing) {
        console.log(`Found existing user: ${existing.id}`);

        const { error: insertError } = await supabase
          .from("admins")
          .upsert({ id: existing.id, email, role: "admin" }, { onConflict: "id" });

        if (insertError) {
          console.error("Failed to insert admin record:", insertError.message);
        } else {
          console.log("Admin record updated successfully.");
        }
      }

      rl.close();
      process.exit(0);
    }

    console.error("Failed to create user:", createError.message);
    rl.close();
    process.exit(1);
  }

  console.log(`User created: ${userData.user.id}`);

  const { error: adminError } = await supabase
    .from("admins")
    .insert({ id: userData.user.id, email, role: "admin" });

  if (adminError) {
    console.error("Failed to insert admin record:", adminError.message);
    console.error("The user was created in Auth but the admins table insert failed.");
    console.error("You may need to manually insert into the admins table.");
  } else {
    console.log("Admin record created successfully.");
  }

  console.log("\nSetup complete! You can now log in at /admin/login");
  console.log(`  Email: ${email}`);
  rl.close();
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
