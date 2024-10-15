"use client";
import { Raydium, TxVersion, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

export const connection = new Connection(clusterApiUrl('devnet'))
export const txVersion =  TxVersion.V0
const cluster = 'devnet' // 'mainnet' | 'devnet'

let raydium;
export const initSdk = async ({owner, wallet, loadToken = true }) => {
  if (raydium) return raydium;
  console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`);

  raydium = await Raydium.load({
    owner,
    signAllTransactions: wallet.signAllTransactions,
    connection,
    cluster,
    disableFeatureCheck: true,
    disableLoadToken: !loadToken,
    blockhashCommitment: 'finalized',
  });

  return raydium;
};


export const fetchTokenAccountData = async (owner) => {
  const solAccountResp = await connection.getAccountInfo(owner)
  const tokenAccountResp = await connection.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID })
  const token2022Req = await connection.getTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID })
  const tokenAccountData = parseTokenAccountResp({
    owner: owner,
    solAccountResp,
    tokenAccountResp: {
      context: tokenAccountResp.context,
      value: [...tokenAccountResp.value, ...token2022Req.value],
    },
  })
  return tokenAccountData
}