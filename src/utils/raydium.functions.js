import {
    DEVNET_PROGRAM_ID,
    getCpmmPdaAmmConfigId,
    getCpmmPdaPoolId,
    CurveCalculator,
    Token
  } from '@raydium-io/raydium-sdk-v2';
  import BN from 'bn.js';
  import { initSdk, txVersion } from './raydium';
  import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
  import { createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, getMint, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
  
 
  async function wrapSol(connection, wallet, amountOfSol) {
    const associatedTokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        wallet.publicKey
    );
    //if associatedTokenAccount has balance >= 0, return
    const associatedTokenAccountBalance = await connection.getTokenAccountBalance(associatedTokenAccount);
    if(associatedTokenAccountBalance.value.uiAmount >= 0){
      // transfer sol to associatedTokenAccount
      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: associatedTokenAccount,
            lamports:  amountOfSol * LAMPORTS_PER_SOL,
        }),
      );
      await wallet.sendTransaction(transferTransaction, connection);
      return associatedTokenAccount;
    }

    const wrapTransaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedTokenAccount,
            wallet.publicKey,
            NATIVE_MINT
        ),
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: associatedTokenAccount,
            lamports:  amountOfSol * LAMPORTS_PER_SOL,
        }),
        createSyncNativeInstruction(associatedTokenAccount)
    );
    await wallet.sendTransaction(wrapTransaction, connection);

    console.log("✅ - Step 2: SOL wrapped");
    return associatedTokenAccount;
}
  
  export const createPoolLiquidityPool = async (
    wallet,
    token1,
    token2,
    token1Amount,
    token2Amount,
    token1ProgramId,
    token2ProgramId
  ) => {
    if (!wallet.publicKey) {
      return null;
    }
    const owner = wallet.publicKey;
    const raydium = await initSdk({ loadToken: true, owner, wallet });

    console.log(`token1: ${token1}, token2: ${token2}, token1Amount: ${token1Amount}, token2Amount: ${token2Amount}, token1ProgramId: ${token1ProgramId}, token2ProgramId: ${token2ProgramId}`);

    if(token1.toBase58() === NATIVE_MINT.toBase58() || token2.toBase58() === NATIVE_MINT.toBase58()){
      //create wrapped solana token account
      let amountOfSol = token1.toBase58() === NATIVE_MINT.toBase58() ? token1Amount : token2Amount
      await wrapSol(raydium.connection, wallet, amountOfSol);
    }
  
  
    const token1decimals = (await getMint(raydium.connection, new PublicKey(token1), "confirmed", new PublicKey(token1ProgramId))).decimals;
    const token2decimals = (await getMint(raydium.connection, new PublicKey(token2), "confirmed", new PublicKey(token2ProgramId))).decimals;
  
    const mintAAmount = token1Amount * 10 ** token1decimals;
    const mintBAmount = token2Amount * 10 ** token2decimals;
  
  
    console.log(token1, token2, token1Amount, token2Amount);
    const mintA = {
      address: token1,
      programId: token1ProgramId.toBase58(),
      decimals: token1decimals,
    };
  
    const mintB = {
      address: token2,
      programId: token2ProgramId.toBase58(),
      decimals: token2decimals,
    };
  
    const feeConfigs = await raydium.api.getCpmmConfigs();
  
    if (raydium.cluster === 'devnet') {
      console.log('feeConfigs', feeConfigs);
      feeConfigs.forEach((config) => {
        config.id = getCpmmPdaAmmConfigId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58();
      });
    }
  
    const { execute, extInfo } = await raydium.cpmm.createPool({
      programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
      poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,
      mintA,
      mintB,
      mintAAmount: new BN(mintAAmount),
      mintBAmount: new BN(mintBAmount),
      startTime: new BN(0),
      feeConfig: feeConfigs[0],
      associatedOnly: false,
      ownerInfo: {
        useSOLBalance: true,
      },
      txVersion,
    });
  
    // // Execute the transaction
    const { txId } = await execute({ sendAndConfirm: true });
  
    // // Log the pool creation and pool keys
    console.log(`pool created: ${txId}`);

    console.log('pool created', {
      txId,
      poolKeys: Object.keys(extInfo.address).reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: extInfo.address[cur].toString(),
        }),
        {}
      ),
    })

  };

  export const fetchPoolByMints = async (token1, token2, owner, wallet) => {
    const raydium = await initSdk({ loadToken: true, owner, wallet });
    const pool = await raydium.api.getTokenList();
    // const jupToken = await raydium.fetchJupTokenList();

    const token1Info = await raydium.api.getTokenInfo([token1]);

    console.log(`pool fetched: ${pool}`,{pool});
    // console.log(`jupToken fetched: ${jupToken}`,{jupToken});
    console.log(`token1Info fetched: ${token1Info}`,{token1Info});
  }

  export const fetchRPCPoolInfo = async (wallet) => {
    const raydium = await initSdk({ loadToken: true, owner: wallet.publicKey, wallet });
    let poolId = "6VGFkrrccMdWRSPFXHb3U4LJJ1HQwrZciD8brkpWLwMR"
    const res = await raydium.cpmm.getRpcPoolInfos([poolId])
    console.log(`res fetched: ${res}`,{res})

   

    // const pool1Info = res[pool1]
    // console.log(`pool1Info fetched: ${pool1Info}`,{pool1Info})
  }
  
  export const fetchCPMMPoolInfo = async (wallet, tokenMintA, tokenMintB, amountOfTokenA) => {
    const raydium = await initSdk({ loadToken: true, owner: wallet.publicKey, wallet });
    let v3Tokens = await raydium.connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID })
    console.log(`v3Tokens fetched: ${v3Tokens}`,{v3Tokens})
    // First, fetch all pools
    // const allPools = await raydium.api.getPoolList();
    // console.log(`allPools fetched: ${allPools}`,{allPools});
    const cpmmConfigs = await raydium.api.getCpmmConfigs();
    console.log(`cpmmConfigs fetched: ${cpmmConfigs}`,{cpmmConfigs});

    if (raydium.cluster === 'devnet') {
      cpmmConfigs.forEach((config) => {
        config.id = getCpmmPdaAmmConfigId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58();
      });
    }

    let res = getCpmmPdaPoolId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, new PublicKey(cpmmConfigs[0].id), tokenMintA, tokenMintB)
    console.log(`res fetched: ${res}`,{res});
    let poolId = res.publicKey.toBase58();
    console.log(`poolId fetched: ${poolId}`,{poolId});
    let poolInfos = null;
 
    try {
    poolInfos = await raydium.cpmm.getRpcPoolInfos([poolId]);
    console.log('CPMM Pool Information:', poolInfos);
    } catch (error) {
      console.error('Error fetching CPMMPoolInfo:', error);
    }
    if(poolInfos == null){
    res = getCpmmPdaPoolId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, new PublicKey(cpmmConfigs[0].id), tokenMintB, tokenMintA)
    console.log(`res fetched: ${res}`,{res});
    poolId = res.publicKey.toBase58();
    console.log(`poolId fetched: ${poolId}`,{poolId});

    try {
      poolInfos = await raydium.cpmm.getRpcPoolInfos([poolId]);
      console.log('CPMM Pool Information:', poolInfos);
    } catch (error) {
      console.error('Error fetching CPMMPoolInfo:', error);
    }
  }

    if(poolInfos == null){
      return null;
    }
    else {
      // return useful information like poolId, poolPrice, amount of tokenA and tokenB in the pool
      let poolInfo = poolInfos[poolId]
      let tokenAInfo, tokenBInfo, exchangeRate;
      if(tokenMintA.toBase58() == poolInfo.mintA.toBase58()){
        tokenAInfo = {
          mint: tokenMintA.toBase58(),
          amount: Number(poolInfo.vaultAAmount.toString())/10**poolInfo.mintDecimalA
        }
        tokenBInfo = {
          mint: tokenMintB.toBase58(),
          amount: Number(poolInfo.vaultBAmount.toString())/10**poolInfo.mintDecimalB
        }
        exchangeRate = Number(poolInfo.poolPrice.toString())
      }
      else{
        tokenAInfo = {
          mint: tokenMintB.toBase58(),
          amount: Number(poolInfo.vaultBAmount.toString())/10**poolInfo.mintDecimalB
        }
        tokenBInfo = {
          mint: tokenMintA.toBase58(),
          amount: Number(poolInfo.vaultAAmount.toString())/10**poolInfo.mintDecimalA
        }
        exchangeRate = 1/Number(poolInfo.poolPrice.toString())
      }
      //calculate the amount of tokenB that will be received for tokenA according to constant product formula
      let constantProduct = tokenAInfo.amount * tokenBInfo.amount;
      console.log(`constantProduct fetched: ${constantProduct}`,{constantProduct});
      let newAmountOfTokenA = tokenAInfo.amount + amountOfTokenA;
      let newAmountOfTokenB =tokenBInfo.amount - (constantProduct/newAmountOfTokenA)
      let dataToReturn = {
        poolId: poolId,
        poolPrice: Number(poolInfo.poolPrice.toString()),
        tokenAInfo: tokenAInfo,
        tokenBInfo: tokenBInfo,
        exchangeRate: exchangeRate,
        newAmountOfTokenB: newAmountOfTokenB
      }
      console.log(`dataToReturn fetched: ${dataToReturn}`,{dataToReturn});
      return dataToReturn;
    }

      
    

    
    
    // return poolInfos;
  }

  export const getAmountOfTokenBForTokenA = async (wallet, tokenMintA, tokenMintB, amountOfTokenA) => {
    const poolInfos = await fetchCPMMPoolInfo(wallet, tokenMintA, tokenMintB, amountOfTokenA)
    if(poolInfos == null){
      return null;
    }
    let tokenAInfo = poolInfos.tokenAInfo
    let tokenBInfo = poolInfos.tokenBInfo
    let exchangeRate = poolInfos.exchangeRate
    let newAmountOfTokenB = poolInfos.newAmountOfTokenB
    console.log(`newAmountOfTokenB fetched: ${newAmountOfTokenB}`,{newAmountOfTokenB});
    return {newAmountOfTokenB, poolId: poolInfos.poolId}
  }

  export const getAmountOfTokenBForTokenAv2 = async (wallet, tokenMintA, tokenMintB, amountOfTokenA) => {
    try {
      const raydium = await initSdk({ loadToken: true, owner: wallet.publicKey, wallet });
      const poolInfos = await fetchCPMMPoolInfo(wallet, tokenMintA, tokenMintB, amountOfTokenA)
      if(poolInfos == null){
        return null;
      }
      let poolId = poolInfos.poolId
      let poolInfo = null;
      let poolKeys = null;
      let rpcData = null;

      if (raydium.cluster === 'mainnet') {
        // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
        // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
        const data = await raydium.api.fetchPoolById({ ids: poolId });
        poolInfo = data[0];
        if (!isValidCpmm(poolInfo.programId)) throw new Error('target pool is not CPMM pool');
        rpcData = await raydium.cpmm.getRpcPoolInfo(poolInfo.id, true);
      } else {
        const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
        poolInfo = data.poolInfo;
        poolKeys = data.poolKeys;
        rpcData = data.rpcData;
      }
      console.log(`poolInfo fetched: ${poolInfo}`,{poolInfo});
      console.log(`rpcData fetched: ${rpcData}`,{rpcData});
      const baseIn = tokenMintA.toBase58() === poolInfo.mintA.address;
      let swapSourceAmount, swapDestinationAmount, mintA, mintB;
      if(baseIn){
        mintA = poolInfo.mintA;
        mintB = poolInfo.mintB;
      }
      else{
        mintA = poolInfo.mintB;
        mintB = poolInfo.mintA;
      }
      if(mintA.address === rpcData.mintA.toBase58()){
        swapSourceAmount = rpcData.baseReserve;
        swapDestinationAmount = rpcData.quoteReserve;
      }
      else{
        swapSourceAmount = rpcData.quoteReserve;
        swapDestinationAmount = rpcData.baseReserve;
      }
      let amountOfTokenAInLamports = new BN(amountOfTokenA*10**mintA.decimals)
      console.log(`swapSourceAmount fetched: ${swapSourceAmount} , swapDestinationAmount fetched: ${swapDestinationAmount}, amountOfTokenAInLamports : ${amountOfTokenAInLamports}`);
      const swapResult = CurveCalculator.swap(
        amountOfTokenAInLamports,
        swapSourceAmount,
        swapDestinationAmount,
        rpcData.configInfo.tradeFeeRate
      )
      console.log(`swapResult fetched: ${swapResult}`,{swapResult});
      return {newAmountOfTokenB: swapResult?.destinationAmountSwapped/10**mintB.decimals, poolId: poolInfos.poolId};
    } catch (error) {
      console.log(`Error in getAmountOfTokenBForTokenAv2: ${error}`,{error})
      return null;
    }
  }

  export const swapTokenAForTokenB = async (wallet, tokenMintA, amountOfTokenA, poolId) => {
    try {
      const raydium = await initSdk({ loadToken: true, owner: wallet.publicKey, wallet });
      let poolInfo = null;
      let poolKeys = null;
      let rpcData = null;

      if (raydium.cluster === 'mainnet') {
        // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
        // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
        const data = await raydium.api.fetchPoolById({ ids: poolId });
        poolInfo = data[0];
        if (!isValidCpmm(poolInfo.programId)) throw new Error('target pool is not CPMM pool');
        rpcData = await raydium.cpmm.getRpcPoolInfo(poolInfo.id, true);
      } else {
        const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
        poolInfo = data.poolInfo;
        poolKeys = data.poolKeys;
        rpcData = data.rpcData;
      }
      console.log(`poolInfo fetched: ${poolInfo}`,{poolInfo});
      console.log(`rpcData fetched: ${rpcData}`,{rpcData});
      const baseIn = tokenMintA.toBase58() === poolInfo.mintA.address;
      let swapSourceAmount, swapDestinationAmount, mintA, mintB;
      if(baseIn){
        mintA = poolInfo.mintA;
        mintB = poolInfo.mintB;
      }
      else{
        mintA = poolInfo.mintB;
        mintB = poolInfo.mintA;
      }
      if(mintA.address === rpcData.mintA.toBase58()){
        swapSourceAmount = rpcData.baseReserve;
        swapDestinationAmount = rpcData.quoteReserve;
      }
      else{
        swapSourceAmount = rpcData.quoteReserve;
        swapDestinationAmount = rpcData.baseReserve;
      }
      let amountOfTokenAInLamports = new BN(amountOfTokenA*10**mintA.decimals)
      console.log(`swapSourceAmount fetched: ${swapSourceAmount} , swapDestinationAmount fetched: ${swapDestinationAmount}, amountOfTokenAInLamports : ${amountOfTokenAInLamports}`);
      const swapResult = CurveCalculator.swap(
        amountOfTokenAInLamports,
        swapSourceAmount,
        swapDestinationAmount,
        rpcData.configInfo.tradeFeeRate
      )
      console.log(`swapResult fetched: ${swapResult}`,{swapResult});
      if(tokenMintA.toBase58() === NATIVE_MINT.toBase58()){
        await wrapSol(raydium.connection, wallet, amountOfTokenA);
      }
      const { execute } = await raydium.cpmm.swap({
        poolInfo,
        poolKeys,
        inputAmount: amountOfTokenAInLamports,
        swapResult,
        slippage: 0.01, // range: 1 ~ 0.0001, means 100% ~ 0.01%
        baseIn,
        // optional: set up priority fee here
        // computeBudgetConfig: {
        //   units: 600000,
        //   microLamports: 10000000,
        // },
      })
    
      // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
      const { txId } = await execute({ sendAndConfirm: true })
      console.log(`swapped: ${poolInfo.mintA.symbol} to ${poolInfo.mintB.symbol}:`, {
        txId: `https://explorer.solana.com/tx/${txId}`,
      })
      return true;
    } catch (error) {
      console.log(`error fetched: ${error}`, { error });
      return false;
    }
  }