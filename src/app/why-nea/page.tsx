import { WhyStory } from "@/components/why/why-story";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Why NEA: we find out why your skin does what it does",
  description: "Tried the facial, the peel, the serum, and it came back? NEA looks at what’s happening inside (gut, hormones, nutrition) and treats the reason, with one team, one plan and proof in numbers. The first skin scan is free.",
  path: "/why-nea",
});

export default function WhyNeaPage() {
  return <WhyStory />;
}
