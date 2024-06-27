import { Chain } from "@/constants/config";
import { getEvmBalances, getSubstrateBalances } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type FaucetRequest = {
  chains: Chain[];
};

async function getBalances(chain: Chain) {
  if (chain.type === "evm") {
    try {
      return await getEvmBalances(chain);
    } catch (error) {
      console.log("getEvmBalances: failed for reason: ", error);
      return null;
    }
  }

  if (chain.type === "substrate") {
    try {
      return await getSubstrateBalances(chain);
    } catch (error) {
      console.log("getSubstrateBalances: failed for reason: ", error);
      return null;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chains }: FaucetRequest = body;

  try {
    // Create promises for all chains and execute them in parallel
    const balancePromises = chains.map(async (chain) => {
      const balances = await getBalances(chain);
      return {
        name: chain.name,
        balance: balances,
        nativeCurrency: chain.nativeCurrency,
        rpc: chain.rpcUrls,
        type: chain.type,
        threshold: chain.threshold,
      };
    });

    // Wait for all balance promises to resolve
    const balances = await Promise.all(balancePromises);

    console.log(balances);
    return NextResponse.json(
      { message: "success", data: balances },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "failed" }, { status: 400 });
  }
}
