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
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "10rem",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "30%",
          gap: "2rem",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-evenly",
          border: "4px solid gray",
          padding: "2rem",
          borderRadius: "2rem",
        }}
      >
        <input
          style={{ padding: "15px", borderRadius: "10px" }}
          value={name}
          type="text"
          placeholder="Token Name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <input
          style={{ padding: "15px", borderRadius: "10px" }}
          value={symbol}
          type="text"
          placeholder="Token Symbol"
          onChange={(e) => {
            setSymbol(e.target.value);
          }}
        />
        <input
          style={{ padding: "15px", borderRadius: "10px" }}
          value={supply}
          type="number"
          placeholder="Token Supply"
          onChange={(e) => {
            setSupply(e.target.value);
          }}
        />
        <input
          style={{ padding: "15px", borderRadius: "10px" }}
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
        <label htmlFor="file-upload">
          {selectedFile ? (
            <img
              style={{
                maxHeight: "64px",
                maxWidth: "64px",
                borderRadius: "6px",
              }}
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
            />
          ) : (
            <div
              style={{
                backgroundColor: "#808080",
                borderRadius: "10px",
                padding: "15px",
                width: "124px",
              }}
            >
              Upload Image
            </div>
          )}
        </label>
        <input
          id="file-upload"
          style={{ display: "none" }}
          type="file"
          onChange={(e) => {
            handleFileChange(e);
          }}
        />
        <button
          onClick={launchToken}
          style={{
            padding: "20px",
            borderRadius: "10px",
            display: loading ? "none" : "block",
          }}
          disabled={!connected}
        >
          Launch Token
        </button>
        <Spin spinning={loading} />
      </div>
    </div>
  );
};

export default TokenLaunchPad;
