"use client";
import Switch from "@/components/modals/Switch";
import { chains } from "@/constants/config";
import { useFaucetContext } from "@/context";
import { Menu } from "@headlessui/react";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { KeyboardEvent, MouseEvent, useRef, useState, useEffect } from "react";
import { LuChevronsUpDown, LuCheckSquare } from "react-icons/lu";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Loading from "@/components/Loading";
import ParticlesComponent from "@/components/ParticlesComponent";
import SyncLoader from "react-spinners/SyncLoader";

export default function Home() {
  const [isLoading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState("Request Tokens");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, setUser, selectedChains, toggle, state } = useFaucetContext();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchMenu, setSwitchMenu] = useState<string>("Switch");
  const captchaRef = useRef<HCaptcha>(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleShowSwitchModal = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowSwitchModal(true);
  };

  const handleCloseSwitchModal = () => {
    setShowSwitchModal(false);
  };

  const checkForNumbers = (event: KeyboardEvent<HTMLInputElement>) => {
    const neededChars = ["Backspace", "Tab", "Enter", ",", "."];
    if (
      (event.key.charCodeAt(0) < 48 ||
        event.key.charCodeAt(0) > 57 ||
        event.key.startsWith("Numpad")) &&
      !neededChars.includes(event.key)
    ) {
      event.preventDefault();
    }
    if (
      event.currentTarget.value.split(".").length === 2 &&
      (event.key === "." || event.key === ",")
    ) {
      event.preventDefault();
    }
  };

  const getMaxAmount = (event: MouseEvent<HTMLButtonElement>) => {
    setUser({ ...user, amount: "10" });
    event.preventDefault();
  };

  const getAddress = (chain: string) => {
    setSwitchMenu(chain);
    if (!user.address) return;
    const type = chains.find((c) => c.name === chain)?.type;
    if (type === "substrate") {
      const prefix = chains.find((c) => c.name === chain)?.prefix;
      const address = encodeAddress(decodeAddress(user.address), prefix);
      setUser({ ...user, address: address });
    }
  };

  const getDisburseData = () => {
    if (toggle) {
      return [
        {
          chain: user.chain,
          address: user.address,
          amount: user.amount,
          type: chains.find((a) => a.name === user.chain)?.type ?? "",
          rpc: chains.find((a) => a.name === user.chain)?.rpcUrl ?? "",
          nativeCurrency:
            chains.find((a) => a.name === user.chain)?.nativeCurrency ?? "",
        },
      ];
    }
    const disburse = selectedChains.map((chain) => {
      return {
        chain: chain,
        address: encodeAddress(
          decodeAddress(user.address),
          chains.find((a) => a.name === chain)?.prefix
        ),
        amount: Number(10),
        type: chains.find((a) => a.name === chain)?.type ?? "",
        rpc: chains.find((a) => a.name === chain)?.rpcUrl ?? "",
        nativeCurrency:
          chains.find((a) => a.name === chain)?.nativeCurrency ?? "",
      };
    });
    return disburse;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setButtonText("Please wait");
    setIsSubmitting(true);
    captchaRef.current?.execute();
    if (state.ethereumConnected || state.polkadotConnected) {
      const res = await axios.post(
        "/api/disburse",
        JSON.stringify({ disburseChains: getDisburseData() })
      );
      if (res.data) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-[512px] w-full bg-[#1b1b1b] shadow-lg rounded-lg items-center border-[#404040] justify-center gap-[10px] pointer-events-auto flex ring-1 p-4 ring-black ring-opacity-5`}
          >
            <LuCheckSquare className="text-green-500 h-5 w-5" />
            <span className="h-2 w-2 mr-2 block shrink-0" />
            {toggle ? (
              <p className="text-sm">
                Successfully, sent {user.amount}
                {
                  chains.find((a) => a.name === user.chain)?.nativeCurrency
                    .symbol
                }{" "}
                to your wallet address{" "}
              </p>
            ) : (
              <p className="text-sm">
                Successfully, sent {user.amount} to your selected chains
              </p>
            )}
          </div>
        ));
      } else {
        toast.error("Something went wrong, please try again");
      }
      setUser({ ...user, amount: "", chain: "", address: "" });
    }
    setButtonText("Request Tokens");
    setIsSubmitting(false);
    router.push("/");
  };

  const onVerify = async (captchaCode: string | null) => {
    if (!captchaCode) {
      return;
    }
    try {
      const res = await axios.post("/api/verify", {
        chain: user.chain,
        address: user.address,
        amount: 10 | Number(user.amount),
        captcha: captchaCode,
      });
      if (res.data) {
        const res = await axios.post(
          "/api/disburse",
          JSON.stringify({ disburseChains: getDisburseData() })
        );
        if (res.data) {
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-[512px] w-full bg-[#1b1b1b] shadow-lg rounded-lg items-center border-[#404040] justify-center gap-[10px] pointer-events-auto flex ring-1 p-4 ring-black ring-opacity-5`}
            >
              <LuCheckSquare className="text-green-500 h-5 w-5" />
              <span className="h-2 w-2 mr-2 block shrink-0" />
              {toggle ? (
                <p className="text-sm">
                  Successfully, sent {user.amount}{" "}
                  {
                    chains.find((a) => a.name === user.chain)?.nativeCurrency
                      .symbol
                  }{" "}
                  to your wallet address{" "}
                </p>
              ) : (
                <p className="text-sm">
                  Successfully, sent {user.amount} to your selected chains
                </p>
              )}
            </div>
          ));
        } else {
          const error = await res.data;
          toast.error(error.message || "Something went wrong");
        }
      } else {
        const error = await res.data;
        toast.error(error.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setButtonText("Request tokens");
      setIsSubmitting(false);
    } finally {
      captchaRef.current?.resetCaptcha();
      setUser({ chain: "", amount: "", address: "" });
      setButtonText("Request tokens");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative">
      <ParticlesComponent />
      <div className="relative min-h-[80vh] items-center grid justify-center">
        <Toaster />
        {isLoading ? (
          <Loading />
        ) : (
          <form
            className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[4px] bg-[#131313] rounded-[12px]"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col items-center space-y-[5px]">
              <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
                <span className="text-xs text-[#9b9b9b] h-6">Chain</span>
                <div className="flex items-center justify-between w-full">
                  <input
                    type="text"
                    className="w-2/3 h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]"
                    value={user.chain}
                    onChange={(e) =>
                      setUser({ ...user, chain: e.target.value })
                    }
                    placeholder="Rococo Relay Chain"
                  />
                  {toggle ? (
                    <button
                      className="w-[120px] h-full p-2 flex gap-2 items-center justify-between bg-[#311C31] text-sm text-[#FC72FF] font-medium rounded-md outline-none"
                      onClick={handleShowSwitchModal}
                    >
                      {!user.chain ? (
                        <p>Switch</p>
                      ) : (
                        <p>
                          {
                            chains.find((a) => a.name === user.chain)
                              ?.nativeCurrency.symbol
                          }
                        </p>
                      )}
                      <LuChevronsUpDown className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      className="w-[120px] h-full p-2 flex gap-2 items-center justify-between bg-[#311C31] text-sm text-[#FC72FF] font-medium rounded-md outline-none"
                      onClick={handleShowSwitchModal}
                    >
                      <p>Select</p>
                      <LuChevronsUpDown className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {toggle ? (
                  <span className="h-3 w-full text-[#9b9b9b] text-xs">
                    {user.chain === "" ? "" : `You are on ${user.chain}`}
                  </span>
                ) : (
                  <span className="h-3 w-full text-[#9b9b9b] text-xs">
                    {user.chain === ""
                      ? ""
                      : `You have selected ${selectedChains.length} chains`}
                  </span>
                )}
              </div>
              <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-[#9b9b9b] h-6">Address</span>
                  {!toggle && (
                    <Menu>
                      <Menu.Button className="text-[#0066ff] bg-[rgba(0,102,255,0.1)] px-2 py-1 rounded-md text-xs">
                        {switchMenu} format
                      </Menu.Button>
                      <Menu.Items
                        className={`absolute left-auto right-0 top-[170px] z-50 mt-2 origin-bottom-right mr-4 w-[160px] rounded-md bg-[#131313] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1`}
                      >
                        {selectedChains.map((chain) => (
                          <Menu.Item key={chain}>
                            {({ active }) => (
                              <div
                                onClick={() => getAddress(chain)}
                                className={`cursor-pointer text-wrap text-start p-2 ${
                                  active
                                    ? "bg-[rgba(0,102,255,0.1)] text-[#0066ff]"
                                    : "text-[#9b9b9b]"
                                } flex rounded-md items-center w-full text-xs`}
                              >
                                {chain}
                              </div>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Menu>
                  )}
                </div>
                <div className="flex items-center justify-between w-full">
                  <input
                    type="text"
                    className="w-full h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]"
                    value={user.address}
                    onChange={(e) =>
                      setUser({ ...user, address: e.target.value })
                    }
                    placeholder="address"
                  />
                </div>
                {toggle ? (
                  <span className="h-3 w-full text-[#9b9b9b] text-xs">
                    {user.chain === ""
                      ? ""
                      : `Your ${user.chain} wallet address`}
                  </span>
                ) : (
                  <span className="h-3 w-full text-[#9b9b9b] text-xs">
                    {user.chain === ""
                      ? ""
                      : `Click on switch button to change address.`}
                  </span>
                )}
              </div>
              {toggle && (
                <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#0e0909]">
                  <span className="text-xs text-[#9b9b9b] h-6">Amount</span>
                  <div className="flex items-center justify-between w-full">
                    <input
                      type="text"
                      className="w-1/2 h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]"
                      value={user.amount}
                      inputMode="decimal"
                      onKeyDown={checkForNumbers}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          amount: e.target.value.replace(",", "."),
                        })
                      }
                      placeholder="0"
                    />
                    <button
                      onClick={getMaxAmount}
                      className="w-1/2 h-full p-2 flex gap-2 items-center justify-center bg-[rgba(0,102,255,0.1)] text-base text-[#0066FF] font-medium rounded-[8px] outline-none"
                    >
                      Max
                    </button>
                  </div>
                  <span className="text-[#9b9b9b] text-xs h-3 w-full">
                    You can request up to 10 tokens.
                  </span>
                </div>
              )}
            </div>
            <div className="w-full flex flex-col space-y-2 items-center justify-center">
              <button
                type="submit"
                className="bg-[#311C31] text-[#FC72FF] w-full h-14 text-lg font-medium rounded-[10px] active:scale-95"
              >
                {buttonText}{" "}
                <span>
                  {isSubmitting && (
                    <SyncLoader color="#FC72FF" margin={2} size={10} />
                  )}
                </span>
              </button>
              {!state.ethereumConnected && !state.polkadotConnected && (
                <HCaptcha
                  sentry
                  size="invisible"
                  ref={captchaRef}
                  theme="light"
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={onVerify}
                />
              )}
            </div>
          </form>
        )}
        {showSwitchModal && <Switch onClose={handleCloseSwitchModal} />}
      </div>
    </main>
  );
}
