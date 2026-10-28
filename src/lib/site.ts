export const site = {
  name: "NEA Precision Skin",
  shortName: "NEA",
  tagline: "Healthy skin starts inside.",
  promise: "Calgary’s clinic for healthy skin from the inside out.",
  description:
    "NEA Precision Skin is a physician-managed skin and wellness clinic in NE Calgary. We combine Fotona laser, medical-grade skincare and injectables with gut, skin and vaginal microbiome testing and Registered Dietitian nutrition, so results start at the root cause.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://neaprecisionskin.com",
  phone: "1-403-230-8812",
  phoneHref: "tel:+14032308812",
  text: "403-973-0722",
  textHref: "sms:+14039730722",
  email: "nea@neaskincare.com",
  bookingUrl: "https://neamedicalaesthetic.janeapp.com/",
  address: {
    line1: "#104, 3151 27 Street NE",
    city: "Calgary",
    region: "Alberta",
    regionCode: "AB",
    country: "CA",
    postal: "",
    lat: 51.0815,
    lng: -113.9997,
  },
  mapsQuery: "NEA Precision Skin, 3151 27 St NE #104, Calgary, AB",
  hours: [
    { days: "Monday to Friday", open: "9:00 a.m.", close: "5:00 p.m.", schema: "Mo-Fr 09:00-17:00" },
    { days: "Saturday", open: "9:00 a.m.", close: "5:00 p.m.", schema: "Sa 09:00-17:00" },
    { days: "Sunday", open: "", close: "", closed: true },
  ],
  social: {
    instagram: "https://www.instagram.com/neaprecisionskin/",
    // add NEA's channel links here when they exist; the Reels viewer shows a Follow button for each
    youtube: "",
    tiktok: "",
    facebook: "https://www.facebook.com/Neamedaestheticsca",
    linkedinFounder: "https://www.linkedin.com/in/raman-kapoor-b227a211/",
    googleReviews:
      "https://www.google.com/search?q=NEA+Precision+Skin+Calgary#lrd=0x537165c23a866f87:0x91facf8b209c6ccd,1,,,,",
  },
  ecosystem: {
    bioaroLabs: "https://bioarolabs.com/",
    bioaroShop: "https://bioarolabs.com/shop",
    biogut: "https://biogutclinic.com/",
    bioaro: "https://bioaro.com/",
  },
  downloads: {
    packageCatalog: "https://neaprecisionskin.com/wp-content/uploads/2024/06/NEA-Booklet-correct-qr-codepdf.pdf",
    magazine: "https://neaprecisionskin.com/wp-content/uploads/2023/12/Nea-Fall-Edition_V4_compressed.pdf",
  },
  brands: ["ZO Skin Health", "AlumierMD", "Vivier", "Glo Skin Beauty", "Luzern", "Revanesse"],
} as const;

export type Site = typeof site;
