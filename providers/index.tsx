"use client";
import { NavigationProvider } from "@/providers/navigation-provider";
import { DotProvider } from "@/providers/dot-provider";
import { EvmProvider } from "@/providers/evm-provider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<NavigationProvider>
      <DotProvider>
        <EvmProvider>
          {children}
        </EvmProvider>
      </DotProvider>
		</NavigationProvider>
	);
}
