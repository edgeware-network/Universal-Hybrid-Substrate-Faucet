"use client";
import { Chain, chains } from "@/constants/config";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useEffect, useState, useCallback } from "react";
import { FiLoader, FiArrowDown, FiCheck } from "react-icons/fi";
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

  const fetchFaucetBalances = useCallback(async () => {
    setLoading(true);
    const batch = chains.slice(start, start + 10);
    if (batch.length === 0) {
      setAllLoaded(true);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("/api/balance", { chains: batch });
      const data = await res.data.data;
      setFaucetBalances((prev) => [...prev, ...data]);
      setStart((prev) => prev + 10);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [start, initialLoad]);

  useEffect(() => {
    fetchFaucetBalances();
  }, []); // Fetch the initial 10 chains

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || allLoaded) return;
    fetchFaucetBalances();
  }, [fetchFaucetBalances, loading, allLoaded]);

  useEffect(() => {
    const debounceScroll = () => {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(handleScroll, 200);
      };
    };
    const debouncedHandleScroll = debounceScroll();
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, [handleScroll]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && !initialLoad) {
      interval = setInterval(() => {
        setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading, initialLoad]);

  const formatBalances = (amount: string | null, decimals: number) => {
    if (amount === null) {
      return 0;
    }
    return Number(new BigNumber(amount).shiftedBy(-decimals).toFixed(2));
  };

  return (
    <div className="flex flex-col relative gap-[20px] min-h-[80vh]">
      {initialLoad && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <Loading />
        </div>
      )}
      <div className="grid auto-rows-auto h-[420px] overflow-y-auto w-[80vw] gap-3 grid-cols-3">
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
      {faucetBalances.length > 0 && !initialLoad && (
        <div className="text-center mt-4">
          {loading ? (
            <div className="text-[#9b9b9b] px-4 py-2 bg-[#333] rounded inline-flex items-center justify-center">
              <FiLoader className="animate-spin mr-2" /> {currentMessage}
            </div>
          ) : allLoaded ? (
            <div className="text-[#9b9b9b] px-4 py-2 bg-[#333] rounded inline-flex items-center justify-center">
              <FiCheck className="mr-2" /> All Chains Loaded
            </div>
          ) : (
            <div className="text-[#9b9b9b] px-4 py-2 bg-[#333] rounded inline-flex items-center justify-center">
              <FiArrowDown className="mr-2" /> Scroll to load more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
