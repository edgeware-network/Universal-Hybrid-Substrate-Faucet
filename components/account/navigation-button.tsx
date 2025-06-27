import { Button } from "@/components/ui";
import { IconType } from "react-icons/lib";

interface NavigationButtonProps {
	Icon: IconType;
	text: string;
	onClick: (() => void) | undefined;
	disabled: boolean;
}
export function NavigationButton({
	Icon,
	text,
	onClick,
	disabled,
}: NavigationButtonProps) {
	return (
		<Button
			variant="quaternary"
			className="font-poppins mx-auto w-full cursor-pointer items-center text-sm font-semibold tracking-tight"
			onClick={onClick}
			disabled={disabled}
		>
			{text.includes("wallets") && <Icon className="h-6 w-6" />}
			<span>{text}</span>
			{text.includes("accounts") && <Icon className="h-6 w-6" />}
		</Button>
	);
}
