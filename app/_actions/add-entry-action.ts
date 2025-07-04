import { addEntry } from "@/data-access/db/add-entry.persistence";
import { addEntryUseCase } from "@/usecases/add-entry.usecase";

export async function addEntryAction(data: {
  address: string;
  chain: string;
  amount: number;
  txhash: string;
	ip: string;
}) {
	try {
		await addEntryUseCase(
			{ addEntry: addEntry },
			{
				address: data.address,
				chain: data.chain,
				amount: data.amount,
				txhash: data.txhash,
				ip: data.ip
			}
		);
	} catch (error) {
		console.log(error);
	}
}
