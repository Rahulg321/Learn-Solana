"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import React, { useState, useTransition } from "react";

const SendSol = () => {
  const [recipientPubKey, setRecipientPubKey] = useState("");
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [isPending, startTransition] = useTransition();

  const onClickHandler = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    startTransition(async () => {
      event?.preventDefault();
      if (!recipientPubKey) {
        console.error("recipient pub key is not defined");
        return;
      }
      if (!publicKey) {
        console.error("Wallet not connected");
        return;
      }

      try {
        const recipientFullPublicKey = new PublicKey(recipientPubKey);
        const transaction = new Transaction();

        const sendSolInstruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientFullPublicKey,
          lamports: 0.1 * LAMPORTS_PER_SOL,
        });

        transaction.add(sendSolInstruction);
        const signature = await sendTransaction(transaction, connection);
        console.log(`Transaction Signature ✅ ${signature}`);
      } catch (error) {
        console.error("Transaction FAILED", error);
      }
    });
  };

  return (
    <div className="">
      <h4>Send Sol</h4>

      <input
        type="text"
        placeholder="Public Key"
        onChange={(e) => {
          setRecipientPubKey(e.target.value);
        }}
      />
      <button disabled={isPending} onClick={onClickHandler}>
        {isPending ? "Sending..." : "Send Sol"}
      </button>
    </div>
  );
};

export default SendSol;
