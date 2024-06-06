"use client";
import Switch from "@/components/modals/Switch";
import { Chain, chains } from "@/constants/config";
import { useFaucetContext } from "@/context";
import { Menu } from "@headlessui/react";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { MouseEvent, useRef, useState, useEffect, KeyboardEvent } from "react";
import { LuChevronsUpDown, LuCheckSquare } from "react-icons/lu";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import axios, { AxiosError } from "axios";
import { Toaster, toast } from "react-hot-toast";
import Loading from "@/components/Loading";
import ParticlesComponent from "@/components/ParticlesComponent";
import SyncLoader from "react-spinners/SyncLoader";
import Toast from "@/components/Toast";
import { TbAlertSquareRounded } from "react-icons/tb";
import { disburse } from "@/lib/utils";

type Disburse = {
  chain: string;
  address: string;
  amount: number;
  symbol: string;
  txhash: string | null | number;
  createdAt: Date;
};

export default function Home() {
  const [isLoading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState("Request Tokens");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, setUser, toggle, state, switcherMode, selectorMode, setSelectorMode, setSwitcherMode } = useFaucetContext();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchMenu, setSwitchMenu] = useState<string>("Switch");
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // console.log(switcherMode, selectorMode, user);
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
    setUser({
      ...user,
      amount: `${chains.find((a) => a.name === user.chain)?.threshold! * 0.001}`,
    });
    event.preventDefault();
  };

  const getAddress = (chain: Chain) => {
    setSwitchMenu(chain.name);
    if (!user.address) return;
    if (chain.type === "substrate") {
      const address = encodeAddress(decodeAddress(user.address), chain.prefix);
      setUser({ ...user, address: address });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      Number(user.amount) >
      Number(chains.find((a) => a.name === user.chain)?.threshold! * 0.001)
    ) {
      toast.custom((t) => (
        <Toast
          t={t}
          Icon={TbAlertSquareRounded}
          className="text-red-500 w-5 h-5"
          message="Input amount exceeds the max disbursement amount!"
        />
      ));
      return;
    }

    if (!toggle) {
      if (!user.chain || !user.address) {
        toast.error("Please fill in all the required fields.");
        return;
      }
    } else {
      if (!user.chain || !user.address || !user.amount) {
        toast.error("Please fill in all the required fields.");
        return;
      }
    }
    setButtonText("Please wait");
    setIsSubmitting(true);
    captchaRef.current?.execute();
    if (state.ethereumConnected || state.polkadotConnected) {
      try {
        const res = await axios.post(
          "/api/disburse",
          JSON.stringify({ disburses: disburse(toggle, user.address, user.amount, switcherMode, selectorMode) })
        );
        console.log("response: ", res.data.data);
        const disbursements: Disburse[] = res.data.data;
        const delay = (ms: number) =>
          new Promise((res) => setTimeout(res, ms));

        for (const d of disbursements) {
          if (d.txhash && d.txhash !== -1) {
            toast.custom(
              (t) => (
                <Toast
                  t={t}
                  Icon={LuCheckSquare}
                  className="text-green-500 h-5 w-5"
                  message={`Successful! Sent ${d.amount} ${d.symbol} to ${d.address}`}/>
              ),
              { duration: 4000 }
            );
          } else if (d.txhash === -1) {
            toast.custom(
              (t) => (
                <Toast
                  t={t}
                  Icon={TbAlertSquareRounded}
                  className="text-red-500 h-5 w-5"
                  message={`Insufficient balance for ${d.chain}!`}
                />
              ),
              { duration: 4000 }
            );
          } else {
            toast.custom(
              (t) => (
                <Toast
                  t={t}
                  Icon={TbAlertSquareRounded}
                  className="text-red-500 h-5 w-5"
                  message={`Exceeded API limit for ${d.chain}!`}
                />
              ),
              { duration: 4000 }
            );
          }
          await delay(500);
        }
      } catch (error: any) {
        const message =
          error instanceof AxiosError ? error.response?.data.message : "";
        toast.custom((t) => (
          <Toast
            t={t}
            Icon={TbAlertSquareRounded}
            className="text-red-500 w-5 h-5"
            message={`${message}`}
          />
        ));
      }
      setUser({ chain: "", address: "", amount: "" });
      if(toggle) setSwitcherMode(undefined); else setSelectorMode([]);
    }
    setButtonText("Request Tokens");
    setIsSubmitting(false);
  };

  const onVerify = async (captchaCode: string | null) => {
    setIsSubmitting(true);
    setButtonText("Please Wait");
    if (!captchaCode) {
      return;
    }
    try {
      const res = await axios.post(
        "/api/verify",
        JSON.stringify({ captcha: captchaCode })
      );
      if (res.data.success) {
        try {
          const res = await axios.post(
            "/api/disburse",
            JSON.stringify({ disburses: disburse(toggle, user.address, user.amount, switcherMode, selectorMode) })
          );
          console.log("response: ", res.data.data);
          const disbursements: Disburse[] = res.data.data;
          const delay = (ms: number) =>
            new Promise((res) => setTimeout(res, ms));
          for (const d of disbursements) {
            if (d.txhash && d.txhash !== -1) {
              toast.custom(
                (t) => (
                  <Toast
                    t={t}
                    Icon={LuCheckSquare}
                    className="text-green-500 h-5 w-5"
                    message={`Successful! Sent ${d.amount} ${d.symbol} to ${d.address}`}/>
                ),
                { duration: 4000 }
              );
            } else if (d.txhash === -1) {
              toast.custom(
                (t) => (
                  <Toast
                    t={t}
                    Icon={TbAlertSquareRounded}
                    className="text-red-500 h-5 w-5"
                    message={`Insufficient balance for ${d.chain}!`}
                  />
                ),
                { duration: 4000 }
              );
            } else {
              toast.custom(
                (t) => (
                  <Toast
                    t={t}
                    Icon={TbAlertSquareRounded}
                    className="text-red-500 h-5 w-5"
                    message={`Exceeded API limit for ${d.chain}!`}
                  />
                ),
                { duration: 4000 }
              );
            }
            await delay(500);
          }
        } catch (error: any) {
          const message =
            error instanceof AxiosError ? error.response?.data.message : "";
          toast.custom((t) => (
            <Toast
              t={t}
              Icon={TbAlertSquareRounded}
              className="text-red-500 w-5 h-5"
              message={`${message}`}
            />
          ));
        }
      }
    } catch (error: any) {
      const message =
        error instanceof AxiosError ? error.response?.data.message : "";
      toast.custom((t) => (
        <Toast
          t={t}
          Icon={TbAlertSquareRounded}
          className="text-red-500 w-5 h-5"
          message={`${message}`}
        />
      ));
    } finally {
      captchaRef.current?.resetCaptcha();
      setUser({ chain: "", address: "", amount: "" });
      setButtonText("Request tokens");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative">
      <ParticlesComponent />
      <div className="relative min-h-[80vh] items-center grid justify-center">
        <Toaster position="bottom-right" />
        {isLoading ? (
          <Loading />
        ) : (
          <form
            className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[4px] bg-[#131313] rounded-[12px]"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-[8px] items-center justify-center">
              <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
                <span className="text-xs text-[#9b9b9b] h-6">Chain</span>
                <div className="flex items-center justify-between w-full">
                  <input
                    type="text"
                    className="w-2/3 h-10 text-3xl text-[#FFFFFF] bg-inherit outline-none placeholder:text-[#5d5d5d]"
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
                      : `You have selected ${selectorMode.length} chains`}
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
                        {selectorMode.map((chain) => (
                          <Menu.Item key={chain.url}>
                            {({ active }) => (
                              <div
                                onClick={() => getAddress(chain)}
                                className={`cursor-pointer text-wrap text-start p-2 ${
                                  active
                                    ? "bg-[rgba(0,102,255,0.1)] text-[#0066ff]"
                                    : "text-[#9b9b9b]"
                                } flex rounded-md items-center w-full text-xs`}
                              >
                                {chain.name}
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
                    className="w-full h-10 text-3xl text-[#FFFFFF] bg-inherit outline-none placeholder:text-[#5d5d5d]"
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
                      className="w-1/2 h-10 text-3xl text-[#FFFFFF] bg-inherit outline-none placeholder:text-[#5d5d5d]"
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
                    {user.chain === "" ? "" : `You can request up to ${switcherMode?.threshold! * 0.001} ${switcherMode?.nativeCurrency.symbol} tokens.`}                  </span>
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
        {showSwitchModal && <Switch selectorMode={selectorMode} setSelectorMode={setSelectorMode} switcherMode={switcherMode} setSwitcherMode={setSwitcherMode} onClose={handleCloseSwitchModal} />}
      </div>
    </main>
  );
}
