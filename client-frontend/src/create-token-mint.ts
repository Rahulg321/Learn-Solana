import { createMint } from "@solana/spl-token";
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const connection = new Connection(clusterApiUrl("testnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");
console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

const tokenMint = await createMint(connection, user, user.publicKey, null, 2);
console.log(`🔑 Created a new token mint: ${tokenMint.toBase58()}`);

const link = getExplorerLink("address", tokenMint.toString(), "testnet");
console.log("visit explorer to see the token mint: ", link);
