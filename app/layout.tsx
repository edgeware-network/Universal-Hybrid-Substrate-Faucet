import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Connect from "@/components/modals/Connect";
import { Suspense } from "react";
import { FaucetProvider } from "@/context";
import Switch from "@/components/modals/Switch";

const space_mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Universal Hybrid Substrate Faucet",
  description: "A one-stop testnet faucet for all the substrate chains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${space_mono.className} bg-[#131313] min-h-screen z-0 flex flex-col items-center justify-between p-4`}>
        <FaucetProvider>
          <Navbar />
          <Suspense fallback={<div className="w-[100vw] min-h-screen text-white bg-[#131313] flex items-center justify-center z-40">Loading...</div>}>
            <Connect />
          </Suspense>
          <Switch />
          {children}
          <Footer />
        </FaucetProvider>
      </body>
    </html>
  );
}
