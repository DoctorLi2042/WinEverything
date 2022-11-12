import { Button, Snackbar } from "@mui/material";
import { FC, useState } from "react";
import { injected } from "../../libs/connectors/connectors";
import { useWeb3 } from "../../libs/connectors/connectHooks";
import "./styles";
import { useWeb3React } from "@web3-react/core";
import { showEllipsisAddress } from "../../libs/utils";
import { SupportedChains } from "../../libs/connectors/chains";

const Header: FC = () => {
  const { account, activate, chainId } = useWeb3React();
  const { setActivatingConnector } = useWeb3();
  const [shoWSnackbar, setShoWSnackbar] = useState(false);
  const nowChain = SupportedChains.filter((e) => {return chainId === e.chainId})
  return (
    <header>
      <div className="hold"></div>
      <h1>Win everything<span>{nowChain.length > 0 ? nowChain[0].name : ''}</span></h1>
      <Button
        className="connect"
        variant="text"
        onClick={() => {
          if (!account) {
            setActivatingConnector(injected);
            activate(injected, undefined, true).catch((error) => {
              if (error) {
                console.log(error)
                setShoWSnackbar(true);
                setActivatingConnector(undefined);
              }
            });
          }
        }}
      >
        {account ? showEllipsisAddress(account) : "Connect wallet"}
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={shoWSnackbar}
        onClose={() => setShoWSnackbar(false)}
        message="This network is not supported, please switch the BNB network"
        key={"topcenter"}
      />
    </header>
  );
};

export default Header;
