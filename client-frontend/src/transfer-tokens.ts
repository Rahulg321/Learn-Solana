import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("testnet"));

const sender = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`
);

const recipient = new PublicKey("EWuK6jhEeVE9AD6EeS8qHRLpARiDPoxcjacCgV5xje78");

const tokenMintAccount = new PublicKey(
  "2U5qLNZ4TqjBoqrq2ZFhtWfiK8S68uJ8tKeRSiY4ax1g"
);

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

console.log(`💸 Attempting to send 1 token to ${recipient.toBase58()}...`);

const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  sender.publicKey
);

console.log("source token account", sourceTokenAccount.address.toBase58());

const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  recipient
);

console.log(
  "destination token account",
  destinationTokenAccount.address.toBase58()
);

const tx = await transfer(
  connection,
  sender,
  sourceTokenAccount.address,
  destinationTokenAccount.address,
  sender,
  1 * MINOR_UNITS_PER_MAJOR_UNITS
);

const link = getExplorerLink("transaction", tx, "testnet");

console.log(`✅ Success! Transfer Token Transaction: ${link}`);
