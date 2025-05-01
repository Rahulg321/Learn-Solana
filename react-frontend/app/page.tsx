"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import SendSol from "@/components/send-sol";
import { PingButton } from "@/components/PingButton";

const HomePage = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const updateBalance = async () => {
      if (!connection || !publicKey) {
        console.error("Wallet not connected or connection unavailable");
        return;
      }

      try {
        connection.onAccountChange(
          publicKey,
          (updatedAccountInfo) => {
            setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
          },
          "confirmed"
        );

        const accountInfo = await connection.getAccountInfo(publicKey);
        if (accountInfo) {
          setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
        } else {
          throw new Error("Account Info not found");
        }
      } catch (error) {
        console.error("failed to get account info");
      }
    };

    updateBalance();
  }, [connection, publicKey]);

  return (
    <div className="container max-w-4xl mx-auto">
      {publicKey ? `Balance :${balance} SOL` : ""}

      <SendSol />
      <PingButton />
    </div>
  );
};

export default HomePage;
