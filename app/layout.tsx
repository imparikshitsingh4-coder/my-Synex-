import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synex - Multi-Modal AI Platform",
  description: "Advanced AI platform with chat, image generation, and video synthesis",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00d9ff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
