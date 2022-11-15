import { useWeb3React } from "@web3-react/core";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { MaxUint256 } from "@ethersproject/constants";
import TweenOne, { AnimObjectOrArray } from "rc-tween-one";
import Children from "rc-tween-one/lib/plugin/ChildrenPlugin";
import { FC, useEffect, useState } from "react";
import {
  useERC20WithoutProvider,
  useWinContract,
} from "../../contracts/getContracts";
import {
  NESTPoolAddress,
  NESTTokenAddress,
  NESTWinAddress,
} from "../../libs/addresses";
import "./styles";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment } from "@mui/material";
import { BigNumber } from "ethers";
import { downTime, formatWinNum } from "../../libs/utils";
import {
  TransactionType,
  usePendingTransactions,
} from "../../libs/hooks/useTransactionReceipt";

type ClaimType = {
  blockNumber: BigNumber;
  allValue: BigNumber;
  endTime: number;
};

const Win: FC = () => {
  const className = "win";
  const { chainId, account, library } = useWeb3React();
  const { addPendingList, isTransactionPending, pendingList } =
    usePendingTransactions();
  const [nestAllow, setNestAllow] = useState<BigNumber>(BigNumber.from("0"));
  const [approveDis, setApproveDis] = useState(false);
  const [claimDis, setClaimDis] = useState(false);
  const [rollDis, setRollDis] = useState(false);
  const [timeString, setTimeString] = useState<string>();
  const [nestInput, setNestInput] = useState("1");
  const [claimType, setClaimType] = useState<ClaimType>();
  const [multiplierInput, setMultiplierInput] = useState("1.1");
  const [claimArray, setClaimArray] = useState<Array<BigNumber>>([]);
  const [animation, setAnimation] = useState<AnimObjectOrArray>();
  TweenOne.plugins.push(Children);
  const nestToken = useERC20WithoutProvider(NESTTokenAddress);
  const winContract = useWinContract();

  // update pool balance
  useEffect(() => {
    const getPoolBalance = async () => {
      if (!nestToken) {
        return;
      }
      const balance = await nestToken.balanceOf(NESTPoolAddress[chainId ?? 56]);

      setAnimation({
        Children: {
          value: parseFloat(formatUnits(balance, 18)),
          floatLength: 2,
          formatMoney: true,
        },
        duration: 1000,
      });
    };
    getPoolBalance();
    const timeInterval = setInterval(getPoolBalance, 10000);
    return () => {
      clearInterval(timeInterval);
    };
  }, [chainId, nestToken]);
  // approve
  useEffect(() => {
    if (
      !chainId ||
      !account ||
      !library ||
      isTransactionPending(TransactionType.approve)
    ) {
      return;
    }
    if (!nestToken) {
      setNestAllow(BigNumber.from("0"));
      return;
    }
    const getAllow = async () => {
      const allowance = await nestToken.allowance(
        account,
        NESTWinAddress[chainId]
      );
      setNestAllow(allowance);
    };
    getAllow();
  }, [account, chainId, library, nestToken, isTransactionPending, pendingList]);
  useEffect(() => {
    setApproveDis(isTransactionPending(TransactionType.approve));
    setClaimDis(isTransactionPending(TransactionType.claim));
  }, [isTransactionPending, pendingList]);
  // claimArray
  useEffect(() => {
    if (!account || !winContract) {
      return;
    }
    const getClaimList = async () => {
      const list = await winContract.find44("0", "200", "200", account);
      const claimList = list.filter((item: any) => {
        return parseInt(item[5].toString()) > 0;
      });
      if (claimList.length === 0) {
        setClaimArray([]);
        setClaimType(undefined);
      } else {
        console.log(claimList);
        const allValue = claimList
          .map((item: any) => item[5])
          .reduce((pre: any, cur: any) => {
            console.log(pre, cur);
            return pre.add(cur);
          });
        const latestBlock = await library?.getBlockNumber();
        const endBlock = claimList[claimList.length - 1][4] + 256;
        const nowTime = Date.now() / 1000;
        var endTime: number;
        if (endBlock > latestBlock) {
          endTime = nowTime + (endBlock - latestBlock) * 3;
        } else {
          endTime = 0;
        }
        setClaimArray(claimList.map((item: any) => item[0]));
        setClaimType({
          blockNumber: claimList[claimList.length - 1][4],
          allValue: allValue,
          endTime: endTime,
        });
      }
    };
    getClaimList();
    const timeInterval = setInterval(getClaimList, 10000);
    return () => {
      clearInterval(timeInterval);
    };
  }, [account, library, winContract, pendingList]);
  // time
  useEffect(() => {
    if (claimType) {
      const getTime = () => {
        if (claimType.endTime > 0) {
          const endTime = claimType.endTime;
          const nowTime = Date.now() / 1000;
          if (nowTime > endTime) {
            // end
            setTimeString("---");
          } else {
            // show
            setTimeString(downTime(endTime - nowTime));
          }
        }
      };
      getTime();
      const time = setInterval(() => {
        getTime();
      }, 1000);
      return () => {
        clearTimeout(time);
      };
    }
  }, [claimType]);
  // check
  const checkAllow = () => {
    if (nestInput === "") {
      return true;
    }
    const inputValue = parseUnits(nestInput, 18);
    return nestAllow.gte(inputValue.add(inputValue.div(BigNumber.from("100"))))
      ? true
      : false;
  };
  const checkBetError = () => {
    if (nestInput === "") {
      return true;
    }
    if (parseFloat(nestInput) > 5000 || parseFloat(nestInput) < 1) {
      return true;
    } else {
      return false;
    }
  };
  const checkMultiplierError = () => {
    if (multiplierInput === "") {
      return true;
    }
    if (
      parseFloat(multiplierInput) > 100 ||
      parseFloat(multiplierInput) < 1.1
    ) {
      return true;
    } else {
      return false;
    }
  };
  const checkApproveButton = () => {
    return approveDis;
  };
  const checkRollButton = () => {
    if (rollDis || checkBetError() || checkMultiplierError()) {
      return true;
    } else {
      return false;
    }
  };
  const checkClaimButton = () => {
    if (claimDis || claimArray.length === 0) {
      return true;
    } else {
      return false;
    }
  };
  const winChance = (100 / parseFloat(multiplierInput)).toFixed(2);
  const payout = (parseFloat(multiplierInput) * parseFloat(nestInput)).toFixed(
    2
  );
  // transaction
  const approve = () => {
    if (!nestToken || !winContract || checkApproveButton()) {
      return;
    }
    setApproveDis(true);
    nestToken
      .approve(winContract.address, MaxUint256)
      .catch((error: any) => {
        setApproveDis(false);
        console.log(error);
      })
      .then((res: any) => {
        addPendingList({ hash: res.hash, type: TransactionType.approve });
        console.log(res);
      });
  };
  const roll = () => {
    if (!winContract || checkRollButton()) {
      return;
    }
    setRollDis(true);
    console.log(parseUnits(nestInput, 4).toString())
    console.log(parseUnits(multiplierInput, 4).toString())
    winContract
      .roll44(parseUnits(nestInput, 4), parseUnits(multiplierInput, 4))
      .catch((error: any) => {
        setRollDis(false);
        console.log(error);
      })
      .then((res: any) => {
        setRollDis(false);
        console.log(res);
      });
  };
  const claim = async () => {
    if (!winContract || checkClaimButton()) {
      return;
    }
    setClaimDis(true);
    winContract
      .batchClaim44(claimArray)
      .catch((error: any) => {
        setClaimDis(false);
        console.log(error);
      })
      .then((res: any) => {
        addPendingList({ hash: res.hash, type: TransactionType.claim });
        console.log(res);
      });
  };
  return (
    <div className={className}>
      <div className={"pool-balance"}>
        <div>
          <h1>NEST VAULT</h1>
          <TweenOne className={"pool-balance-num"} animation={animation} />
        </div>
      </div>
      <div className={`${className}-do`}>
        <div className={`${className}-do-input`}>
          <TextField
            id="outlined-basic"
            label="Multiplier"
            variant="outlined"
            value={multiplierInput}
            onChange={(e) => setMultiplierInput(formatWinNum(e.target.value))}
            error={checkMultiplierError()}
            helperText={checkMultiplierError() ? "Limitation: 1.1-100" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">X</InputAdornment>
              ),
            }}
          />
          <TextField
            id="outlined-basic"
            label="Bet"
            variant="outlined"
            value={nestInput}
            onChange={(e) => setNestInput(formatWinNum(e.target.value))}
            error={checkBetError()}
            helperText={checkBetError() ? "Limitation: 1-5000" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">NEST</InputAdornment>
              ),
            }}
          />
        </div>
        <div
          className={`${className}-do-winNum`}
        >{`${winChance}% win ${payout} NEST`}</div>
        {checkAllow() ? (
          <div>
            <Button
              className="rollButton"
              variant="contained"
              onClick={roll}
              disabled={checkRollButton()}
            >
              Roll
            </Button>
            <Button
              className="claimButton"
              variant="contained"
              onClick={claim}
              disabled={checkClaimButton()}
            >
              {claimType
                ? `Claim ${formatUnits(
                    claimType.allValue,
                    18
                  )} NEST, left ${timeString}`
                : `Claim`}
            </Button>
          </div>
        ) : (
          <Button
            className="rollButton"
            variant="contained"
            onClick={approve}
            disabled={checkApproveButton()}
          >
            Approve
          </Button>
        )}
      </div>
    </div>
  );
};

export default Win;
