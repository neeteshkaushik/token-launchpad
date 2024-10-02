import {
  getAccount,
  getMint,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
  useConnection,
  useWallet,
  WalletContext,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useContext, useEffect } from "react";
import TokenCard from "./TokenCard";
import { Flex } from "antd";

const MyTokens = () => {
  const wallet = useWallet();
  const { connected } = useContext(WalletContext);
  const { connection } = useConnection();
  const [tokens, setTokens] = React.useState([]);
  let getAccounts = async () => {
    const splTokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_2022_PROGRAM_ID }
    );
    const processedAccounts = splTokenAccounts.value.map(async (account) => {
      const tokenAccountAddress = account.pubkey.toBase58();
      const tokenAmount = account.account.data.parsed.info.tokenAmount.uiAmount;
      const mintAddress = account.account.data.parsed.info.mint;
      const tokenMetadata = await getTokenMetadata(
        connection,
        new PublicKey(mintAddress)
      );
      const uriDetails = await fetch(tokenMetadata.uri);
      const metadata = await uriDetails.json();
      return {
        tokenAccountAddress,
        tokenAmount,
        mintAddress,
        tokenName: tokenMetadata.name,
        tokenSymbol: tokenMetadata.symbol,
        imageUrl: metadata.image,
      };
    });
    const tokens = await Promise.all(processedAccounts);
    setTokens(tokens);
  };
  useEffect(() => {
    if (connected) getAccounts();
  }, [connected]);
  return (
    <div>
      <h1>My Tokens</h1>
      <Flex gap={"large"} wrap={true}>
        {tokens.map((token, index) => {
          return (
            <div key={index}>
              <TokenCard {...token} />
            </div>
          );
        })}
      </Flex>
    </div>
  );
};

export default MyTokens;
