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
        <div className="bg-yellow-600 text-yellow-100 px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold">
          <p className="flex items-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Please connect your wallet to create a token
          </p>
        </div>
      )}
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <Link to="/" className="text-gray-300 hover:text-white transition duration-300 text-sm sm:text-base">
              Home
            </Link>
            {connected && (
              <>
                <Link to="/myTokens" className="text-gray-300 hover:text-white transition duration-300 text-sm sm:text-base">
                  My Tokens
                </Link>
                <Link to="/airdrop" className="text-gray-300 hover:text-white transition duration-300 text-sm sm:text-base">
                  Airdrop
                </Link>
              </>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-0">Token Launchpad</div>
          <div className="flex items-center space-x-2">
            <WalletDisconnectButton className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 rounded transition duration-300 text-xs sm:text-sm" />
            <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 rounded transition duration-300 text-xs sm:text-sm" />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;