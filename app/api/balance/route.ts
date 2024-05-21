import { Chain } from "@/constants/config";
import { getBalances } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type FaucetRequest = {
  chains: Chain[];
}

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const { chains }: FaucetRequest  = body;
  try {
    const balances = await Promise.all(
      chains.map(async (chain) => {
        return {
          name: chain.name,
          balance: await getBalances(chain.rpcUrl, chain.type),
          nativeCurrency: chain.nativeCurrency,
          rpc: chain.rpcUrl,
          type: chain.type,
          threshold: chain.threshold,
        };
      })
    );
    console.log(balances);
    return NextResponse.json({ message: "success", data: balances }, { status: 200 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ message: "failed" }, { status: 400 });
  }

}