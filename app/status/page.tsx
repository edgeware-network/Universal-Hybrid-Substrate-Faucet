"use client";
import { chains } from "@/constants/config";
import ParticlesComponent from "@/components/ParticlesComponent";
import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import { getBalances } from "@/lib/utils";
import axios from "axios";
import BigNumber from "bignumber.js";

type FaucetChain = {
  name: string;
  balance: string;
  nativeCurrency: {
    name: string;
    decimals: number;
    symbol: string;
  };
  rpc: string;
  type: string;
  threshold: number;
};

export default function Status() {
  const [isLoading, setLoading] = useState(false);
  const [faucetBalance, setFaucetBalance] = useState<FaucetChain[]>([]);

  useEffect(() => {
    async function getFaucetBalance() {
      setLoading(true);
      const res = await axios.post("/api/balance", JSON.stringify({ chains }));
      if (res.data) {
        console.log(res.data.data);
        setFaucetBalance(res.data.data);
      }
      setLoading(false);
    }
    getFaucetBalance();
  }, []);

  console.log(faucetBalance);

  const formatBalances = (amount: string, decimals: number) => {
    return Number(new BigNumber(amount).shiftedBy(-decimals).toFixed(2));
  };

  return (
    <>
      <ParticlesComponent />
      <div className="flex flex-col relative gap-[20px] min-h-[80vh] ">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[8px] bg-[#181818] rounded-md">
            <div className="grid auto-rows-auto h-[420px] overflow-y-auto w-[60vw] gap-[8px] grid-cols-3 p-2">
              {faucetBalance.map((chain) => (
                <div
                  key={chain.name}
                  className={`flex cursor-pointer text-center mr-2 flex-wrap w-[90%] flex-col items-center p-2 justify-center gap-[8px] bg-[#0f0f0f] rounded-[8px] row-span-1 col-span-1`}
                  onClick={() => console.log(chain)}
                >
                  <h3 className="text-[#eaeaea] text-sm">{chain.name}</h3>
                  <div className="h-[6px] w-[60%] bg-[#202020] rounded-md ">
                    <div
                      style={{
                        width: `${
                          formatBalances(
                            chain.balance,
                            chain.nativeCurrency.decimals
                          ) > 100
                            ? 100
                            : formatBalances(
                                chain.balance,
                                chain.nativeCurrency.decimals
                              )
                        }%`,
                      }}
                      className={`h-full rounded-md ${
                        formatBalances(
                          chain.balance,
                          chain.nativeCurrency.decimals
                        ) === 0
                          ? "border-red-800 border-2"
                          : formatBalances(
                              chain.balance,
                              chain.nativeCurrency.decimals
                            ) <
                              2 * chain.threshold &&
                            formatBalances(
                              chain.balance,
                              chain.nativeCurrency.decimals
                            ) > 0
                          ? "bg-orange-400"
                          : "bg-green-400"
                      }`}
                    ></div>
                  </div>
                  <h3 className="text-[#9b9b9b] text-sm">
                    {formatBalances(
                      chain.balance,
                      chain.nativeCurrency.decimals
                    )}{" "}
                    {chain.nativeCurrency.symbol}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
