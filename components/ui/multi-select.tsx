"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { RxCross2 } from "react-icons/rx";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
	"m-1 transition ease-in-out delay-150 duration-300",
	{
		variants: {
			variant: {
				default:
					"border-foreground/10 text-foreground bg-card hover:bg-card/80",
				secondary:
					"border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				inverted: "inverted",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof multiSelectVariants> {
	/**
	 * An array of option objects to be displayed in the multi-select component.
	 * Each option object has a label, value, and an optional icon.
	 */
	options: {
		/** The text to display for the option. */
		label: string;
		/** The unique value associated with the option. */
		value: string;
		/** Optional icon component to display alongside the option. */
		icon: string;
		symbol: string;
	}[];

	/**
	 * Callback function triggered when the selected values change.
	 * Receives an array of the new selected values.
	 */
	onValueChange: (value: string[]) => void;

	/** The default selected values when the component mounts. */
	defaultValue: string[];

	/**
	 * If true, clears the selected values when the clear button is clicked.
	 * Optional, defaults to false.
	 */
	clearOptions?: boolean;

	/**
	 * Callback function triggered when the clear button is clicked.
	 * Receives a boolean indicating whether the clear button was clicked.
	 */
	setClearOptions: React.Dispatch<React.SetStateAction<boolean>>;

	/**
	 * Placeholder text to be displayed when no values are selected.
	 * Optional, defaults to "Select options".
	 */
	placeholder?: string;

	/**
	 * Animation duration in seconds for the visual effects (e.g., bouncing badges).
	 * Optional, defaults to 0 (no animation).
	 */
	animation?: number;

	/**
	 * Maximum number of items to display. Extra selected items will be summarized.
	 * Optional, defaults to 3.
	 */
	maxCount?: number;

	/**
	 * The modality of the popover. When set to true, interaction with outside elements
	 * will be disabled and only popover content will be visible to screen readers.
	 * Optional, defaults to false.
	 */
	modalPopover?: boolean;

	/**
	 * If true, renders the multi-select component as a child of another component.
	 * Optional, defaults to false.
	 */
	asChild?: boolean;

	/**
	 * Additional class names to apply custom styles to the multi-select component.
	 * Optional, can be used to add custom styles.
	 */
	className?: string;

	/**
	 *
	 * @param {React.Ref<HTMLButtonElement>} ref - The ref object to be passed to the underlying button element.
	 */
	ref?: React.Ref<HTMLButtonElement>;
}

export function MultiSelect({
	options,
	onValueChange,
	variant,
	defaultValue,
	setClearOptions,
	clearOptions,
	placeholder = "Select options",
	animation = 0,
	maxCount = 3,
	modalPopover = true,
	className,
	ref,
	...props
}: MultiSelectProps) {
	const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			setIsPopoverOpen(true);
		} else if (event.key === "Backspace" && !event.currentTarget.value) {
			const newSelectedValues = [...selectedValues];
			newSelectedValues.pop();
			setSelectedValues(newSelectedValues);
			onValueChange(newSelectedValues);
		}
	};

	const toggleOption = (option: string) => {
		const newSelectedValues = selectedValues.includes(option)
			? selectedValues.filter((value) => value !== option)
			: [...selectedValues, option];
		setSelectedValues(newSelectedValues);
		onValueChange(newSelectedValues);
	};

	const handleClear = () => {
		setSelectedValues([]);
		onValueChange([]);
	};

	useEffect(() => {
		if (clearOptions) {
			setSelectedValues([]);
			onValueChange([]);
		}
		setClearOptions(false);
	}, [clearOptions, onValueChange, setClearOptions]);

	const handleTogglePopover = () => {
		setIsPopoverOpen((prev) => !prev);
	};

	const clearExtraOptions = () => {
		const newSelectedValues = selectedValues.slice(0, maxCount);
		setSelectedValues(newSelectedValues);
		onValueChange(newSelectedValues);
	};

	return (
		<Dialog
			open={isPopoverOpen}
			onOpenChange={setIsPopoverOpen}
			modal={modalPopover}
		>
			<DialogTrigger asChild>
				<Button
					ref={ref}
					{...props}
					onClick={handleTogglePopover}
					className={cn(
						"flex w-full p-1 rounded-md min-h-10 h-auto items-center justify-between bg-background hover:bg-inherit [&_svg]:pointer-events-auto cursor-pointer",
						className
					)}
				>
					{selectedValues.length > 0 ? (
						<div className="flex justify-between items-center w-full">
							<div className="flex flex-wrap items-center font-manrope text-sm font-semibold">
								{selectedValues.slice(0, maxCount).map((value) => {
									const option = options.find((o) => o.value === value);
									const IconComponent = option?.icon;
									return (
										<Badge
											key={value}
											className={cn(
												multiSelectVariants({ variant }),
												"bg-border/70 text-foreground hover:bg-border cursor-pointer font-semibold font-poppins text-xs h-6"
											)}
											style={{ animationDuration: `${animation}s` }}
										>
											{IconComponent && (
												<Image
													src={option.icon}
													alt={option.label}
													width={16}
													height={16}
													priority
													className="h-4 w-4 mr-2"
												/>
											)}
											{option?.label}
											<RxCross2
												width={16}
												height={16}
												className="ml-2 h-4 w-4 cursor-pointer text-info px-[5px]"
												onClick={(event) => {
													event.stopPropagation();
													toggleOption(value);
												}}
											/>
										</Badge>
									);
								})}
								{selectedValues.length > maxCount && (
									<Badge
										className={cn(
											"bg-border/70 text-foreground hover:bg-border cursor-pointer font-semibold font-poppins text-xs h-6",
											multiSelectVariants({ variant })
										)}
										style={{ animationDuration: `${animation}s` }}
									>
										{`+ ${selectedValues.length - maxCount} more`}
										<RxCross2
											className="ml-2 h-4 w-4 cursor-pointer text-info p-[5px]"
											onClick={(event) => {
												event.stopPropagation();
												clearExtraOptions();
											}}
										/>
									</Badge>
								)}
							</div>
							<div className="flex items-center justify-between">
								<RxCross2
									className="h-4 mx-2 cursor-pointer text-info p-1"
									onClick={(event) => {
										event.stopPropagation();
										handleClear();
									}}
								/>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between w-full mx-auto">
							<span className="text-[16px]  font-medium font-work-sans tracking-tight text-placeholder">
								{placeholder}
							</span>
						</div>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent
				className="sm:w-[480px] w-[80%] max-h-[640px] h-full rounded-3xl px-4 py-4 border-border border-2 flex flex-col gap-4 bg-background"
				onEscapeKeyDown={() => setIsPopoverOpen(false)}
			>
				<DialogHeader>
					<DialogTitle>Select a chain</DialogTitle>
					<DialogDescription className="text-info font-work-sans tracking-tight font-medium">
						Select the chains you want to request testnet tokens for.
					</DialogDescription>
				</DialogHeader>
				<Command className="gap-2 bg-background flex flex-col">
					<CommandInput
						placeholder="Search chains"
						className="font-poppins tracking-tight text-sm text-foreground placeholder:text-placeholder"
						onKeyDown={handleInputKeyDown}
					/>
					<CommandList className="max-h-fit bg-background mb-2">
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							<div className="flex flex-col gap-2 mr-2">
								{options.map((option) => {
									const isSelected = selectedValues.includes(option.value);
									return (
										<CommandItem
											key={option.value}
											onSelect={() => toggleOption(option.value)}
											className={cn(
												"cursor-pointer h-12 rounded-xl",
												isSelected
													? "bg-quaternary/10 text-quaternary data-[selected=true]:bg-quaternary/10 data-[selected=true]:text-quaternary"
													: ""
											)}
										>
											{option.icon && (
												<Image
													src={option.icon}
													alt={option.label}
													width={16}
													height={16}
													priority
													className="h-8 w-8 mr-2"
												/>
											)}
											<div className="flex flex-col">
												<span
													className={cn(
														"font-medium font-work-sans text-base tracking-tight",
														isSelected ? "text-quaternary" : "text-foreground"
													)}
												>
													{option.label}
												</span>
												<span className="font-medium font-work-sans text-sm tracking-tight text-info">
													{option.symbol}
												</span>
											</div>
										</CommandItem>
									);
								})}
							</div>
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}

MultiSelect.displayName = "MultiSelect";
