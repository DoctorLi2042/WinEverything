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
  return `${mins}m ${seconds}s`
};
