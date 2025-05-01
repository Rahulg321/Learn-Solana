import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const user = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("testnet"));

console.log(
  `🔑 We've loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Substitute in your token mint account
const tokenMintAccount = new PublicKey(
  "2U5qLNZ4TqjBoqrq2ZFhtWfiK8S68uJ8tKeRSiY4ax1g"
);

const metadataData = {
  name: "Solana Training Token",
  symbol: "TRAINING",
  // Arweave / IPFS / Pinata etc link using metaplex standard for offchain data
  uri: "https://arweave.net/1234",
  //   how much royalty creators get for each token
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

/**
 *
 * finding the right place to store the metadata
 * PDA -> Program Derived Address
 * it uses the token mint account and the metadata program id and specific seeds to derive a new address
 *
 * this new address is the metadata account and where our metadata data will be stored
 *
 *
 *
 */
const metadataPDAAndBump = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

const metadataPDA = metadataPDAAndBump[0];

console.log("metadataPDA", metadataPDA.toBase58());

const transaction = new Transaction();

const createMetadataAccountInstruction =
  createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: user.publicKey,
      payer: user.publicKey,
      updateAuthority: user.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    }
  );

transaction.add(createMetadataAccountInstruction);

const transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [user]
);

const transactionLink = getExplorerLink(
  "transaction",
  transactionSignature,
  "testnet"
);
console.log(`✅ Transaction confirmed, explorer link is: ${transactionLink}`);
const tokenMintLink = getExplorerLink(
  "address",
  tokenMintAccount.toString(),
  "testnet"
);
console.log(`✅ Look at the token mint again: ${tokenMintLink}`);
