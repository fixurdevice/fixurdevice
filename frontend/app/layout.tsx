import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import BackendPinger from "./components/BackendPinger";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fixurdevice.in"),
  title: {
    default: "FixUrDevice — Premium Device Repair in Bangalore | Pickup & Delivery",
    template: "%s | FixUrDevice Bangalore",
  },
  description:
    "FixUrDevice offers professional iPhone, smartphone, tablet, and laptop repair in Bangalore with convenient pickup and delivery. Request a repair assessment today.",
  keywords: [
    "mobile repair Bangalore",
    "iPhone repair Bangalore",
    "screen replacement Bangalore",
    "battery replacement Bangalore",
    "device repair pickup delivery Bangalore",
    "phone repair near me Bangalore",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.fixurdevice.in",
    siteName: "FixUrDevice",
    title: "FixUrDevice — Premium Device Repair in Bangalore",
    description:
      "Professional device repair with pickup and delivery across Bangalore. iPhone, Android, tablets, laptops. Request an assessment today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FixUrDevice — Premium Device Repair in Bangalore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FixUrDevice — Premium Device Repair in Bangalore",
    description:
      "Professional device repair with pickup and delivery across Bangalore.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${outfit.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="canonical" href="https://www.fixurdevice.in" />
        <meta name="theme-color" content="#6c3fff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://www.fixurdevice.in",
              name: "FixUrDevice",
              description:
                "Premium device repair service in Bangalore offering pickup and delivery for iPhones, smartphones, tablets, and laptops.",
              telephone: "+91-9343584460",
              email: "fixurdevice.in@gmail.com",
              image: "https://www.fixurdevice.in/levlox_logo.png",
              address: {
                "@type": "PostalAddress",
                streetAddress: "#159, 1st Floor 32nd E Cross Rd, Opp To Sanjay Gandhi Hospital, 4th T Block East, Tilak Nagar, Jayanagar",
                addressLocality: "Bengaluru",
                addressRegion: "Karnataka",
                postalCode: "560041",
                addressCountry: "IN",
              },
              areaServed: {
                "@type": "City",
                name: "Bangalore",
                containedInPlace: {
                  "@type": "State",
                  name: "Karnataka",
                  containedInPlace: {
                    "@type": "Country",
                    name: "India",
                  },
                },
              },
              serviceType: "Device Repair",
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Device Repair Services",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
                opens: "09:00",
                closes: "20:00",
              },
            }),
          }}
        />
        {/* Google Tag Manager placeholder */}
        {/* GTM will be configured with actual GTM ID */}
      </head>
      <body className="min-h-full flex flex-col">
        <BackendPinger />
        {children}
      </body>
    </html>
  );
}
