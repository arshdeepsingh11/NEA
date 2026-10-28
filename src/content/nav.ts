export type NavItem = { label: string; href: string; desc?: string };

/** Top navigation: five clear choices instead of 50+ links. */
export const primaryNav: NavItem[] = [
  { label: "Programs", href: "/programs", desc: "Clear Skin, Even Tone, Hair Regrowth, Healthy Aging" },
  { label: "Treatments", href: "/treatments", desc: "Every treatment, grouped by what it does" },
  { label: "Testing", href: "/tests", desc: "Skin, gut and vaginal microbiome, hormones, DNA" },
  { label: "Membership", href: "/membership", desc: "Glow, Glow Plus, Glow Elite" },
  { label: "About", href: "/about", desc: "Raman, our mission and the clinic" },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Start here",
    links: [
      { label: "Nea SI Skin Lens (selfie)", href: "/skin-lens" },
      { label: "Free Skin Health Report", href: "/skin-scan" },
      { label: "Skin Finder", href: "/finder" },
      { label: "Ask Nea SI (press N)", href: "/ask" },
      { label: "Book a consultation", href: "/book" },
    ],
  },
  {
    title: "Care",
    links: [
      { label: "Programs", href: "/programs" },
      { label: "All treatments", href: "/treatments" },
      { label: "Beauty & wellness packages", href: "/packages" },
      { label: "Fotona laser", href: "/fotona" },
      { label: "Treatments for men", href: "/men" },
      { label: "Weight loss & nutrition", href: "/weight-loss" },
    ],
  },
  {
    title: "Science",
    links: [
      { label: "3D Body Explorer", href: "/body" },
      { label: "Microbiome testing", href: "/microbiome" },
      { label: "Lab tests by BioAro", href: "/tests" },
      { label: "BioGut nutrition clinic", href: "/nutrition" },
      { label: "Body Truth Scan (DEXA)", href: "/experiences/body-truth-scan" },
    ],
  },
  {
    title: "NEA",
    links: [
      { label: "About & mission", href: "/about" },
      { label: "Reviews", href: "/testimonials" },
      { label: "Clinic gallery", href: "/gallery" },
      { label: "Journal", href: "/blog" },
      { label: "NEA Magazine", href: "/magazine" },
      { label: "Partner with us", href: "/partners" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
