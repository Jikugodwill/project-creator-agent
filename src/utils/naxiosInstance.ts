import { NETWORK, SOCIAL_DB_CONTRACT_ID } from "@/common/constants";
import naxios from "@wpdas/naxios";

export const RPC_NODE_URL = `https://${
  NETWORK === "mainnet" ? "free.rpc.fastnear.com" : "test.rpc.fastnear.com"
}`;

export const naxiosInstance = new naxios({
  rpcNodeUrl: RPC_NODE_URL,
  contractId: SOCIAL_DB_CONTRACT_ID,
  network: NETWORK,
  //   walletSelectorModules: [
  //     setupMyNearWallet(),
  //     setupSender(),
  //     setupHereWallet(),
  //     setupMeteorWallet(),
  //     setupLedger(),
  //     setupEthereumWallets({
  //       wagmiConfig: wagmiConfig as EthereumWalletsParams["wagmiConfig"],
  //       web3Modal: web3Modal as EthereumWalletsParams["web3Modal"],
  //       alwaysOnboardDuringSignIn: true,
  //     }),
  //     setupNearMobileWallet(),
  //     setupNightly(),
  //     setupBitgetWallet(),
  //     setupCoin98Wallet(),
  //     setupMathWallet(),
  //     setupMintbaseWallet(),
  //     setupBitteWallet(),
  //     setupNearFi(),
  //     setupWelldoneWallet(),
  //     setupXDEFI(),
  //     // INFO: This is breaking the app because it needs to access 'fs' module which is not present on the client side
  //     // setupNearSnap(),
  //     setupNarwallets(),
  //     setupRamperWallet(),
  //     setupNeth({
  //       gas: FULL_TGAS,
  //       bundle: false,
  //     }),
  //   ],
});
