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

export const metadata: Metadata = {
  title: {
    default: "Radar de Internacionalização",
    template: "%s · Radar de Internacionalização",
  },
  description:
    "Notícias, tendências e casos de comércio exterior e internacionalização.",
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
