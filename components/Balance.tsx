"use client";
import { Chain, chains } from "@/constants/config";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import Loading from "./Loading";

type FaucetBalance = {
  name: string;
  balance: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpc: string;
  type: string;
  threshold: number;
};

export default function Balance() {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [faucetBalances, setFaucetBalances] = useState<FaucetBalance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function getBatch(arr: Chain[], start: number, end: number) {
      return arr.slice(start, end);
    }

    async function getFaucetBalances() {
      setLoading(true);
      const batch = getBatch(chains, start, end);
      const res = await axios.post("/api/balance", JSON.stringify({ chains: batch }));
      const data = await res.data.data;
      setFaucetBalances(data);
      setLoading(false);
    }

    getFaucetBalances();
  }, [start, end]);

  const formatBalances = (amount: string | null, decimals: number) => {
    if (amount === null) {
      return 0;
    }
    return Number(new BigNumber(amount).shiftedBy(-decimals).toFixed(2));
  };

  return (
    <div className="flex flex-col relative gap-[20px] min-h-[80vh]">
      <div className="elements sm:flex hidden items-center p-4 rounded-md gap-[20px]">
        <button
          disabled={start === 0}
          onClick={() => {
            setStart(start - 10);
            setEnd(end - 10);
          }}
          className="flex items-center justify-center cursor-pointer"
        >
          <FaAngleLeft className="text-[#9b9b9b] w-10 h-10" />
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="grid auto-rows-auto h-[420px] overflow-y-auto w-[80vw] gap-3 grid-cols-3">
            {faucetBalances.map((chain, index) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center gap-3 ${
                  chain.balance === null ? "bg-[#4d1526]" : "bg-black"
                } rounded-md text-center flex-wrap`}
              >
                <h3 className="text-[#eaeaea] text-sm">{chain.name}</h3>
                <h3 className="text-[#9b9b9b] text-sm">
                  {formatBalances(chain.balance, chain.nativeCurrency.decimals)}{" "}
                  {chain.nativeCurrency.symbol}
                </h3>
                <div className="h-[6px] w-[60%] bg-[#202020] rounded-md"></div>
              </div>
            ))}
          </div>
        )}
        <button
          disabled={end === chains.length}
          onClick={() => {
            setStart(start + 10);
            setEnd(end + 10);
          }}
          className="flex items-center justify-center cursor-pointer"
        >
          <FaAngleRight className="text-[#9b9b9b] w-10 h-10" />
        </button>
      </div>
    </div>
  );
}
