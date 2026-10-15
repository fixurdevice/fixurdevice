import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.fixurdevice.in";
  const now = new Date();

  const staticPages = [
    { url: `${base}/`, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${base}/services`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/how-it-works`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/service-areas/bangalore`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${base}/book-repair`, priority: 0.95, changeFrequency: "weekly" as const },
    { url: `${base}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/contact`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/faq`, priority: 0.75, changeFrequency: "monthly" as const },
    { url: `${base}/privacy-policy`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const servicePages = [
    "screen-replacement",
    "battery-replacement",
    "iphone-screen-replacement",
    "water-damage-repair",
    "charging-port-repair",
    "camera-repair",
    "speaker-microphone-repair",
    "biometric-repair",
  ].map((slug) => ({
    url: `${base}/services/${slug}`,
    priority: 0.85,
    changeFrequency: "monthly" as const,
    lastModified: now,
  }));

  return [
    ...staticPages.map((p) => ({ ...p, lastModified: now })),
    ...servicePages,
  ];
}
