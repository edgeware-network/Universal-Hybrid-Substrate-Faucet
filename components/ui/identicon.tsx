"use client";
import { cn } from "@/lib/utils";
import { polkadotIcon } from "@polkadot/ui-shared/icons/polkadot";
import { Circle } from "@polkadot/ui-shared/icons/types";
import copy from "copy-to-clipboard";
import { memo, useMemo } from "react";
import { toast } from "sonner";

function renderCircle(
	{ cx, cy, fill, r }: Circle,
	key: number
): React.ReactNode {
	const isBackground = key === 0;
	return (
		<circle
			cx={cx}
			cy={cy}
			fill={isBackground ? "none" : fill}
			key={key}
			r={r}
		/>
	);
}

function Icon({
	address,
	isAlternative = false,
	size,
	className,
}: {
	address: string;
	isAlternative?: boolean;
	size?: number;
	className: string;
}) {
	const circles = useMemo(
		() => polkadotIcon(address, { isAlternative }),
		[address, isAlternative]
	);

	function copyToClipboard() {
		copy(address);
		toast.success("Address copied to clipboard!");
	}
	return (
		<div
			onClick={copyToClipboard}
			className="flex items-center justify-center z-50 hover:cursor-copy"
		>
			<svg
				height={size}
				className={cn(className)}
				id={address}
				name={address}
				fill="none"
				viewBox="0 0 64 64"
				width={size}
			>
				{circles.map(renderCircle)}
			</svg>
		</div>
	);
}

export const Identicon = memo(Icon);
