import { Button } from "@/components/ui";

export function ConnectWalletButton() {
	return (
		<Button
			className="font-manrope font-medium font-stretch-condensed cursor-pointer text-base px-2 min-w-32 h-10 transition-colors active:scale-[0.99] tracking-normal rounded-[0.7rem] duration-100"
			variant="quaternary"
		>
			Connect
		</Button>
	);
}
