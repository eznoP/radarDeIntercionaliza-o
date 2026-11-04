import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const googleSans = localFont({
  src: "../fonts/google-sans.woff2",
  variable: "--font-google-sans",
  weight: "400 700",
  display: "swap",
});

const xmind = localFont({
  src: "../fonts/xmind.woff2",
  variable: "--font-xmind",
  weight: "100 900",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const siteDescription =
  "Notícias, tendências e casos de comércio exterior e internacionalização.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Radar de Internacionalização",
    template: "%s · Radar de Internacionalização",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Radar de Internacionalização",
    title: "Radar de Internacionalização",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radar de Internacionalização",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${googleSans.variable} ${xmind.variable}`}>
      <body className="min-h-dvh antialiased">
        {/* Compensa a navbar fixa */}
        <div className="pt-16 sm:pt-20">{children}</div>
      </body>
    </html>
  );
}
