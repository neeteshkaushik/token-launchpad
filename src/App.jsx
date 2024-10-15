import React from 'react';
import "./App.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TokenLaunchPad from "./components/TokenLaunchPad";
import MyTokens from "./components/MyTokens";
import Airdrop from "./components/Airdrop";
import CreateLiquidityPool from "./components/CreateLiquidityPool";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TokenSwap from "./components/TokenSwap";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Router>
              <Header />
              <main className="flex-grow flex items-start justify-center py-8">
                <Routes>
                  <Route path="/" element={
                    <>
                      <LandingPage />
                    </>
                  } />
                  <Route path="/create-token" element={<TokenLaunchPad />} />
                  <Route path="/myTokens" element={<MyTokens />} />
                  <Route path="/airdrop" element={<Airdrop />} />
                  <Route path="/create-pool" element={<CreateLiquidityPool />} />
                  <Route path="/token-swap" element={<TokenSwap />} />
                </Routes>
              </main>
              <Footer />
            </Router>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
