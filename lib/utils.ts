import { chains } from "@/constants/chains";
import { clsx, type ClassValue } from "clsx";
import { detect } from "detect-browser";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getTokenSymbol(name?: string) {
	if (!name) return "";
	const chain = chains.filter((chain) => chain.url === name)[0];
	return chain.nativeCurrency.symbol;
}

export function getTokenName(name?: string) {
	if (!name) return "";
	const chain = chains.filter((chain) => chain.url === name)[0];
	return chain.name;
}

export function getChainType(name?: string) {
	if (!name) return "";
	const chain = chains.filter((chain) => chain.url === name)[0];
	return chain.type;
}

export function allowOnlyNumbers(event: React.KeyboardEvent<HTMLInputElement>) {
	const neededChars = ["Backspace", "Tab", "Enter", "."];
	if (
		(event.key.charCodeAt(0) < 48 ||
			event.key.charCodeAt(0) > 57 ||
			event.key.startsWith("Numpad")) &&
		!neededChars.includes(event.key)
	) {
		event.preventDefault();
	}
	if (
		event.currentTarget.value.split(".").length === 2 &&
		(event.key === "." || event.key === ",")
	) {
		event.preventDefault();
	}
}

export function getMaxAmount(name: string) {
	const chain = chains.filter((chain) => chain.url === name)[0];
	return `${chain.threshold * 0.001}`;
}

export function trimAddress(address: string, length?: number) {
	if (!length) length = 4;
	return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function checkIsMobile() {
	const browser = detect();
	if (!browser) return "";

	return (
		browser.os === "Android OS" ||
		browser.os === "iOS" ||
		browser.os === "Windows Mobile"
	);
}
