import User from "@/database/models/user.model";
import { connectToDB } from "@/database/mongoose";
import { DisburseChains, disburseEvmToken, disburseSubstrateToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

connectToDB();

export type DisburseRequest = {
  disburseChains: DisburseChains[]
};

export async function POST(req: NextRequest) {

  const body = await req.json();

  const { disburseChains }: DisburseRequest = body;
  console.log(disburseChains);

  try {

    const disbursements = await Promise.all(disburseChains.map(async (c) => {
      const user = await User.findOne({ chain: c.chain, address: c.address });
      console.log("disburse: ", c);

      if (user) return  {
        address: c.address,
        chain: c.chain,
        txhash: null,
        createdAt: user.createdAt
      };
      
      if (c.type === 'evm') {
        // const evm_hash = await disburseEvmToken(c);
        const evm_hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
        return {
          address: c.address,
          chain: c.chain,
          txhash: `${evm_hash}`,
          createdAt: new Date(Date.now())
        }
      } else {
        // const substrate_hash = await disburseSubstrateToken(c);
        const substrate_hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
        return {
          address: c.address,
          chain: c.chain,
          txhash: `${substrate_hash}`,
          createdAt: new Date(Date.now())
        }
      }
    }));

    console.log(disbursements);

    disbursements.map(async (disbursement) => {
      if (disbursement.txhash) {
        const newUser = new User(disbursement);
        User.collection.createIndex({ createdAt: 1}, { expireAfterSeconds: 86400 });
        const savedUser = await newUser.save();
        console.log(savedUser);
      }
    });

    return NextResponse.json({ message: "Disbursement successful!", data: disbursements }, { status: 200 });

  } catch (error) {
    return NextResponse.json({message: "Disbursement failed. Please try again!"}, { status: 400 });
  };
  
};