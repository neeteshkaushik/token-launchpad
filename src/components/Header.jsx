import { WalletContext } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Flex, Alert } from "antd";
import { useContext } from "react";
import { Link } from "react-router-dom";
const Header = () => {
  const { connected } = useContext(WalletContext);
  return (
    <>
      {!connected && (
        <Alert
          message="Please connect your wallet in order to create a token"
          type="warning"
          showIcon
          closable
        />
      )}
      <Flex justify="space-between" align="center" style={{ padding: "1rem" }}>
        <Flex gap={"large"}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            Home
          </Link>
          {connected && (
            <Link
              to="/myTokens"
              style={{ textDecoration: "none", color: "white" }}
            >
              Your Tokens
            </Link>
          )}
        </Flex>
        <Flex style={{ marginLeft: "13rem" }}>
          <h1>Token Launchpad</h1>
        </Flex>
        <Flex gap={"middle"}>
          <WalletDisconnectButton />
          <WalletMultiButton />
        </Flex>
      </Flex>
    </>
  );
};

export default Header;
