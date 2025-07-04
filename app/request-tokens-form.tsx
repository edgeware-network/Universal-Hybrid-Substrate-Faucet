"use client";
import { requestTokensAction } from "@/app/_actions/request-tokens-action";
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
import { env } from "@/lib/env";
import {
	allowOnlyNumbers,
	getChainType,
	getMaxAmount,
	getTokenSymbol,
} from "@/lib/utils";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
	const captchaRef = useRef<HCaptcha>(null);

	const spanRef = useRef<HTMLSpanElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const userAmount = form.watch("amount");
	const [clearOptions, setClearOptions] = useState(false);

	const { executeAsync } = useAction(requestTokensAction, {
		onSuccess: ({ data: results }) => {
			const successes = results!.filter((r) => r.status === "success");
			const failures = results!.filter((r) => r.status === "failed");
			const rateLimits = results!.filter((r) => r.status === "rate-limit");

			if (successes.length > 0) {
				toast.success(
					`Success on: ${successes.map((r) => r.data.chain).join(", ")}`
				);
			}

			if (failures.length > 0) {
				toast.error(
					`Failed on: ${failures.map((r) => r.data.chain).join(", ")}`
				);
			}

			if (rateLimits.length > 0) {
				toast.error(
					`Rate limit exceeded for: ${rateLimits
						.map((r) => r.data.chain)
						.join(", ")}`
				);
			}
		},
		onError: ({ error }) => {
			const message =
				error.serverError ||
				(error.validationErrors &&
					Object.keys(error.validationErrors).length > 0 &&
					(error.validationErrors as Record<string, { message?: string }>)[
						Object.keys(error.validationErrors)[0]
					]?.message) ||
				error.thrownError?.message ||
				"An unexpected error occurred";

			toast.error(message);
		},
	});

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
		const token = captchaRef.current?.execute();
		if (!token) {
			toast.error("CAPTCHA verification failed.");
			return;
		}

		data.captchaToken = token;
		await executeAsync(data);
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
				<HCaptcha
					sitekey={env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
					size="invisible"
					ref={captchaRef}
				/>
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
