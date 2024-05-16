"use client";
import React, { useEffect } from'react';
import { formatBalance } from '@polkadot/util';
import  Web3, { FMT_BYTES, FMT_NUMBER }  from 'web3';
import { initPolkadotAPI } from '@/lib/polkadot';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Chain, chains } from '@/constants/config';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { useRouter } from 'next/navigation';

export type Account = {
  address: string;
  balance: number;
  chain: string;
  chainId?: number;
  symbol: string;
};

export type User = {
  chain: string;
  address: string;
  amount: string;
};

type State = {
  ethereumConnected: boolean;
  polkadotConnected: boolean;
  selectedEthereumAccount: string | undefined;
  selectedPolkadotAccount: string | undefined;
}

const initialState: State = {
  ethereumConnected: false,
  polkadotConnected: false,
  selectedEthereumAccount: undefined,
  selectedPolkadotAccount: undefined,
};

type Action = 
  | {type: 'SET_ETHEREUM_CONNECTED', payload: boolean}
  | {type: 'SET_POLKADOT_CONNECTED', payload: boolean}
  | {type: 'SET_SELECTED_ETHEREUM_ACCOUNT', payload: string | undefined}
  | {type: 'SET_SELECTED_POLKADOT_ACCOUNT', payload: string | undefined};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ETHEREUM_CONNECTED':
      return { ...state, ethereumConnected: action.payload };
    case 'SET_POLKADOT_CONNECTED':
      return { ...state, polkadotConnected: action.payload };
    case 'SET_SELECTED_ETHEREUM_ACCOUNT':
      return { ...state, selectedEthereumAccount: action.payload };
    case 'SET_SELECTED_POLKADOT_ACCOUNT':
      return { ...state, selectedPolkadotAccount: action.payload };
    default:
      return state;
  }
};

type FaucetContextType = {
  state: State;
  handleConnect: (type: 'polkadot' | 'ethereum') => void;
  handleDisconnect: (type: 'polkadot' | 'ethereum') => void;
  ethereumAccounts: Account[];
  polkadotAccounts: Account[];
  setSelectedPolkadotAccount: (account: string) => void;
  setSelectedEthereumAccount: (account: string) => void;
  switchEthereumChain: (chain: Chain) => void;
  switchPolkadotChain: (chain: Chain) => void;
  user: User;
  setUser: (user: User) => void;
  selectedChains: string[];
  setSelectedChains: (chains: string[]) => void;
  toggle: boolean;
  setToggle: (toggle: boolean) => void;
}

const FaucetContext = React.createContext<FaucetContextType | null>(null);

