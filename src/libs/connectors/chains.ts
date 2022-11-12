type Chain = {
  name: string;
  chainId: number;
  tokenDecimals: number;
  rpc: Array<string>;
  infoURL: string;
};

export const BNBTest = {
  name: "BNBTest",
  chainId: 97,
  tokenDecimals: 18,
  rpc: [`https://data-seed-prebsc-2-s1.binance.org:8545/`],
  infoURL: "https://testnet.bscscan.com/",
};

export const BNB = {
  name: "BNB",
  chainId: 56,
  tokenDecimals: 18,
  rpc: [`https://bsc-dataseed1.defibit.io/`],
  infoURL: "https://bscscan.com/",
};

export const SupportedChains: Array<Chain> = [BNBTest,BNB];
