import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually parse .env file
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  process.env[key] = value;
}

import { readdir, readFile } from "node:fs/promises";
import { join as j } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

console.log("Connecting to Supabase:", SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BLOG_DIR = j(__dirname, "..", "src", "content", "blog");

interface Frontmatter {
  title: string;
  description: string;
  publishDate: string | Date;
  author?: string;
  category: string;
  tags: string[];
  featured?: boolean;
  readingTime?: string;
  image?: string;
  series?: string;
}

async function main() {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  console.log(`Found ${files.length} Markdown files to import.\n`);

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const raw = await readFile(j(BLOG_DIR, file), "utf-8");
    const { data: fm, content: mdBody } = matter(raw) as { data: Frontmatter; content: string };

    const htmlBody = marked.parse(mdBody) as string;

    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      console.log(`  SKIP  ${slug} (already exists in Supabase)`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from("posts").insert({
      title: fm.title,
      slug,
      description: fm.description,
      content: htmlBody,
      category: fm.category,
      tags: fm.tags || [],
      author: fm.author || "Ketan Jawale",
      image: fm.image || null,
      featured: fm.featured || false,
      reading_time: fm.readingTime || null,
      series: fm.series || null,
      status: "published",
      publish_date: new Date(fm.publishDate).toISOString(),
    });

    if (error) {
      console.error(`  FAIL  ${slug}: ${error.message}`);
      continue;
    }

    console.log(`  OK    ${slug}`);
    imported++;
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`);
}

main();
