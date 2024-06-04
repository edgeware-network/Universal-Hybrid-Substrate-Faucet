const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function getLowestLatencyRpc(rpcs) {
  const latencies = await Promise.all(rpcs.map(async (rpc) => {
    try {
      const start = Date.now();
      await axios.get(rpc);
      return { rpc, latency: Date.now() - start };
    } catch (e) {
      return { rpc, latency: Infinity };
    }
  }));
  latencies.sort((a, b) => a.latency - b.latency);
  return latencies[0].rpc;
}

async function updateConfig(thirdPartyFilePath, configFilePath, chainType, addMissing = false) {
  const thirdPartyFile = require(path.resolve(thirdPartyFilePath));
  const configFile = require(path.resolve(configFilePath));

  const chainsToUpdate = thirdPartyFile.testChains.filter(chain => {
    const providers = Object.values(chain.providers).filter(p => !p.startsWith('//'));
    return providers.length > 0;
  });

  for (const chain of chainsToUpdate) {
    const { info: url, text: name, providers, ui } = chain;
    const rpcs = Object.values(providers).filter(p => !p.startsWith('//'));
    const rpcUrl = await getLowestLatencyRpc(rpcs);
    const chainInfo = await axios.get(`${rpcUrl}/api/chainInfo`);
    const { prefix, tokenDecimals: decimals, tokenSymbol: symbol, tokenName: nativeCurrencyName } = chainInfo.data;

    const chainConfig = {
      name,
      url,
      chainType,
      chainId: '',
      rpcUrl,
      nativeCurrency: {
        name: nativeCurrencyName,
        symbol,
        decimals,
      },
      prefix,
      type: 'substrate',
      threshold: '',
    };

    const index = configFile.chains.findIndex(c => c.url === url);
    if (index !== -1) {
      configFile.chains[index] = chainConfig;
    } else if (addMissing) {
      configFile.chains.push(chainConfig);
    }
  }

  fs.writeFileSync(configFilePath, JSON.stringify(configFile, null, 2));
}

const [thirdPartyFilePath, configFilePath, chainType, addMissingArg] = process.argv.slice(2);
const addMissing = addMissingArg === 'true';
updateConfig(thirdPartyFilePath, configFilePath, chainType, addMissing);
