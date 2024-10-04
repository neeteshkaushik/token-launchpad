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

const MyTokens = () => {
  const wallet = useWallet();
  const { connected } = useContext(WalletContext);
  const { connection } = useConnection();
  const [tokens, setTokens] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  let getAccounts = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) getAccounts();
  }, [connected]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">My Tokens</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tokens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token, index) => (
            <TokenCard key={index} {...token} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No tokens found.</p>
      )}
    </div>
  );
};

export default MyTokens;