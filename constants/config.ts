export type Chain = {
  name: string;
  url: string;
  chainType: string;
  chainId: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  prefix?: number;
  type: string;
  threshold: number;
  image: string;
};

export const chains: Chain[] = [
  {
    name: "Westend",
    url: "westend",
    chainType: "Westend & Parachain",
    chainId: "",
    rpcUrl: "wss://westend-rpc.polkadot.io",
    nativeCurrency: {
      name: "WND",
      symbol: "WND",
      decimals: 12,
    },
    prefix: 42,
    type: "substrate",
    threshold: 20,
    image: "/images/metamask.svg",
  },
  {
    name: "Rococo Asset Hub",
    url: "rococo-assethub",
    chainType: "Westend & Parachain",
    chainId: "",
    rpcUrl: "wss://rococo-asset-hub-rpc.polkadot.io",
    nativeCurrency: {
      name: "ROC",
      symbol: "ROC",
      decimals: 12,
    },
    prefix: 42,
    type: "substrate",
    threshold: 20,
    image: "/images/westend.svg",
  },
  {
    name: "Rococo",
    url: "rococo",
    chainId: "",
    chainType: "Rococo & Parachain",
    rpcUrl: "wss://rococo-rpc.polkadot.io",
    nativeCurrency: {
      name: "ROC",
      symbol: "ROC",
      decimals: 12,
    },
    prefix: 42,
    type: "substrate",
    threshold: 20,
    image: "/images/westend.svg",
  },
  {
    name: "Parachain Hades testnet",
    chainId: "",
    chainType: "Westend & Parachain",
    url: "nodle",
    rpcUrl:
      "wss://node-6957502816543653888.lh.onfinality.io/ws?apikey=09b04494-3139-4b57-a5d1-e1c4c18748ce",
    nativeCurrency: {
      name: "notNODL",
      symbol: "notNODL",
      decimals: 11,
    },
    prefix: 37,
    type: "substrate",
    threshold: 20,
    image: "/images/westend.svg",
  },
  {
    name: "Beresheet",
    url: "beresheet",
    chainId: "",
    chainType: "Solochain",
    rpcUrl: "wss://beresheet.jelliedowl.net",
    nativeCurrency: {
      name: "tEDG",
      symbol: "tEDG",
      decimals: 18,
    },
    prefix: 7,
    type: "substrate",
    threshold: 20,
    image: "/images/westend.svg",
  },
  {
    name: "Bifrost",
    url: "bifrost",
    chainType: "Westend & Parachain",
    chainId: "49088",
    rpcUrl: "https://public-01.testnet.bifrostnetwork.com/rpc",
    nativeCurrency: {
      name: "BFC",
      symbol: "BFC",
      decimals: 18,
    },
    type: "evm",
    threshold: 20,
    image: "/images/westend.svg",
  },
  {
    name: "Beresheet BereEVM",
    url: "beresheet-bereevm",
    chainId: "2022",
    chainType: "Solochain",
    rpcUrl: "https://beresheet-evm.jelliedowl.net",
    nativeCurrency: {
      name: "tEDG",
      symbol: "tEDG",
      decimals: 18,
    },
    type: "evm",
    threshold: 20,
    image: "/images/westend.svg",
  },
  // {
  //   name: 'Tangle',
  //   url: 'tangle',
  //   chainId: '3799',
  //   chainType: 'Paseo & Parachain',
  //   rpcUrl: 'https://testnet-rpc.tangle.tools',
  //   nativeCurrency: {
  //     name: 'tTNT',
  //     symbol: 'tTNT',
  //     decimals: 18
  //   },
  //   type: 'evm'
  // },
  {
    name: "Moonbase Alpha",
    url: "moonbase-alpha",
    chainId: "1287",
    chainType: "Westend & Parachain",
    rpcUrl: "https://rpc.testnet.moonbeam.network",
    nativeCurrency: {
      name: "DEV",
      symbol: "DEV",
      decimals: 18,
    },
    type: "evm",
    threshold: 20,
    image: "/images/westend.svg",
  },
];
