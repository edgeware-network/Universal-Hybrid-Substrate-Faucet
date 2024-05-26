import User from "@/database/models/user.model";
import { connectToDB } from "@/database/mongoose";
import { DisburseChain, disburseEvmToken, disburseSubstrateToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

connectToDB();

type DisburseRequest = {
  disburses: DisburseChain[]
};

export async function POST(req: NextRequest) {

  const { disburses }: DisburseRequest = await req.json();

  console.log(disburses);

  try {

    const disbursements = await Promise.all(disburses.map(async (disburse) => {
      const user = await User.findOne({ chain: disburse.chain, address: disburse.address });
      console.log("disburse: ", disburse);

      if (user) return  {
        address: disburse.address,
        amount: disburse.amount,
        symbol: disburse.nativeCurrency.symbol,
        chain: disburse.chain,
        txhash: null,
        createdAt: user.createdAt
      };
      
      if (disburse.type === 'evm') {
        const evm_hash = await disburseEvmToken(disburse);
        return {
          address: disburse.address,
          amount: disburse.amount,
          symbol: disburse.nativeCurrency.symbol,
          chain: disburse.chain,
          txhash: (evm_hash === -1) ? -1 : evm_hash ? evm_hash : null,
          createdAt: new Date(Date.now())
        }
      } else {
        const substrate_hash = await disburseSubstrateToken(disburse);
        return {
          address: disburse.address,
          amount: disburse.amount,
          symbol: disburse.nativeCurrency.symbol,
          chain: disburse.chain,
          txhash: (substrate_hash === -1) ? -1 : substrate_hash ? substrate_hash : null,
          createdAt: new Date(Date.now())
        }
      }
    }));

    console.log(disbursements);

    disbursements.map(async (disbursement) => {
      if (disbursement.txhash !== null && disbursement.txhash !== -1) {
        const newUser = new User({address: disbursement.address, chain: disbursement.chain, txhash: disbursement.txhash, createdAt: disbursement.createdAt});
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