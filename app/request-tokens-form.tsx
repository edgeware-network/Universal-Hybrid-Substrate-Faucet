"use client";
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	MultiSelect,
} from "@/components/ui";
import { chains } from "@/constants/chains";
import { faucetSchema, type FaucetSchemaType } from "@/db/schema";
import {
	allowOnlyNumbers,
	getChainType,
	getMaxAmount,
	getTokenSymbol,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { requestTokensAction } from "./_actions/request-tokens-action";

type RequestTokensType = {
	chain?: string;
	address?: string;
};

export function RequestTokensForm({ chain, address }: RequestTokensType) {
	const form = useForm<FaucetSchemaType>({
		resolver: zodResolver(faucetSchema),
		mode: "onChange",
		defaultValues: {
			chains: chain ? [chain] : [],
			address: address ? address : "",
			amount: "",
		},
	});

	const spanRef = useRef<HTMLSpanElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const userAmount = form.watch("amount");
	const [clearOptions, setClearOptions] = useState(false);

	useLayoutEffect(() => {
		if (chain) {
			form.setValue("chains", [chain]);
			form.trigger("chains");
		}
		if (address) {
			form.setValue("address", address);
			form.trigger("address");
		}
	}, [chain, address, form]);

	useLayoutEffect(() => {
		if (spanRef.current && inputRef.current && userAmount) {
			const spanWidth = spanRef.current.offsetWidth;
			inputRef.current.style.width = `${spanWidth}px`;
		} else if (inputRef.current) {
			inputRef.current.style.width = "43px";
		}
	}, [userAmount]);

	async function onSubmit(data: FaucetSchemaType) {
		await requestTokensAction(data);
		setClearOptions(true);
		form.reset();
	}

	function handleMaxAmount(chain: string) {
		if (chain) {
			form.setValue("amount", getMaxAmount(form.watch("chains")[0]));
		} else {
			toast.error("Please select a chain");
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-2 w-full max-w-[480px] items-stretch bg-background rounded-lg text-left justify-start"
			>
				<FormField
					control={form.control}
					name="chains"
					render={({ field }) => (
						<FormItem className="flex border-2 border-border flex-col gap-1 rounded-xl p-3 tracking-tight">
							<FormLabel className="font-medium font-work-sans text-sm h-4 flex items-center text-info tracking-tight">
								Chains
							</FormLabel>
							<FormControl>
								<MultiSelect
									options={chains.map((cx) => ({
										label: cx.name,
										value: cx.url,
										icon: `/images/${cx.url}.svg`,
										symbol: cx.nativeCurrency.symbol,
										type: cx.type,
									}))}
									setClearOptions={setClearOptions}
									clearOptions={clearOptions}
									placeholder="Select chain or chains"
									onValueChange={field.onChange}
									defaultValue={chain ? [chain] : []}
									variant="inverted"
									{...field}
								/>
							</FormControl>
							<FormMessage chains={field.value} message="You're on" />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem className="flex border-2 border-border flex-col gap-1 rounded-xl p-3 tracking-tight">
							<FormLabel className="font-medium font-work-sans text-sm h-4 flex items-center text-info tracking-tight">
								To
							</FormLabel>
							<FormControl>
								<Input
									type="text"
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="off"
									className="h-8 dark:bg-background bg-background text-[16px] leading-[24px] md:text-[16px] md:leading-[24px] outline-none font-medium font-work-sans tracking-tight placeholder:text-placeholder focus-visible:ring-0 border-none rounded-none p-0"
									placeholder="Wallet address"
									{...field}
								/>
							</FormControl>
							<FormMessage
								chains={form.watch("chains")}
								chainType={getChainType(form.watch("chains")[0])}
								message="Wallet Address for "
							/>
						</FormItem>
					)}
				/>
				{form.watch("chains").length < 2 && (
					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => (
							<FormItem className="flex border-2 border-border flex-col justify-between gap-1 rounded-xl p-3 tracking-tight h-[256px]">
								<FormLabel className="font-medium font-work-sans text-sm h-4 flex items-center justify-between text-info tracking-tight">
									<span>You&apos;re requesting</span>
									<Button
										type="button"
										className="cursor-pointer rounded-md font-work-sans font-medium w-[120px] h-6 p-3 text-xs active:scale-[0.98] transition-colors duration-100"
										onClick={() => handleMaxAmount(form.watch("chains")[0])}
									>
										Max
									</Button>
								</FormLabel>
								<div className="flex gap-1 items-center justify-center">
									<FormControl>
										<div className="relative max-w-full w-max flex items-center justify-start min-w-0">
											<Input
												type="text"
												autoComplete="off"
												autoCorrect="off"
												maxLength={40}
												onKeyDown={allowOnlyNumbers}
												autoCapitalize="off"
												className={`text-[70px] dark:bg-background bg-background max-h-[84px] h-full w-[43px] leading-[60px] md:text-[70px] md:leading-[60px] outline-none font-medium font-work-sans tracking-tight placeholder:text-placeholder focus-visible:ring-0 border-none rounded-none p-0`}
												placeholder="0"
												disabled={field.disabled}
												onChange={field.onChange}
												value={field.value}
												onBlur={field.onBlur}
												name={field.name}
												ref={(e) => {
													inputRef.current = e;
													field.ref(e);
												}}
											/>
											<span
												ref={spanRef}
												className={`text-left invisible absolute bottom-0 right-0 font-medium font-work-sans text-[70px] leading-[60px] block`}
											>
												{form.watch("amount")}
											</span>
										</div>
									</FormControl>
								</div>
								<FormMessage
									chains={form.watch("chains")}
									message="You will get "
									amount={form.watch("amount")}
									token={getTokenSymbol(form.watch("chains")[0])}
								/>
							</FormItem>
						)}
					/>
				)}
				<Button
					variant="secondary"
					className="cursor-pointer rounded-lg font-manrope font-medium w-full p-3 sm:text-base text-sm active:scale-[0.99] transform transition-colors duration-100 drop-shadow-xs drop-shadow-primary"
					type="submit"
				>
					Make it rain!
				</Button>
			</form>
		</Form>
	);
}
