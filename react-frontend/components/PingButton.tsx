import { PING_PROGRAM_DATA_ID, PING_PROGRAM_ID } from "@/lib/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { FC, useState } from "react";

export const PingButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = async () => {
    try {
      if (!connection || !publicKey) {
        console.error("Wallet not connected or connection unavailable");
      }

      const programId = new PublicKey(PING_PROGRAM_ID);
      const programDataAccount = new PublicKey(PING_PROGRAM_DATA_ID);
      const transaction = new Transaction();

      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: programDataAccount,
            isSigner: false,
            isWritable: true,
          },
        ],
        programId, //programId to execute
      });

      transaction.add(instruction);
      const signature = await sendTransaction(transaction, connection);

      console.log("Transaction sent: ", signature);
      alert("transaction created");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="cursor-pointer" onClick={onClick}>
      <button className="button">Ping!</button>
    </div>
  );
};