export const FaucetProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [polkadotAccounts, setPolkadotAccounts] = React.useState<Account[]>([]);
  const [ethereumAccounts, setEthereumAccounts] = React.useState<Account[]>([]);
  const [user, setUser] = React.useState<User>({
    chain: "",
    address: "",
    amount: "",
  });
  const router = useRouter();
  const [selectedChains, setSelectedChains] = React.useState<string[]>([]);
  const [toggle, setToggle] = React.useState<boolean>(true);

  const setPolkadotConnected = (connected: boolean) => {
    dispatch({ type: 'SET_POLKADOT_CONNECTED', payload: connected });
  };

  const setEthereumConnected = (connected: boolean) => {
    dispatch({ type: 'SET_ETHEREUM_CONNECTED', payload: connected });
  };

  const setSelectedPolkadotAccount = (account: string | undefined) => {
    dispatch({ type: 'SET_SELECTED_POLKADOT_ACCOUNT', payload: account });
  }

  const setSelectedEthereumAccount = (account: string | undefined) => {
    dispatch({ type: 'SET_SELECTED_ETHEREUM_ACCOUNT', payload: account });
  };

  const updatePolkadotBalances = async() => {
    console.log("Updating Polkadot balances");
    try {
      if ((window as any).injectedWeb3) {
        const web3Enable = (await import('@polkadot/extension-dapp')).web3Enable;
        const extensions = await web3Enable('Polkadot-JS Apps')
        if (extensions.length === 0) {
          throw new Error('No Polkadot wallet detected');
        }
        const api = await initPolkadotAPI('wss://beresheet.jelliedowl.net');
        const web3Accounts = (await import('@polkadot/extension-dapp')).web3Accounts;
        const accounts = await web3Accounts();
        formatBalance.setDefaults({
          decimals: 18,
          unit: 'EDG'
        });
        const balances = await Promise.all(accounts.map(async (account) => {
          const balance = (await api.query.system.account(account.address)) as AccountInfo;
          const amount = balance.data.free;
          return {
            address: api.createType('Address', account.address).toString(),
            chain: (await api.rpc.system.chain()).toHuman(),
            balance: Number(formatBalance(amount)),
            symbol: "tEDG"
          };
        }));
        console.log("polkadot accounts", balances);
        setPolkadotAccounts(balances);
        setUser({...user, address: balances[0].address, chain: balances[0].chain});
        return true;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateEthereumBalances = async() => {
    console.log("Updating Ethereum balances");
    try {
      if ('ethereum' in window) {
        const web3 = new Web3(window.ethereum!);
        await (window as any).ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        console.log("ethereum accounts", accounts);
        const balances = await Promise.all(accounts.map(async (account) => {
          const balance = await web3.eth.getBalance(account);
          const chainId = await web3.eth.getChainId({number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX});
          const symbol = chains.find((chain) => chain.chainId === String(chainId))?.nativeCurrency.symbol ?? "";
          const chain = chains.find((chain) => chain.chainId === String(chainId)) ?? chains[0];
          return {
            address: account,
            balance: Number(Web3.utils.fromWei(balance, 'ether')),
            chainId: chainId,
            symbol: symbol,
            chain: chain.name,
          };
        }));
        setEthereumAccounts(balances);
        setSelectedEthereumAccount(balances[0].address);
        setUser({...user, address: balances[0].address, chain: balances[0].chain});
        return true;
      } else {
        throw new Error('Ethereum wallet not detected');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connectToPolkadot = async() => {
    console.log("Attempting to connect to Polkadot");
    try {
      if((window as any).injectedWeb3){
        return await updatePolkadotBalances();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectToEthereum = async() => {
    console.log("Attempting to connect to Ethereum");
    try {
      if ('ethereum' in window) {
        const chainId = await (window as any).ethereum.request({ method: 'eth_chainId', params: [] });
        const availableChain = chains.find(chain => `0x${Number(chain.chainId).toString(16)}` === chainId);
          try {
            if (!availableChain) {
              await (window as any).ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x7e6" }],
              })
            };
          } catch (err) {
            if ((err as any).code === 4902) {
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{ chainId: "0x7e6", chainName: "Beresheet BereEVM", rpcUrls: ["https://beresheet-evm.jelliedowl.net"], nativeCurrency: { name: "tEDG", symbol: "tEDG", decimals: 18} }],
              })
            };
        };
        await updateEthereumBalances();
        return true;
      } else {
        throw new Error('Ethereum wallet not detected');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const disconnectFromPolkadot = async() => {
    console.log('Disconnecting from Substrate wallet');
    try {
      console.log('Done!');
    } catch (err) {
      console.error(err);
    }

  };

  const disconnectFromEthereum = async() => {
    console.log('Disconnecting from EVM wallet');
    try {
      console.log('Done!');
    } catch (err) {
      console.error(err);
    }
  };

  const switchEthereumChain = async(chain: Chain) => {
    console.log("Switching to desired chain");
    setUser({...user, chain: chain.name});
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(chain.chainId).toString(16)}` }],
      })
      await updateEthereumBalances();
    } catch (err) {
      if ((err as any).code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{ chainId: `0x${Number(chain.chainId).toString(16)}`, chainName: chain.name, rpcUrls: [chain.rpcUrl], nativeCurrency: chain.nativeCurrency }],
        })
        await updateEthereumBalances();
      };
    };
  };

  const switchPolkadotChain = async(chain: Chain) => {
    console.log("Switching to desired chain");
    try {
      if ((window as any).injectedWeb3) {
        const web3Enable = (await import('@polkadot/extension-dapp')).web3Enable;
        const extensions = await web3Enable('Polkadot-JS Apps')
        if (extensions.length === 0) {
          throw new Error('No Polkadot wallet detected');
        }
        console.log(`Connecting to ${chain.name}`, chain.rpcUrl);
        const api = await initPolkadotAPI(chain.rpcUrl);
        const web3Accounts = (await import('@polkadot/extension-dapp')).web3Accounts;
        const accounts = await web3Accounts();
        formatBalance.setDefaults({
          decimals: chain.nativeCurrency.decimals,
          unit: chain.nativeCurrency.symbol
        });
        const balances = await Promise.all(accounts.map(async (account) => {
          const balance = (await api.query.system.account(account.address)) as AccountInfo;
          const amount = balance.data.free;
          console.log("Address:", encodeAddress(decodeAddress(account.address), chain.prefix) );
          return {
            address: encodeAddress(decodeAddress(account.address), chain.prefix),
            chain: (await api.rpc.system.chain()).toHuman(),
            balance: Number(formatBalance(amount)),
            symbol: chain.nativeCurrency.symbol,
          };
        }));
        console.log("polkadot accounts", balances);
        setPolkadotAccounts(balances);
        setSelectedPolkadotAccount(balances[0].address);
        setUser({...user, address: encodeAddress(decodeAddress(user.address), chain.prefix), chain: chain.name});
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleConnect = (type: 'polkadot' | 'ethereum') => {
    if ((type === 'polkadot' && state.polkadotConnected) || (type === 'ethereum' && state.ethereumConnected)) {
      return;
    }
    async function connect(){
      router.push('/');
      if(type === 'polkadot'){
        const res = await connectToPolkadot();
        if (res) {
          setPolkadotConnected(true);
          router.push('/?chain=beresheet')
        }
      }
      else {
        const res = await connectToEthereum();
        if (res) {
          setEthereumConnected(true);
          if ('ethereum' in window) {
            const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
            const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            const availableChain = chains.find(chain => `0x${Number(chain.chainId).toString(16)}` === chainId);
            if (!availableChain) {
              router.push('/?chain=beresheet-bereevm')
              setUser({...user, chain: 'Beresheet BereEVM', address: accounts[0]});
            } else {
              router.push(`/?chain=${availableChain.url}`)
              setUser({...user, chain: availableChain.name, address: accounts[0]});
            }
          }
        }
      }
    }
    connect();
  };

  const handleDisconnect = (type: 'polkadot' | 'ethereum') => {
    const isConnected = type === 'polkadot' ? state.polkadotConnected : state.ethereumConnected;
    if(!isConnected) return;

    async function disconnect(){
      if(type === 'polkadot'){
        await disconnectFromPolkadot();
        setPolkadotConnected(false);
        setSelectedPolkadotAccount(undefined);
      }
      else {
        await disconnectFromEthereum();
        setEthereumConnected(false);
        setSelectedEthereumAccount(undefined);
      }
    }
    disconnect();
    setUser({...user, chain: "", address: ""});
    router.push("/");
  };

  useEffect(() => {
    if (state.polkadotConnected && polkadotAccounts && polkadotAccounts.length > 0) {
      if (!state.selectedPolkadotAccount) {
        setSelectedPolkadotAccount(polkadotAccounts[0].address);
        setUser({...user, address: polkadotAccounts[0].address, chain: polkadotAccounts[0].chain});
      }
    }

    if (state.ethereumConnected && ethereumAccounts && ethereumAccounts.length > 0) {
      if (!state.selectedEthereumAccount) {
        setSelectedEthereumAccount(ethereumAccounts[0].address);
        setUser({...user, address: ethereumAccounts[0].address, chain: ethereumAccounts[0].chain});
      }
    }
  }, [state, polkadotAccounts, ethereumAccounts, user]);

  return (
    <FaucetContext.Provider value={{
      state,
      handleConnect,
      handleDisconnect,
      ethereumAccounts,
      polkadotAccounts,
      setSelectedEthereumAccount,
      setSelectedPolkadotAccount,
      switchEthereumChain,
      switchPolkadotChain,
      user,
      setUser,
      selectedChains,
      setSelectedChains,
      toggle,
      setToggle,
    }}>
      {children}
    </FaucetContext.Provider>
  );
};

export const useFaucetContext = () => {
  const context = React.useContext(FaucetContext);
  if (context === null) {
    throw new Error('useFaucetContext must be used within a FaucetProvider');
  }
  return context;
};
