import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "BlueSentinel — Maritime Decision Intelligence",
  description:
    "Every voyage deserves a safer decision. BlueSentinel helps cargo teams understand port rules, voyage risk, and operational cost before a ship sails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
