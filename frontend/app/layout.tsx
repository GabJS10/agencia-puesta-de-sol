import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Fuente única de marca (estilo Avianca) — sans geométrica-humanista.
// Manrope es la alternativa de Google Fonts más cercana a "Mundial" (DSType),
// el sans propio que usa avianca.com. Se usa tanto en titulares como en cuerpo.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-avianca",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Puesta del Sol",
  description: "Travel Agency",
  icons: {
    icon: "/favicon.jpg",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
