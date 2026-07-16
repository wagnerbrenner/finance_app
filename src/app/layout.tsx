import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/shared/components/providers/query-provider";
import { BRAND } from "@/shared/lib/brand";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${dmSans.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
