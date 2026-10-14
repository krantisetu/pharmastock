import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { getTenant } from "@/lib/actions";

export const dynamic = "force-dynamic";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PharmaStock Kolhapur - Medical Store Stock & POS",
  description:
    "Mobile-friendly SaaS stock management and POS billing for retail pharmacies in Kolhapur, Maharashtra",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PharmaStock",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d9488",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  return (
    <html
      lang="en"
      className={`${roboto.variable} ${roboto.className} h-full antialiased`}
    >
      <body className={`${roboto.className} min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-teal-500 selection:text-white`}>
        <Navbar tenant={tenant} />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
