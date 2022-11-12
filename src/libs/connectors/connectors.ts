import { InjectedConnector } from "@web3-react/injected-connector";
import { SupportedChains } from "./chains";

export const injected = new InjectedConnector({
  supportedChainIds: SupportedChains.map((chain) => chain.chainId),
});
