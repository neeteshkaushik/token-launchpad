import { useContext, useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  useConnection,
  useWallet,
  WalletContext,
} from "@solana/wallet-adapter-react";
import {
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import pinataWeb3 from "../helper/pinataWeb3";
import { Spin, notification } from "antd";

const TokenLaunchPad = () => {
  const { connected } = useContext(WalletContext);
  const { connection } = useConnection();
  const wallet = useWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [supply, setSupply] = useState("");
  const [decimals, setDecimals] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSizeInBytes = 204800;
      if (file.size > maxSizeInBytes) {
        notification.error({
          message: "File is too large. Max size is 200KB.",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        setSelectedFile(file);
      }
    }
  };

  const launchToken = async () => {
    try {
      setLoading(true);
      const web3ImageUpload = await pinataWeb3.upload.file(selectedFile);
      let imageUrl = `https://silver-tired-wildcat-610.mypinata.cloud/ipfs/${web3ImageUpload.IpfsHash}`;
      const mintKeypair = Keypair.generate();
      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      let external_metadata = {
        name: name,
        symbol: symbol,
        description: "This is a test token",
        image: imageUrl,
      };
      let pinataRes = await pinataWeb3.upload.json(external_metadata);
      let uri = `https://silver-tired-wildcat-610.mypinata.cloud/ipfs/${pinataRes.IpfsHash}`;
      const metadata = {
        mint: mintKeypair.publicKey,
        name: name,
        symbol: symbol,
        uri: uri,
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          Number(decimals),
          wallet.publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        }),
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          wallet.publicKey,
          Number(supply) * Math.pow(10, decimals),
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeypair);

      await wallet.sendTransaction(transaction, connection);

      setName("");
      setSymbol("");
      setSupply("");
      setDecimals("");
      setSelectedFile(null);
      setLoading(false);
      notification.success({
        message: "Token Launched Successfully",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      console.error(error);
      setName("");
      setSymbol("");
      setSupply("");
      setDecimals("");
      setSelectedFile(null);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8 lg:flex lg:gap-8">
        {/* Token Creation Form */}
        <div className="lg:w-1/2">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-white">Launch Your Token</h2>
          <div className="space-y-4">
            <input
              className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm sm:text-base"
              value={name}
              type="text"
              placeholder="Token Name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm sm:text-base"
              value={symbol}
              type="text"
              placeholder="Token Symbol"
              onChange={(e) => setSymbol(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm sm:text-base"
              value={supply}
              type="number"
              placeholder="Token Supply"
              onChange={(e) => setSupply(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm sm:text-base"
              value={decimals}
              type="number"
              placeholder="Token Decimals (max 9)"
              onChange={(e) => {
                if (Number(e.target.value) > 9) {
                  notification.error({
                    message: "Decimals should be less than 9",
                    placement: "bottomRight",
                    duration: 2,
                  });
                  return;
                }
                setDecimals(e.target.value);
              }}
            />
            <div className="flex items-center justify-center">
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFile ? (
                  <img
                    className="h-16 w-16 object-cover rounded-md"
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                  />
                ) : (
                  <div className="bg-gray-700 text-gray-300 rounded-md px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base hover:bg-gray-600 transition duration-300">
                    Upload Image
                  </div>
                )}
              </label>
              <input
                id="file-upload"
                className="hidden"
                type="file"
                onChange={handleFileChange}
              />
            </div>
            <button
              onClick={launchToken}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-sm sm:text-base ${
                !connected || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!connected || loading}
            >
              {loading ? 'Launching...' : 'Launch Token'}
            </button>
          </div>
          {loading && (
            <div className="mt-4 flex justify-center">
              <Spin />
            </div>
          )}
        </div>

        {/* Additional Information or Features */}
        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-white">Token Launchpad Features</h2>
          <div className="space-y-4 text-gray-300">
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Create Custom Tokens</h3>
              <p>Launch your own token on the Solana blockchain with ease. Customize name, symbol, supply, and more.</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Manage Your Tokens</h3>
              <p>Keep track of all your created tokens in one place. View balances, transfer tokens, and more.</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Secure and Fast</h3>
              <p>Benefit from Solana's high-speed and low-cost transactions. Your tokens are secured by blockchain technology.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenLaunchPad;