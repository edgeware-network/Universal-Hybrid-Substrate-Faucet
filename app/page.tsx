export default async function Home() {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return (
		<>
			<section className="flex flex-col items-center p-2 justify-items-center w-full max-w-2xl">
				Faucet
			</section>
		</>
	);
}
