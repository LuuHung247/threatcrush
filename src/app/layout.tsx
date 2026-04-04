import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThreatCrush — Real-Time Threat Intelligence Platform",
  description:
    "Crush every threat before it crushes you. Real-time threat feeds, vulnerability tracking, attack surface monitoring, and threat actor intelligence.",
  keywords: [
    "threat intelligence",
    "cybersecurity",
    "vulnerability tracking",
    "attack surface monitoring",
    "threat feeds",
  ],
  openGraph: {
    title: "ThreatCrush — Real-Time Threat Intelligence Platform",
    description:
      "Crush every threat before it crushes you. Lifetime access to real-time threat intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
