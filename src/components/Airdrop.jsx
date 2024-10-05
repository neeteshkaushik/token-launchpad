import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { notification } from 'antd';

const Airdrop = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lastAirdropTime, setLastAirdropTime] = useState(0);

  useEffect(() => {
    const storedTime = localStorage.getItem('lastAirdropTime');
    if (storedTime) {
      setLastAirdropTime(parseInt(storedTime));
    }
  }, []);

  const handleAirdrop = async () => {
    if (!publicKey) {
      notification.error({
        message: 'Wallet not connected',
        description: 'Please connect your wallet to request an airdrop.',
      });
      return;
    }

    const currentTime = Date.now();
    const hoursSinceLastAirdrop = (currentTime - lastAirdropTime) / (1000 * 60 * 60);

    if (hoursSinceLastAirdrop < 1) {
      notification.warning({
        message: 'Airdrop limit reached',
        description: 'You can only request an airdrop once per hour.',
      });
      return;
    }

    setLoading(true);
    try {
      const signature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      notification.success({
        message: 'Airdrop successful',
        description: `${amount} SOL has been airdropped to your wallet.`,
      });
      setLastAirdropTime(currentTime);
      localStorage.setItem('lastAirdropTime', currentTime.toString());
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      notification.error({
        message: 'Airdrop failed',
        description: 'There was an error requesting the airdrop. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-white">Request SOL Airdrop</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="amount" className="text-white">Amount (max 2 SOL):</label>
            <input
              id="amount"
              type="number"
              min="0.1"
              max="2"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(Math.min(2, Math.max(0.1, parseFloat(e.target.value))))}
              className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleAirdrop}
            disabled={loading || !publicKey}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-sm sm:text-base ${
              loading || !publicKey ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Requesting...' : 'Request Airdrop'}
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Max 2 SOL per hour can be requested.
        </p>
      </div>
    </div>
  );
};

export default Airdrop;