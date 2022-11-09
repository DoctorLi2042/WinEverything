import { Contract } from "@ethersproject/contracts";
import { getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import ERC20ABI from "./ABI/ERC20.json";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useMemo } from "react";
import { AddressesType } from "../libs/addresses";
import { ZERO_ADDRESS } from "../libs/utils";

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

export function getERC20Contract(
  address: string,
  provider: Web3Provider,
  account: string
): Contract | null {
  return getContract(address, ERC20ABI, provider, account);
}
