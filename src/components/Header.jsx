import { WalletContext } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useContext } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const { connected } = useContext(WalletContext);

  return (
    <div className="bg-gray-800 text-white">
      {!connected && (
        <div className="bg-yellow-600 text-yellow-100 px-4 py-3 text-sm font-semibold">
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Please connect your wallet in order to create a token
          </p>
        </div>
      )}
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white transition duration-300">
              Home
            </Link>
            {connected && (
              <Link to="/myTokens" className="text-gray-300 hover:text-white transition duration-300">
                My Tokens
              </Link>
            )}
          </div>
          <div className="text-2xl font-bold text-white">Token Launchpad</div>
          <div className="flex items-center space-x-2">
            <WalletDisconnectButton className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300" />
            <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300" />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;