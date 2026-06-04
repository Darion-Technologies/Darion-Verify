import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darion Badge",
  description: "Employee ID verification system for Darion Technologies"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
