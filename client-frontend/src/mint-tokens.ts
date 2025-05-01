import { mintTo } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("testnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

const tokenMintAccount = new PublicKey(
  "2U5qLNZ4TqjBoqrq2ZFhtWfiK8S68uJ8tKeRSiY4ax1g"
);

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);
const recipientAssociatedTokenAccount = new PublicKey(
  "3W8UXBJzbcev9ZstrL4byrhk5h3TGbidYxbUdo2PKngr"
);

const tx = await mintTo(
  connection,
  user,
  tokenMintAccount,
  recipientAssociatedTokenAccount,
  user,
  10 * MINOR_UNITS_PER_MAJOR_UNITS
);

const link = getExplorerLink("transaction", tx, "testnet");

console.log(`✅ Success! Mint Token Transaction: ${link}`);
