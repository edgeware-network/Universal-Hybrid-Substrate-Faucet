import Background from "@/components/ui/background";
import { Footer } from "@/app/footer";
import { Header } from "@/app/header";
import { geist } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universal Hybrid Substrate Faucet",
  description: "A one-stop testnet faucet for all the substrate chains.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          geist.variable,
          "antialiased bg-background text-foreground"
        )}
      >
        <Providers>
          <Background />
          <div className="relative z-10 flex flex-col min-h-dvh w-full px-2 pt-1 pb-2 pointer-events-none">
            <div className="w-full pointer-events-auto">
              <Header />
            </div>
            <main className="flex flex-col flex-1 items-center justify-center font-geist-sans w-full p-2 text-center gap-2">
              {children}
            </main>
            <div className="w-full pointer-events-auto">
              <Footer />
            </div>
          </div>
          <Toaster richColors theme="dark" position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
