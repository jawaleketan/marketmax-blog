import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("blog");
  const sorted = posts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
  return rss({
    title: "MarketMax — Digital Marketing Blog",
    description: "Free digital marketing insights by Ketan Jawale.",
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
