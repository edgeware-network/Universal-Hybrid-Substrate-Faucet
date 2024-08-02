import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { FaucetProvider } from "@/context";
import HashLoader from "react-spinners/HashLoader";
import { Toaster } from "react-hot-toast";

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
      <body
        className={`${space_mono.className}  bg-[#131313] min-h-screen z-0 flex flex-col items-center justify-between p-4`}
      >
        <FaucetProvider>
          <Suspense
            fallback={
              <div className=" text-white w-[100vw] min-h-screen bg-black/30 flex items-center justify-center z-50">
                <HashLoader
                  color="#FC72FF"
                  loading={true}
                  size={50}
                  speedMultiplier={1}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            }
          >
            <Navbar />
            {children}
          </Suspense>
          <Toaster position="bottom-right" />
          <Footer />
        </FaucetProvider>
      </body>
    </html>
  );
}
