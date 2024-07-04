"use client";
import { Chain, chains } from "@/constants/config";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useEffect, useState, useCallback } from "react";
import { FiLoader, FiArrowDown, FiCheck } from "react-icons/fi";
import Loading from "./Loading";

type FaucetBalance = {
  name: string;
  balance: string | null;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpc: string;
  type: string;
  threshold: number;
};

const loadingMessages = [
  "Hodling tight...",
  "Mining some data...",
  "Fetching the moon...",
  "Calculating crypto magic...",
  "Blockchain wizardry in progress...",
];

export default function Balance() {
  const [start, setStart] = useState(0);
  const [faucetBalances, setFaucetBalances] = useState<FaucetBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const fetchFaucetBalances = useCallback(async () => {
    setLoading(true);
    const batch = chains.slice(start, start + 12);
    if (batch.length === 0) {
      setAllLoaded(true);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("/api/balance", { chains: batch });
      const data = res.data.data;
      setFaucetBalances((prev) => [...prev, ...data]);
      setStart((prev) => prev + 12);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [start]);

  useEffect(() => {
    fetchFaucetBalances();
  }, [fetchFaucetBalances]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && !initialLoad) {
      interval = setInterval(() => {
        setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading, initialLoad]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= fullHeight - 50) {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const formatBalances = (amount: string | null, decimals: number) => {
    if (amount === null) {
      return 0;
    }
    return Number(new BigNumber(amount).shiftedBy(-decimals).toFixed(2));
  };

  return (
    <div className="flex flex-col top-10 relative gap-[20px] min-h-[80vh]">
      {initialLoad && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <Loading />
        </div>
      )}
      <div className="grid auto-rows-auto overflow-y-auto w-[80vw] gap-3 grid-cols-3">
        {faucetBalances.map((chain, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center p-4 gap-3 ${
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
      <div className="mb-16 h-10"></div>
      {faucetBalances.length > 0 && !initialLoad && (
        <div className={`fixed mb-16 bottom-0 right-14 px-4 py-2 bg-[#333] rounded-full inline-flex text-[#9b9b9b] ${showLoadMore ? 'block' : 'hidden'}`}>
          {loading ? (
            <div className="flex items-center">
              <FiLoader className="animate-spin mr-2" /> {currentMessage}
            </div>
          ) : allLoaded ? (
            <div className="flex items-center text-white">
              <FiCheck className="mr-2" /> All Chains Loaded
            </div>
          ) : (
            <button
              onClick={fetchFaucetBalances}
              className="flex items-center text-[#9b9b9b] bg-[#333] rounded"
            >
              <FiArrowDown className="mr-2" /> Click to load more...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
