import { DisburseChains, disburseEvmToken, disburseSubstrateToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type DisburseRequest = {
  disburseChains: DisburseChains[]
};

export async function POST(req: NextRequest) {

  const body = await req.json();

  const { disburseChains }: DisburseRequest = body;
  console.log(disburseChains);

  try {
    const disbursements = disburseChains.map(async (chain) => {
      console.log(chain);
      if(chain.type === 'substrate') {
        await disburseSubstrateToken(chain);
      } else if(chain.type === 'evm') {
        await disburseEvmToken(chain);
      }
    });

    await Promise.all(disbursements);
    // return NextResponse.json({message: "1 day limit exceeded. Please try later!"}, { status: 429 });
    
  } catch (error) {
    return NextResponse.json({message: "Disbursement failed. Please try again!"}, { status: 400 });
  };
  return NextResponse.json({message: "Successfully, sent tokens to your wallet address!"}, { status: 200 });
};