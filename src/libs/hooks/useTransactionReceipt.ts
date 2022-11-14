import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import { retry, RETRY_OPTIONS_BY_CHAIN_ID, RetryAbleError } from "../utils";

export enum TransactionType {
  approve = 1,
  roll = 2,
  claim = 3,
}

export type TransactionInfo = {
  hash: string;
  type: TransactionType;
};

export const usePendingTransactions = () => {
  const { chainId, library } = useWeb3React();
  const [pendingList, setPendingList] = useState<Array<TransactionInfo>>([]);

  const addPendingList = (info: TransactionInfo) => {
    setPendingList([...pendingList, info]);
  };

  const removePendingList = useCallback(
    (hash: string) => {
      const result = pendingList.filter(
        (item) => item.hash.toLocaleLowerCase() !== hash.toLocaleLowerCase()
      );
      setPendingList(result);
    },
    [pendingList]
  );

  const isTransactionPending = useCallback(
    (type: TransactionType) => {
      const result = pendingList.filter((item) => type === item.type);
      return result.length === 0 ? false : true;
    },
    [pendingList]
  );

  const getReceipt = useCallback(
    (hash: string) => {
      if (!library || !chainId) throw new Error("No provider or chainId");
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId];
      return retry(
        () =>
          library.getTransactionReceipt(hash).then((receipt: any) => {
            if (receipt === null) {
              console.debug(`Retrying tranasaction receipt for ${hash}`);
              throw new RetryAbleError();
            }
            return receipt;
          }),
        retryOptions
      );
    },
    [chainId, library]
  );

  useEffect(() => {
    if (!chainId || !library) return;
    const cancels = pendingList.map((info) => {
      const { promise, cancel } = getReceipt(info.hash);
      promise
        .then((receipt) => {
          if (receipt) {
            removePendingList(info.hash);
          }
        })
        .catch((error) => {
          if (!error.isCancelledError) {
            console.warn(
              `Failed to get transaction receipt for ${info.hash}`,
              error
            );
          }
        });
      return cancel;
    });
    return () => {
      cancels.forEach((cancel) => cancel());
    };
  }, [chainId, getReceipt, library, pendingList, removePendingList]);

  return { addPendingList, pendingList, isTransactionPending };
};
