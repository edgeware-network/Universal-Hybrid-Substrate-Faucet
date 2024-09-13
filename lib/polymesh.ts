import { typesBundle } from '@polymeshassociation/polymesh-types';
import type  { Option } from  "@polkadot/types-codec";
import { CddStatus, PolymeshPrimitivesSecondaryKeyKeyRecord } from "@/types/polymesh";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { DisburseChain, loadFaucetAccount } from './utils';
import { AccountInfo } from '@polkadot/types/interfaces';

export async function PolyxFaucet(chain: DisburseChain) {
  console.log("Connecting to Polymesh Testnet...");

  const wsProvider = new WsProvider(chain.rpc);
  const api = await ApiPromise.create({ provider: wsProvider, typesBundle, noInitWarn: true });
  const keyRecords = (await api.query.identity.keyRecords(chain.address)) as unknown as Option<PolymeshPrimitivesSecondaryKeyKeyRecord>;

  if (keyRecords.isNone) {
    const tx = api.tx.identity.cddRegisterDidWithCdd(chain.address, [], null);
    const hash = await tx.signAndSend(loadFaucetAccount().substrateAccount);

    return `${hash}`;

  } else {

    let did;
    const unwrappedRecord = keyRecords.unwrap();
    if (unwrappedRecord.isPrimaryKey) {
      did = unwrappedRecord.asPrimaryKey;
    } else if (unwrappedRecord.isSecondaryKey) {
      did = unwrappedRecord.asSecondaryKey[0];
    } else if (unwrappedRecord.isMultiSigSignerKey) {
      throw new Error('Multisig signer keys cannot receive POLYX tokens');
    };
  
    if (!did) throw new Error('DID not found in key records');
    console.log(`DID: ${did.toString()}`);
  
    const cddValidity = (await api.call.identityApi.isIdentityHasValidCdd(did, undefined)) as CddStatus;
    console.log(`CDD Validity: ${cddValidity.isOk}`);
  
    if (cddValidity.isOk) {
      const addCddClaimTx = api.tx.identity.addClaim(
        did,
        { CustomerDueDiligence: null },
        null,
      );
      const hash = await addCddClaimTx.signAndSend(loadFaucetAccount().substrateAccount);
      console.log(`Claim added: ${hash}`);
    };
  
    const transferAmount = chain.amount * 10 ** chain.nativeCurrency.decimals;
    const faucetBalance = Number((await api.query.system.account(process.env.FAUCET_SUBSTRATE_PUBLIC_KEY!) as AccountInfo).data.free.toString());
    console.log(`${chain.chain} -> balance: ${faucetBalance} amount: ${transferAmount}`);

    if (faucetBalance > 0 && faucetBalance > transferAmount) {
      const nonce = (await api.rpc.system.accountNextIndex(process.env.FAUCET_SUBSTRATE_PUBLIC_KEY!));
      console.log(`Nonce: ${nonce}`);
      const transferPolyxTx = api.tx.balances.transfer(chain.address, transferAmount.toString());
      const transferHash = await transferPolyxTx.signAndSend(loadFaucetAccount().substrateAccount, { nonce, withSignedTransaction: true });
      
      console.log(`Transfer: ${transferHash}`);
  
      return `${transferHash}`;
  
    } else {
      return -1;
  
    };
  };
};