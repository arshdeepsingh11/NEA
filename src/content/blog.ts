import raw from "./generated/blog.json";
import type { Block } from "./treatments";

export type Post = { slug: string; title: string; description: string; image: string; date: string; blocks: Block[] };

export const posts: Post[] = (raw as Post[]).filter((p) => p.title && p.blocks.length > 2);
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
