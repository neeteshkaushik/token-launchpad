import React from "react";
import { Card, message } from "antd";
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
    <div className="card">
      <div className="card-body">
        <Card
          extra={
            <img
              src={imageUrl}
              style={{
                borderRadius: "6px",
                maxWidth: "64px",
                maxHeight: "64px",
              }}
              alt="..."
            />
          }
          title={tokenName}
        >
          <p>
            <span style={{ fontWeight: "bolder" }}>Symbol: </span>{" "}
            <span style={{ color: "gray", fontWeight: "bold" }}>
              {tokenSymbol}
            </span>
          </p>
          <p>
            <span style={{ fontWeight: "bolder" }}>Mint Address: </span>{" "}
            <span style={{ color: "gray", fontWeight: "bold" }}>
              {truncateAddress(mintAddress)}{" "}
              <CopyOutlined
                onClick={() => {
                  copyToClipBoard(mintAddress);
                }}
              />
            </span>{" "}
          </p>
          <p>
            {" "}
            <span style={{ fontWeight: "bolder" }}>
              Token Account Address:{" "}
            </span>{" "}
            <span style={{ color: "gray", fontWeight: "bold" }}>
              {truncateAddress(tokenAccountAddress)}
              <CopyOutlined
                onClick={() => {
                  copyToClipBoard(tokenAccountAddress);
                }}
              />
            </span>{" "}
          </p>
          <p>
            {" "}
            <span style={{ fontWeight: "bolder" }}>Token Amount: </span>{" "}
            <span style={{ color: "gray", fontWeight: "bold" }}>
              {tokenAmount}
            </span>{" "}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TokenCard;
