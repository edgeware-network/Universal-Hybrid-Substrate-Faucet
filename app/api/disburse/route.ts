import { chains } from "@/constants/config";
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

  const user = await User.find({ chain: "Westend", address: "5DFQFJ6vAuURXbjw9QxTYZLuUynBUYFcgVRopfh7kWtiP6TU" });
  console.log("condition: ", user);

  try {

    const disbursements = await Promise.all(disburseChains.map(async (c) => {
      const user = await User.findOne({ chain: c.chain, address: c.address });
      console.log("disburse: ", c);

      if (user) return  {
        address: c.address,
        chain: c.chain,
        txhash: null,
        expiresAt: user.expiresAt
      };
      
      if (c.type === 'evm') {
        // const evm_hash = await disburseEvmToken(c);
        const evm_hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
        return {
          address: c.address,
          chain: c.chain,
          txhash: `${evm_hash}`,
          expiresAt: new Date(Date.now() + 86400000)
        }
      } else {
        // const substrate_hash = await disburseSubstrateToken(c);
        const substrate_hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
        return {
          address: c.address,
          chain: c.chain,
          txhash: `${substrate_hash}`,
          expiresAt: new Date(Date.now() + 86400000)
        }
      }
    }));

    console.log(disbursements);

    disbursements.map(async (disbursement) => {
      if (disbursement.txhash) {
        const newUser = new User(disbursement);
        const savedUser = await newUser.save();
        console.log(savedUser);
      }
    });

    return NextResponse.json({ message: "Disbursement successful!", data: disbursements }, { status: 200 });

  } catch (error) {
    return NextResponse.json({message: "Disbursement failed. Please try again!"}, { status: 400 });
  };
  
};