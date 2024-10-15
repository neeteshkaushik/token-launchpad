import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex-grow container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Welcome to Token Launchpad</h1>
          <p className="text-xl text-gray-400">Your gateway to creating and managing tokens on the Solana blockchain</p>
        </header>

        <main className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-4">Create Tokens</h2>
            <p className="mb-4 text-gray-300">Launch your own token on Solana with just a few clicks. Customize your token's properties and start building your community.</p>
            <Link to="/create-token" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Get Started
            </Link>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-4">My Tokens</h2>
            <p className="mb-4 text-gray-300">View and manage your existing tokens on Solana. Track their performance and manage your portfolio.</p>
            <Link to="/myTokens" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              View Tokens
            </Link>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-4">Airdrop</h2>
            <p className="mb-4 text-gray-300">Create and manage airdrop campaigns for your tokens. Boost your token's visibility and community engagement.</p>
            <Link to="/airdrop" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Create Airdrop
            </Link>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-4">Create Liquidity Pool</h2>
            <p className="mb-4 text-gray-300">Create and manage liquidity pools for your tokens. Boost your token's tradability and accessibility.</p>
            <Link to="/create-pool" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Create Pool
            </Link>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-4">Token Swap</h2>
            <p className="mb-4 text-gray-300">Swap your tokens on Solana with ease. Connect your wallet and start swapping.</p>
            <Link to="/token-swap" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Get Started
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
