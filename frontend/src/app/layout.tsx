import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";
import { AnalyticsProvider } from "@/providers/analytics-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodCraftClub - Маркетплейс домашних продуктов",
  description: "Покупайте и продавайте домашние продукты и блюда от локальных производителей",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ru" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnalyticsProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </AnalyticsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
