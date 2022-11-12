import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import { useState } from "react";

export enum TransactionState {
  Pending = 0,
  Success = 1,
  Fail = 2,
  Revert = 3,
}

export const useTransactionReceipt = () => {
  const { library } = useWeb3React();
  const [transactionState, setTransactionState] = useState(
    TransactionState.Pending
  );

  const [hash, setHash] = useState<string>();
  useEffect(() => {
    const getReceipt = async () => {
      if (!hash) {
        return;
      }
      console.log(222)
      const rec = await library?.getTransactionReceipt(hash);
      if (typeof rec?.status !== "undefined") {
        const status = rec.status
          ? TransactionState.Success
          : TransactionState.Fail;
        setTransactionState(status);
        setHash(undefined);
      }
    };
    const time = setInterval(getReceipt, 3000);
    return () => {
      clearTimeout(time);
    };
  }, [hash, library]);

  return { transactionState, setHash};
};
