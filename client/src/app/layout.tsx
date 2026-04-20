import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccidentDetectionProvider } from "@/context/AccidentDetectionContext";
import { HydrationSuppressor } from "@/components/providers/hydration-suppressor";
import { ThemeInitializer } from "@/components/theme-initializer";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jeevan Netra",
  description: "Advanced Healthcare Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={manrope.className} suppressHydrationWarning>
        <HydrationSuppressor>
          <ThemeInitializer />
          <ThemeProvider>
            <AuthProvider>
              <AccidentDetectionProvider>
                {children}
              </AccidentDetectionProvider>
            </AuthProvider>
          </ThemeProvider>
        </HydrationSuppressor>
      </body>
    </html>
  );
}
