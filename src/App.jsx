import "./App.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import Header from "./components/Header";
import TokenLaunchPad from "./components/TokenLaunchPad";
import MyTokens from "./components/MyTokens";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Airdrop from "./components/Airdrop";

function App() {
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Router>
              <Header />
              <Routes>
                <Route path="/" element={<TokenLaunchPad />} />
                <Route path="/myTokens" element={<MyTokens />} />
                <Route path="/airdrop" element={<Airdrop />} />
              </Routes>
            </Router>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;