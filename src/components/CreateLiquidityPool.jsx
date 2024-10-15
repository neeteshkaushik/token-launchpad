import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getMint, getTokenMetadata, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { notification } from 'antd';
import { createPoolLiquidityPool, fetchCPMMPoolInfo, fetchPoolByMints, fetchRPCPoolInfo } from '../utils/raydium.functions';

const CreateLiquidityPool = () => {
  const { connection } = useConnection();
  const walletContext = useWallet();
  const [userTokens, setUserTokens] = useState([]);
  const [selectedTokenA, setSelectedTokenA] = useState('');
  const [selectedTokenB, setSelectedTokenB] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletContext.publicKey) {
      fetchUserTokens();
    }
  }, [walletContext.publicKey, connection]);

  const fetchUserTokens = async () => {
    if (!walletContext.publicKey) return;

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(walletContext.publicKey);
      const SOL_MINT = NATIVE_MINT
      const solToken = {
        mint: SOL_MINT.toBase58(),
        balance: solBalance / LAMPORTS_PER_SOL,
        symbol: 'SOL',
        name: 'Solana',
        image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        programId: TOKEN_PROGRAM_ID,
      };

      // Fetch SPL tokens (including TOKEN_2022)
      let tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletContext.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
      let token2022Accounts = await connection.getParsedTokenAccountsByOwner(walletContext.publicKey, {
        programId: TOKEN_2022_PROGRAM_ID,
      });

      let allTokenAccounts = [
        ...tokenAccounts.value.map(token => ({ ...token, programId: TOKEN_PROGRAM_ID })),
        ...token2022Accounts.value.map(token => ({ ...token, programId: TOKEN_2022_PROGRAM_ID }))
      ];
      allTokenAccounts = await Promise.all(allTokenAccounts.map(async token => {
        const mintInfo = await getMint(connection, new PublicKey(token.account.data.parsed.info.mint), 'confirmed', token.programId);
        console.log(mintInfo)
        return mintInfo.mintAuthority && mintInfo.mintAuthority.toBase58() !== '7rQ1QFNosMkUCuh7Z7fPbTHvh73b68sQYdirycEzJVuw' ? token : null;
      }));
      allTokenAccounts = allTokenAccounts.filter(token => token !== null);
      console.log(allTokenAccounts);

      const tokensPromises = allTokenAccounts.map(async (accountInfo) => {
        const mintAddress = accountInfo.account.data.parsed.info.mint;
        const balance = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;

        if (balance === 0) return null; // Skip tokens with zero balance

        try {
          let tokenMetadata;
          if (accountInfo.programId === TOKEN_2022_PROGRAM_ID) {
            tokenMetadata = await getTokenMetadata(
              connection,
              new PublicKey(mintAddress),
              'confirmed',
              accountInfo.programId
            );
            const uriDetails = await fetch(tokenMetadata.uri);
            const metadata = await uriDetails.json();
            return {
              mint: mintAddress,
              balance: balance,
              symbol: metadata.symbol,
              name: metadata.name,
              image: metadata.image,
              programId: accountInfo.programId,
            };
          } else {
            // For TOKEN_PROGRAM_ID, use a fallback method or external API to get token info
            // This is a placeholder, you might want to use a token list API or other method
            return {
              mint: mintAddress,
              balance: balance,
              symbol: 'Unknown',
              name: `Token ${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`,
              image: '',
              programId: accountInfo.programId,
            };
          }
        } catch (error) {
          console.error(`Error fetching metadata for token ${mintAddress}:`, error);
          return {
            mint: mintAddress,
            balance: balance,
            symbol: 'Unknown',
            name: `Token ${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`,
            image: '',
          };
        }
      });

      const tokens = await Promise.all(tokensPromises);
      const validTokens = [solToken, ...tokens.filter(token => token !== null)];
      setUserTokens(validTokens);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch user tokens. Please try again.',
      });
    }
  };

  const handleCreatePool = async () => {
    if (!selectedTokenA || !selectedTokenB || !amountA || !amountB) {
      notification.error({
        message: 'Incomplete Information',
        description: 'Please select tokens and enter amounts for both tokens.',
      });
      return;
    }

    const tokenA = userTokens.find(token => token.mint === selectedTokenA);
    const tokenB = userTokens.find(token => token.mint === selectedTokenB);

    if (!tokenA || !tokenB) {
      notification.error({
        message: 'Invalid Token Selection',
        description: 'Please select valid tokens from your wallet.',
      });
      return;
    }

    if (parseFloat(amountA) > tokenA.balance || parseFloat(amountB) > tokenB.balance) {
      notification.error({
        message: 'Insufficient Balance',
        description: 'You do not have enough balance for the selected amounts.',
      });
      return;
    }

    setLoading(true);console.log(`tokenA: ${selectedTokenA}, tokenB: ${selectedTokenB}, amountA: ${amountA}, amountB: ${amountB}`);
    try {
      await createPoolLiquidityPool(
        walletContext,
        new PublicKey(selectedTokenA),
        new PublicKey(selectedTokenB),
        parseFloat(amountA),
        parseFloat(amountB),
        tokenA.programId,
        tokenB.programId
      );
      notification.success({
        message: 'Success',
        description: 'Liquidity pool created successfully!',
      });
    } catch (error) {
      console.error('Error creating liquidity pool:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to create liquidity pool. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-white">Create Liquidity Pool</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Token A</label>
          <select
            value={selectedTokenA}
            onChange={(e) => setSelectedTokenA(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="">Select Token A</option>
            {userTokens.map((token) => (
              <option key={token.mint} value={token.mint} disabled={token.mint === selectedTokenB}>
                {token.name} ({token.symbol}) - Balance: {token.balance}
              </option>
            ))}
          </select>
        </div>
        {selectedTokenA && (
          <div className="flex items-center space-x-2">
            <img
              src={userTokens.find(t => t.mint === selectedTokenA)?.image}
              alt={userTokens.find(t => t.mint === selectedTokenA)?.symbol}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-white">{userTokens.find(t => t.mint === selectedTokenA)?.name}</span>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount A</label>
          <input
            type="number"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter amount for Token A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Token B</label>
          <select
            value={selectedTokenB}
            onChange={(e) => setSelectedTokenB(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="">Select Token B</option>
            {userTokens.map((token) => (
              <option key={token.mint} value={token.mint} disabled={token.mint === selectedTokenA}>
                {token.name} ({token.symbol}) - Balance: {token.balance}
              </option>
            ))}
          </select>
        </div>
        {selectedTokenB && (
          <div className="flex items-center space-x-2">
            <img
              src={userTokens.find(t => t.mint === selectedTokenB)?.image}
              alt={userTokens.find(t => t.mint === selectedTokenB)?.symbol}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-white">{userTokens.find(t => t.mint === selectedTokenB)?.name}</span>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount B</label>
          <input
            type="number"
            value={amountB}
            onChange={(e) => setAmountB(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter amount for Token B"
          />
        </div>
        <button
          onClick={handleCreatePool}
          disabled={loading}
          className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating Pool...' : 'Create Liquidity Pool'}
        </button>
      </div>
    </div>
  );
};

export default CreateLiquidityPool;
