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
      console.log(chain)
      if(chain.type === 'substrate') {
        await disburseSubstrateToken(chain);
      } else if(chain.type === 'evm') {
        await disburseEvmToken(chain);
      }
    });
    await Promise.all(disbursements);
    return NextResponse.json({message: "success"}, { status: 200 });

  } catch (error) {
    return NextResponse.json({message: "failed"}, { status: 400 });
  }
};