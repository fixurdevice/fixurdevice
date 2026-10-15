import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/crm/",
          "/api/",
          "/track-repair/",
        ],
      },
    ],
    sitemap: "https://www.fixurdevice.in/sitemap.xml",
    host: "https://www.fixurdevice.in",
  };
}
