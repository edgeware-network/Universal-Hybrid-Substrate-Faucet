import Image from "next/image";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";

export function Footer() {
	return (
		<footer className="z-20 mx-auto w-full p-2 max-w-3xl">
			<div className="flex w-full flex-row items-center justify-between max-sm:flex-col max-sm:justify-center font-medium">
				<div className="font-manrope flex flex-col items-start justify-center font-semibold max-sm:items-center">
					<span className="text-info text-sm max-sm:text-xs">
						Funded by the <span className="text-primary">Polkadot </span>
						Treasury {2024} - {new Date().getFullYear()}
					</span>
					<span className="text-info text-sm max-sm:text-xs">
						© {new Date().getFullYear()} Edgetributors SubDAO
					</span>
				</div>
				<div className="flex items-center justify-items-center space-x-1">
					<Link
						href="https://github.com/edgeware-network/Universal-Hybrid-Substrate-Faucet"
						title="GitHub"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaGithub className="hover:text-info h-6 w-6 max-sm:h-4 max-sm:w-4" />
					</Link>
					<Link
						href="https://x.com/Edgeware4People"
						title="Twitter / X"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaXTwitter className="hover:text-info h-6 w-6 max-sm:h-4 max-sm:w-4" />
					</Link>
					<Link
						href="https://polkadot.polkassembly.io/referenda/541"
						title="Universal Hybrid Substrate Faucet Proposal"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image
							src="/polkassembly.svg"
							alt="polkassembly"
							height={24}
							width={24}
							priority
							className="h-6 w-6 max-sm:h-4 max-sm:w-4"
						/>
					</Link>
					<Link
						href="https://polkadot.subsquare.io/referenda/904"
						title="Top Up Request"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image
							src="/subsquare.svg"
							alt="subsquare"
							height={24}
							width={24}
							priority
							className="h-6 w-6 max-sm:h-4 max-sm:w-4"
						/>
					</Link>
				</div>
			</div>
		</footer>
	);
}
