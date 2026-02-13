import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bagscreener — Put your bags where your mouth is",
  description:
    "Pay 1 SOL to list your token. If it bonds, you get rewarded. If it dies, we keep the SOL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="video-bg">
          <video autoPlay muted loop playsInline>
            <source src="/background.mp4" type="video/mp4" />
          </video>
        </div>
        {children}
      </body>
    </html>
  );
}
