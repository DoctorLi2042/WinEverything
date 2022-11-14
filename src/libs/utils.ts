export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const NULL_NUM = "---";

export function showEllipsisAddress(address: string): string {
  return (
    address.substring(0, 6) +
    "...." +
    address.substring(address.length - 4, address.length)
  );
}

export function formatWinNum(value: string): string {
  return value
    .replace(/[^\d.]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(".", "$#$")
    .replace(/\./g, "")
    .replace("$#$", ".")
    .replace(/^(-)*(\d+)\.(\d\d).*$/, "$1$2.$3")
    .replace(/^\./g, "");
}

export const downTime = (num: number) => {
  const mins = parseInt((num / 60).toString());
  const seconds = parseInt((num - mins * 60).toString());
  return `${mins}m ${seconds}s`;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function waitRandom(min: number, max: number): Promise<void> {
  return wait(min + Math.round(Math.random() * Math.max(0, max - min)));
}

/**
 * This error is thrown if the function is cancelled before completing
 */
class CancelledError extends Error {
  public isCancelledError: true = true;
  constructor() {
    super("Cancelled");
  }
}

/**
 * Throw this error if the function should retry
 */
export class RetryAbleError extends Error {
  public isRetryAbleError: true = true;
}

export interface RetryOptions {
  n: number;
  minWait: number;
  maxWait: number;
}

export const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {
  56: { n: 10, minWait: 250, maxWait: 1000 },
  97: { n: 10, minWait: 250, maxWait: 1000 },
};

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param n how many times to retry
 * @param minWait min wait between retries in ms
 * @param maxWait max wait between retries in ms
 */
export function retry<T>(
  fn: () => Promise<T>,
  { n, minWait, maxWait }: RetryOptions
): { promise: Promise<T>; cancel: () => void } {
  let completed = false;
  let rejectCancelled: (error: Error) => void;
  const promise = new Promise<T>(async (resolve, reject) => {
    rejectCancelled = reject;
    while (true) {
      let result: T;
      try {
        result = await fn();
        if (!completed) {
          resolve(result);
          completed = true;
        }
        break;
      } catch (error: any) {
        if (completed) {
          break;
        }
        if (n <= 0 || !error.isRetryAbleError) {
          reject(error);
          completed = true;
          break;
        }
        n--;
      }
      await waitRandom(minWait, maxWait);
    }
  });
  return {
    promise,
    cancel: () => {
      if (completed) return;
      completed = true;
      rejectCancelled(new CancelledError());
    },
  };
}
