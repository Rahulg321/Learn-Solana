"use client";

import { FC } from "react";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const AppBar: FC = () => {
  return (
    <div className="flex justify-between items-center p-4">
      <Image src="/solanaLogo.png" height={30} width={200} alt="solana logo" />
      <span>Wallet-Adapter Example</span>
      <WalletMultiButton />
    </div>
  );
};
