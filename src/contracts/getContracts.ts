import { Contract } from "@ethersproject/contracts";
import { getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import ERC20ABI from "./ABI/ERC20.json";
import WinABI from "./ABI/Win.json";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useMemo } from "react";
import { AddressesType, NESTWinAddress } from "../libs/addresses";
import { ZERO_ADDRESS } from "../libs/utils";
import { ethers } from "ethers";
import { SupportedChains } from "../libs/connectors/chains";

function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

function getSigner(provider: Web3Provider, account: string): JsonRpcSigner {
  return provider.getSigner(account).connectUnchecked();
}

export function getContract(
  address: string,
  ABI: any,
  provider: Web3Provider,
  account: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw new Error(`${address} is wrong!!`);
  }
  return new Contract(address, ABI, getSigner(provider, account));
}

export function useContract(
  addresses: AddressesType,
  ABI: any
): Contract | null {
  const { library, account, chainId } = useWeb3React();
  return useMemo(() => {
    if (
      !library ||
      !(library instanceof Web3Provider) ||
      !account ||
      !ABI ||
      !chainId ||
      addresses[chainId] === ZERO_ADDRESS
    )
      return null;
    try {
      return getContract(addresses[chainId], ABI, library, account);
    } catch (error) {
      console.error("can not useContract", error);
      return null;
    }
  }, [addresses, ABI, library, account, chainId]);
}

export function useERC20WithoutProvider(
  addresses: AddressesType
): Contract | null {
  const { library, account, chainId } = useWeb3React();
  return useMemo(() => {
    if (
      !library ||
      !account ||
      !chainId ||
      addresses[chainId] === ZERO_ADDRESS
    ) {
      try {
        const nowChain = SupportedChains.filter((e) => {
          if (chainId) {
            return e.chainId === chainId;
          } else {
            return e.chainId === 56;
          }
        });
        const provider = ethers.getDefaultProvider(nowChain[0].rpc[0]);
        return new Contract(addresses[chainId ?? 56], ERC20ABI, provider);
      } catch (error) {
        console.error("can not useContract", error);
        return null;
      }
    }
    try {
      return getContract(addresses[chainId], ERC20ABI, library, account);
    } catch (error) {
      console.error("can not useContract", error);
      return null;
    }
  }, [account, addresses, chainId, library]);
}

export function getERC20Contract(
  address: string,
  provider: Web3Provider,
  account: string
): Contract | null {
  return getContract(address, ERC20ABI, provider, account);
}

export function useWinContract(): Contract | null {
  return useContract(NESTWinAddress, WinABI)
}
