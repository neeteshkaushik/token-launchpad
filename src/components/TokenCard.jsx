import React from "react";
import { message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const TokenCard = ({
  tokenName,
  tokenSymbol,
  imageUrl,
  mintAddress,
  tokenAccountAddress,
  tokenAmount,
}) => {
  function copyToClipBoard(text) {
    message.info("Copied to clipboard");
    navigator.clipboard.writeText(text);
  }
  function truncateAddress(address) {
    return `${address.substring(0, 4)}...${address.substring(
      address.length - 4,
      address.length
    )}`;
  }
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-gray-800">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center mb-4">
          <img
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mr-3 sm:mr-4"
            src={imageUrl}
            alt={tokenName}
          />
          <div className="font-bold text-lg sm:text-xl text-white">{tokenName}</div>
        </div>
        <div className="space-y-2 text-sm sm:text-base">
          <p className="text-gray-300">
            <span className="font-semibold">Symbol: </span>
            <span className="text-gray-400">{tokenSymbol}</span>
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Mint Address: </span>
            <span className="text-gray-400">
              {truncateAddress(mintAddress)}
              <CopyOutlined
                className="ml-2 cursor-pointer text-blue-400 hover:text-blue-300"
                onClick={() => copyToClipBoard(mintAddress)}
              />
            </span>
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Token Account Address: </span>
            <span className="text-gray-400">
              {truncateAddress(tokenAccountAddress)}
              <CopyOutlined
                className="ml-2 cursor-pointer text-blue-400 hover:text-blue-300"
                onClick={() => copyToClipBoard(tokenAccountAddress)}
              />
            </span>
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Token Amount: </span>
            <span className="text-gray-400">{tokenAmount}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;