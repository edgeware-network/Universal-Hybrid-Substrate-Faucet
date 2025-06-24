import { RequestTokensForm } from "@/app/request-tokens-form";

export default async function Home() {
	return (
		<>
			<section className="flex flex-col items-center p-2 justify-items-center w-full max-w-2xl">
				<RequestTokensForm />
			</section>
		</>
	);
}
