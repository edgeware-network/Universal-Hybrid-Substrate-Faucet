import {
	geist,
	manrope,
	montserrat,
	poppins,
	unbounded,
	work,
} from "@/lib/fonts";

import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
	title: "Universal Hybrid Substrate Faucet",
	description: "A one-stop testnet faucet for all the substrate chains.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geist.variable} ${unbounded.variable} ${manrope.variable} ${poppins.variable} ${work.variable} ${montserrat.variable} antialiased bg-background text-foreground`}
			>
				<div className="flex flex-col place-items-center min-h-dvh w-full px-2 pt-1 pb-2">
					<main className="flex flex-col flex-1 items-center justify-items-center font-geist-sans w-full p-2 text-center gap-2">
						{children}
					</main>
				</div>
				<Toaster theme="dark" position="bottom-right" />
			</body>
		</html>
	);
}
