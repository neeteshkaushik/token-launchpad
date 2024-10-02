import "./App.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import Header from "./components/Header";
import TokenLaunchPad from "./components/TokenLaunchPad";
import { CustomWalletProvider } from "./contexts/WalletContext";
import MyTokens from "./components/MyTokens";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <CustomWalletProvider>
            <Router>
              <Header />
              <Routes>
                <Route path="/" element={<TokenLaunchPad />} />
                <Route path="/myTokens" element={<MyTokens />} />
              </Routes>
            </Router>
          </CustomWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
