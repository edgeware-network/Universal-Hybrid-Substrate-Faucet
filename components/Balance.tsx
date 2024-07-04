"use client";
import { Chain, chains } from "@/constants/config";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useEffect, useState, useCallback } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { FaCheckCircle, FaAngleDoubleDown } from "react-icons/fa";
import Loading from "./Loading";
import { CSSProperties } from "react";

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

const BATCH_SIZE = 12;
const LOADING_INTERVAL_MS = 4000;

const loadingMessages = [
  "Hodling tight... 💎🙌",
  "Mining some data... ⛏️💰",
  "Fetching the moon... 🚀🌕",
  "Calculating crypto magic... ✨🔮",
  "Blockchain wizardry in progress... 🧙‍♂️🔗",
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
    const batch = chains.slice(start, start + BATCH_SIZE);
    if (batch.length === 0) {
      setAllLoaded(true);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("/api/balance", { chains: batch });
      const data = res.data.data;
      setFaucetBalances((prev) => [...prev, ...data]);
      setStart((prev) => prev + BATCH_SIZE);
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
    const interval = loading && !initialLoad ? setInterval(() => {
      setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, LOADING_INTERVAL_MS) : undefined;

    return () => clearInterval(interval);
  }, [loading, initialLoad]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      setShowLoadMore(scrollTop + windowHeight >= fullHeight - 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatBalances = (amount: string | null, decimals: number) => {
    if (!amount) return 0;
    return new BigNumber(amount).shiftedBy(-decimals).toNumber();
  };

  const getSliderStyles = (balance: number, threshold: number): CSSProperties => {
    const maxBalance = 2 * threshold;
    const widthPercentage = (balance / maxBalance) * 100;
    let backgroundColor = "#FF0000"; // Red for empty balance

    if (balance > 0) {
      backgroundColor = balance < threshold ? "#FFA500" : "#00FF00"; // Orange if below threshold, green if above
    }

    return {
      width: `${Math.min(widthPercentage, 100)}%`,
      backgroundColor,
      position: "relative",
    };
  };

  const getDotStyles = (balance: number): CSSProperties => {
    if (balance === 0) {
      return {
        height: "100%",
        width: "100%",
        backgroundColor: "red",
        borderRadius: "50%",
      };
    }
    return {};
  };

  return (
    <div className="flex flex-col top-10 relative gap-[20px] min-h-[80vh]">
      {initialLoad && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <Loading />
        </div>
      )}
      <div className="grid auto-rows-auto overflow-y-auto w-[80vw] gap-3 grid-cols-3">
        {faucetBalances.map((chain, index) => {
          // Find the matching chain from config.ts
          const configChain = chains.find((c) => c.name === chain.name);

          const balance = formatBalances(chain.balance, chain.nativeCurrency.decimals);
          const threshold = configChain ? configChain.threshold : 0;

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-4 gap-3 ${
                chain.balance === null ? "bg-[#4d1526]" : "bg-black"
              } rounded-md text-center flex-wrap`}
            >
              <h3 className="text-[#eaeaea] text-sm">{chain.name}</h3>
              <h3 className="text-[#9b9b9b] text-sm">
                {balance.toFixed(2)} {chain.nativeCurrency.symbol}
              </h3>
              <div className="slider h-[6px] w-[60%] bg-[#202020] rounded-md relative">
                {configChain && (
                  <div
                    className="h-full rounded-md"
                    style={getSliderStyles(balance, threshold)}
                  >
                    {balance === 0 && (
                      <div
                        style={getDotStyles(balance)}
                        className="absolute inset-0 flex items-center justify-center"
                      ></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mb-16 h-10"></div>
      {faucetBalances.length > 0 && !initialLoad && (
        <div
          className={`fixed mb-16 bottom-0 right-14 px-4 py-2 bg-gray-900 rounded-full inline-flex text-[#9b9b9b] ${
            showLoadMore ? "block" : "hidden"
          }`}
          aria-live="polite"
        >
          {loading ? (
            <div className="flex items-center">
              <RiLoader4Line className="animate-spin mr-2" aria-hidden="true" />{" "}
              {currentMessage}
            </div>
          ) : allLoaded ? (
            <div className="flex items-center text-white">
              <FaCheckCircle className="mr-2" aria-hidden="true" /> All chains
              loaded
            </div>
          ) : (
            <button
              onClick={fetchFaucetBalances}
              className="flex items-center text-[#9b9b9b] bg-gray-900 rounded"
              aria-label="Click to load more balances"
            >
              <FaAngleDoubleDown className="mr-2" aria-hidden="true" /> Click to
              load more...
            </button>
          )}
        </div>
      )}
    </div>
  );
}