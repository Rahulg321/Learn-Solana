import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// this code creates an associated token account for the user

const user = getKeypairFromEnvironment("SECRET_KEY");
console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);
const connection = new Connection(clusterApiUrl("testnet"));

const tokenMintAccount = new PublicKey(
  "2U5qLNZ4TqjBoqrq2ZFhtWfiK8S68uJ8tKeRSiY4ax1g"
);

// Here we are making an associated token account for our own address, but we can
// make an ATA on any other wallet in devnet!
// const recipient = new PublicKey("SOMEONE_ELSES_DEVNET_ADDRESS");
const recipient = user.publicKey;

const ata = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  recipient
);

console.log("ATA", ata.address.toBase58());

const link = getExplorerLink("address", ata.address.toBase58(), "testnet");

console.log(`✅ Created token Account: ${link}`);
