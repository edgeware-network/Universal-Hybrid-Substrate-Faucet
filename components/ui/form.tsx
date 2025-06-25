"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
	Controller,
	FormProvider,
	useFormContext,
	useFormState,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
	name: TName;
};

interface MessageComponentProps extends React.ComponentProps<"p"> {
	message: string;
	chains?: string[];
	amount?: string;
	chainType?: string;
	token?: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState } = useFormContext();
	const formState = useFormState({ name: fieldContext.name });
	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<div
				data-slot="form-item"
				className={cn("grid gap-2", className)}
				{...props}
			/>
		</FormItemContext.Provider>
	);
}

function FormLabel({
	className,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
	const { error, formItemId } = useFormField();

	return (
		<Label
			data-slot="form-label"
			data-error={!!error}
			className={cn("data-[error=true]:text-destructive", className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
	const { error, formItemId, formDescriptionId, formMessageId } =
		useFormField();

	return (
		<Slot
			data-slot="form-control"
			id={formItemId}
			aria-describedby={
				!error
					? `${formDescriptionId}`
					: `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={!!error}
			{...props}
		/>
	);
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
	const { formDescriptionId } = useFormField();

	return (
		<p
			data-slot="form-description"
			id={formDescriptionId}
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function FormMessage({
	message,
	chains,
	amount,
	chainType,
	token,
	...props
}: MessageComponentProps) {
	const { error, formMessageId, name, isTouched } = useFormField();
	const body = error ? String(error?.message ?? "") : props.children;

	if (body) {
		return (
			<p
				data-slot="form-message"
				id={formMessageId}
				className="text-sm text-destructive h-4 font-medium tracking-tight font-work-sans"
				{...props}
			>
				{body}
			</p>
		);
	}

	if (name === "chains" && chains && isTouched) {
		return (
			<p
				data-slot="form-message"
				id={formMessageId}
				className="text-sm text-info h-4 font-medium tracking-tight font-work-sans"
			>
				{chains.length > 2
					? `${message} ${chains.slice(0, 1).join(", ")} and +${
							chains.length - 1
					  } ${chains.length > 2 ? "chains" : "chain"}`
					: `${message} ${chains.join(" and ")}`}
			</p>
		);
	}

	if (name === "address" && chains && chainType) {
		return (
			<p
				data-slot="form-message"
				id={formMessageId}
				className="text-sm text-info h-4 font-medium tracking-tight font-work-sans"
			>
				{chains.length === 1 && `${message} ${chains[0]}`}
				{chains.length > 1 &&
					chainType === "substrate" &&
					`Generic Substrate ${message.replace("for", "")}`}
				{chains.length > 1 &&
					chainType === "evm" &&
					`EVM ${message.replace("for", "")}`}
			</p>
		);
	}

	if (name === "amount" && chains) {
		return (
			<p
				data-slot="form-message"
				id={formMessageId}
				className="text-sm text-info h-4 font-medium tracking-tight font-work-sans"
			>
				{chains.length === 1 && `${message} ${amount ? amount : "0"} ${token}`}
			</p>
		);
	}
	return <p className="h-4 shrink-0 inline-block" />;
}

export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
};
