import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TallerSmart · Gestión de órdenes de trabajo",
  description: "Gestión inteligente de órdenes de trabajo, triaje asistido por IA y mantenimiento preventivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${openSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
