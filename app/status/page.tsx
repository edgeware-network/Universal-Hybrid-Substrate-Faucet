"use client";
import { chains } from "@/constants/config";
import ParticlesComponent from "@/components/ParticlesComponent";
import { useState, useEffect } from "react";
import Loading from "@/components/Loading";

export default function Status() {
  const [isLoading, setLoading] = useState(true);
  const totalBalance = 1000;
  const consumedBalance = 600;
  const remaining = ((totalBalance - consumedBalance) / totalBalance) * 100;

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  return (
    <>
      <ParticlesComponent />
      <div className="flex flex-col relative gap-[20px] min-h-[80vh] ">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[8px] bg-[#181818] rounded-md">
            <div className="grid auto-rows-auto h-[420px] overflow-y-auto w-[60vw] gap-[8px] grid-cols-3 p-2">
              {chains.map((chain) => (
                <div
                  key={chain.name}
                  className={`flex text-center mr-2 flex-wrap w-[90%] flex-col items-center p-2 justify-center gap-[8px] bg-[#0f0f0f] rounded-[8px] row-span-1 col-span-1`}
                >
                  <h3 className="text-[#eaeaea] text-sm">{chain.name}</h3>
                  <div className="h-[6px] w-[60%] bg-[#202020] rounded-md ">
                    <div
                      style={{ width: `${remaining}%` }}
                      className={`h-full rounded-md ${
                        remaining < 35
                          ? "bg-red-400"
                          : remaining >= 35 && remaining < 70
                          ? "bg-orange-400"
                          : "bg-green-400"
                      }`}
                    ></div>
                  </div>
                  <h3 className="text-[#9b9b9b] text-sm">
                    {totalBalance - consumedBalance}{" "}
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
