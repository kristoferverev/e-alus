import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SearchProvider } from "./SearchProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-alus",
  description: "Euroaluste turuplatvorm",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="et">
      <body className={inter.className}>
        <SearchProvider>
          {children}
        </SearchProvider>
      </body>
    </html>
  );
}
