import { Chain } from "@/constants/config";
import { User } from "@/context";
import Image from "next/image";
import { Fragment } from "react";
import { IoIosClose } from "react-icons/io";

type SingleSelectionProps = {
  mode?: false;
  value?: Chain;
  onChange: (value: Chain | undefined) => void;
  switchChain: (value: Chain) => void;
};

type MultipleSelectionProps = {
  mode: true;
  value: Chain[];
  onChange: (value: Chain[]) => void;
  switchChain?: (value: Chain) => void;
};

type SelectionProps = {
  user: User;
  options: Chain[];
  onClose: () => void;
  setUser: (user: User) => void;
} & (SingleSelectionProps | MultipleSelectionProps);

export default function Selection({
  switchChain,
  user,
  setUser,
  mode,
  options,
  value,
  onChange,
  onClose,
}: SelectionProps) {
  let all_chains: { [key: string]: Chain[] } = options.reduce((acc, option) => {
    if (!acc[option.chainType]) {
      acc[option.chainType] = [];
    }
    acc[option.chainType].push(option);
    return acc;
  }, {} as { [key: string]: Chain[] });

  const keys = Object.keys(all_chains);
  const type = localStorage.getItem("SET_TYPE");

  if (mode && type && value) {
    all_chains = options.reduce((acc, option) => {
      if (!acc[option.chainType]) {
        acc[option.chainType] = [];
      }
      if (option.type === JSON.parse(type)) {
        acc[option.chainType].push(option);
      }
      return acc;
    }, {} as { [key: string]: Chain[] });
  }

  if (mode && value.length === 0) {
    all_chains = options.reduce((acc, option) => {
      if (!acc[option.chainType]) {
        acc[option.chainType] = [];
      }
      acc[option.chainType].push(option);
      return acc;
    }, {} as { [key: string]: Chain[] });
    localStorage.removeItem("SET_TYPE");
  }

  function selectOption(option: Chain) {
    if (mode) {
      if (localStorage.getItem("SET_TYPE") === null)
        localStorage.setItem("SET_TYPE", JSON.stringify(option.type));
      if (value.includes(option)) {
        onChange(value.filter((o) => o !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      if (option !== value) {
        switchChain(option);
        onChange(option);
      } else {
        onChange(undefined);
      }
    }
  }

  function isOptionSelected(option: Chain) {
    return mode ? value.includes(option) : option === value;
  }

  function handleSubmit() {
    if (mode) {
      setUser({ ...user, chain: value.map((c) => c.name).join(",") });
      onClose();
    } else {
      setUser({ ...user, chain: value?.name ?? "" });
      onClose();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-end space-y-5 p-1.5"
    >
      <div className="flex items-center justify-start w-full">
        {mode && (
          <div className="text-[#9b9b9b] flex flex-grow flex-wrap items-center gap-[0.5em]">
            {value.map((chain) => (
              <div
                key={chain.url}
                className="flex items-center px-1.5 py-1 rounded-md bg-[#311C31] text-[#FC72FF] justify-between cursor-pointer"
              >
                <span className="text-xs">{chain.name}</span>
                <span className="h-2 w-2 shrink-0 block" />
                <IoIosClose
                  onClick={() => selectOption(chain)}
                  className="h-4 w-4"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center w-full space-y-1">
        {keys.map((key) => (
          <Fragment key={key}>
            <div className="w-full p-1 space-y-1">
              <div className="inline-block w-full">
                <span className="text-[#9b9b9b] ml-2 p-2 text-sm">{key}</span>
                <div className="border-b-2 ml-2 border-[#303030]" />
              </div>
            </div>
            <div className="grid text-sm gap-[0.5em] w-full grid-cols-2 font-medium items-center">
              {all_chains[key].map((chain) => (
                <div
                  key={chain.url}
                  className={`flex items-center ml-2 px-2 py-1 h-full rounded-md cursor-pointer ${
                    mode
                      ? `${
                          isOptionSelected(chain)
                            ? "bg-[#311C31] text-[#FC72FF]"
                            : "hover:bg-[#191919] text-[#dadada]"
                        }`
                      : `${
                          isOptionSelected(chain)
                            ? "bg-[rgba(0,102,255,0.1)] text-[#0066ff]"
                            : "hover:bg-[#191919] text-[#dadada]"
                        }`
                  }`}
                  onClick={() => selectOption(chain)}
                >
                  <Image
                    src={`/images/${chain.url}.svg`}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="h-6 w-6"
                  />
                  <span className="h-2 w-2 mr-2 flex shrink-0" />
                  <span>{chain.name}</span>
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
      <button
        className={`lg:w-1/6 w-1/3 fixed bottom-12 text-[#fff] ${
          mode
            ? "bg-[rgba(252,114,255,0.7)] hover:bg-[rgba(252,114,255,0.9)]"
            : "bg-[rgba(0,102,255,0.7)] hover:bg-[rgba(0,102,255,0.9)]"
        }  active:scale-95 p-2 rounded-[12px]`}
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
