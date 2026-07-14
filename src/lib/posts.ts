import { getSupabaseServerClient } from "./supabase";

export interface MergedPost {
  id: string;
  slug: string;
  data: {
    title: string;
    description: string;
    publishDate: Date;
    category: string;
    tags: string[];
    image?: string;
    author: string;
    readingTime?: string;
    featured: boolean;
    series?: string;
    updatedDate?: Date;
  };
  body: string;
  source: "markdown" | "supabase";
}

export async function getSupabasePosts(): Promise<MergedPost[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("publish_date", { ascending: false });

    if (!posts) return [];

    return posts.map((post) => ({
      id: post.slug,
      slug: post.slug,
      data: {
        title: post.title,
        description: post.description,
        publishDate: new Date(post.publish_date),
        category: post.category,
        tags: post.tags || [],
        image: post.image || undefined,
        author: post.author || "Ketan Jawale",
        readingTime: post.reading_time || undefined,
        featured: post.featured || false,
        series: post.series || undefined,
      },
      body: post.content || "",
      source: "supabase" as const,
    }));
  } catch {
    return [];
  }
}

export async function getSupabasePostBySlug(slug: string): Promise<MergedPost | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: post } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (!post) return null;

    return {
      id: post.slug,
      slug: post.slug,
      data: {
        title: post.title,
        description: post.description,
        publishDate: new Date(post.publish_date),
        category: post.category,
        tags: post.tags || [],
        image: post.image || undefined,
        author: post.author || "Ketan Jawale",
        readingTime: post.reading_time || undefined,
        featured: post.featured || false,
        series: post.series || undefined,
      },
      body: post.content || "",
      source: "supabase" as const,
    };
  } catch {
    return null;
  }
}
