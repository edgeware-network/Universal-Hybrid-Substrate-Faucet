import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { chains } from "@/constants/config";
import SyncLoader from "react-spinners/SyncLoader";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Toast from "./Toast";
import { TbAlertSquareRounded } from "react-icons/tb";
import axios, { AxiosError } from "axios";
import { LuCheckSquare } from "react-icons/lu";
import { useFaucetContext } from "@/context";
import { Disburse } from "@/app/page";
import { set } from "mongoose";

function FaucetForm(
  { url,
    address,
    buttonText,
    setButtonText,
    setIsSubmitting,
    isSubmitting
   }: {
    url: string;
    address: string;
    buttonText: string;
    setButtonText: (text: string) => void;
    setIsSubmitting: (submitting: boolean) => void;
    isSubmitting: boolean
  }) {
  const chain = chains.find((a) => a.url === url)?? chains[0];
  const captchaRef = useRef<HCaptcha>(null);
  const { state, user, setUser } = useFaucetContext();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      Number(user.amount) >
      Number(chain.threshold * 0.001)
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

    if (!user.address || !user.amount) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setButtonText("Please wait");
    setIsSubmitting(true);
    captchaRef.current?.execute();
    if (state.ethereumConnected || state.polkadotConnected) {
      try {
        const res = await axios.post(
          "/api/disburse",
          JSON.stringify({
            disburses: [{ chain: chain.name, address: user.address, amount: Number(user.amount), type: chain.type, rpc: chain.rpcUrl, nativeCurrency: chain.nativeCurrency }],
          })
        );
        console.log("response: ", res.data.data);
        const disbursements: Disburse[] = res.data.data;
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        for (const d of disbursements) {
          if (d.txhash && d.txhash !== -1) {
            toast.custom(
              (t) => (
                <Toast
                  t={t}
                  Icon={LuCheckSquare}
                  className="text-green-500 h-5 w-5"
                  message={`Successful! Sent ${d.amount} ${d.symbol} to ${d.address}`}
                />
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
            JSON.stringify({
              disburses: [{ chain: chain.name, address: user.address, amount: Number(user.amount), type: chain.type, rpc: chain.rpcUrl, nativeCurrency: chain.nativeCurrency }],
            })
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
                    message={`Successful! Sent ${d.amount} ${d.symbol} to ${d.address}`}
                  />
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

  function getMaxAmount(event: MouseEvent<HTMLButtonElement>) {
    setUser({
      ...user,
      amount: `${chain.threshold * 0.001}`,
    });
    event.preventDefault();
  };

  function checkAmount(event: KeyboardEvent<HTMLInputElement>) {
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

  useEffect(() => {
    if (address) setUser({ ...user, address: address });
  })

  return(
    <form onSubmit={handleSubmit} className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[4px] bg-[#131313] rounded-[12px]">
      <div className="flex flex-col gap-[8px] items-center justify-center">
        <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
          <span className="text-xs text-[#9b9b9b] h-6">Chain</span>
          <div className="flex items-center justify-between w-full">
            <input
              type="text"
              readOnly
              className="w-full h-10 text-3xl text-[#FFFFFF] bg-inherit outline-none placeholder:text-[#5d5d5d]"
              value={chain.name} />
          </div>
          <span className="h-3 w-full text-[#9b9b9b] text-xs">
            {`You are on ${chain.name} chain`}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-[8px] items-center justify-center">
        <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
          <span className="text-xs text-[#9b9b9b] h-6">Address</span>
          <div className="flex items-center justify-between w-full">
            <input
              type="text"
              className="w-full h-10 text-3xl text-[#FFFFFF] bg-inherit outline-none placeholder:text-[#5d5d5d]"
              value={user.address}
              placeholder="wallet address"
              onChange={(e) => setUser({ ...user, address: e.target.value })} />
          </div>
          <span className="h-3 w-full text-[#9b9b9b] text-xs">
            {`Your ${chain.name} wallet address`}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-[8px] items-center justify-center">
        <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
          <span className="text-xs text-[#9b9b9b] h-6">Amount</span>
          <div className="flex items-center justify-between w-full">
            <input
              type="text"
              className="w-2/3 h-10 text-3xl text-[#FFFFFF] bg-inherit outline-none placeholder:text-[#5d5d5d]"
              value={user.amount}
              placeholder="0.0"
              onKeyDown={checkAmount}
              inputMode="decimal"
              onChange={(e) => setUser({ ...user, amount: e.target.value.replace(",", ".") })} />
            <button 
              onClick={getMaxAmount} 
              className="w-1/2 h-full p-2 flex gap-2 items-center justify-center bg-[rgba(0,102,255,0.1)] text-base text-[#0066FF] font-medium rounded-[8px] outline-none"
            > Max
            </button>
          </div>
          <span className="h-3 w-full text-[#9b9b9b] text-xs">
            {`You can request up to ${chain.threshold! * 0.001} ${chain.nativeCurrency.symbol} tokens.`}
          </span>
        </div>
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
  );
};
export default function Faucet({ url, address }: { url: string, address: string }) {
  const [isLoading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState("Request Tokens");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  return (
    <div className="grid place-content-center relative min-h-[90vh] z-10">
      {isLoading ? (
        <Loading />
      ) : (
        <FaucetForm address={address} url={url} buttonText={buttonText} setButtonText={setButtonText} setIsSubmitting={setIsSubmitting} isSubmitting={isSubmitting}  />
      )}
    </div>
  );
};
