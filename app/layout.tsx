import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neverparse — Agent-Native Primitives",
  description:
    "Machine-discoverable, machine-consumable APIs and tools that make agents reliable in the real world.",
  openGraph: {
    title: "Neverparse",
    description: "Agent-native primitives for the real world.",
    url: "https://neverparse.com",
    siteName: "Neverparse",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00d4aa",
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          {GA_MEASUREMENT_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `}
              </Script>
            </>
          )}
        </head>
        <body className="bg-np-bg text-np-text antialiased min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
