import "dotenv/config";
import {
  airdropIfRequired,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import {
  LAMPORTS_PER_SOL,
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("testnet"));

const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
console.log(senderKeypair);
const recipientPubKey = new PublicKey(
  "764CksEAZvm7C1mg2uFmpeFvifxwgjqxj2bH6Ps7La4F"
);
const amount = 1;

console.log("requesting airdrop if required");
await airdropIfRequired(
  connection,
  senderKeypair.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

const transaction = new Transaction();
const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,
  toPubkey: recipientPubKey,
  lamports: LAMPORTS_PER_SOL * amount,
});

transaction.add(sendSolInstruction);

//the first one signining it will pay the gas fees
const signature = await sendAndConfirmTransaction(connection, transaction, [
  senderKeypair,
]);

console.log("signature generated from the transaction", signature);

// const connection = new Connection(clusterApiUrl("devnet"));
// console.log("connected");
// const address = new PublicKey("FC2uMUqe8QgczJJXadoxDoorYGhZKb4DGNt7Y9mWty1s");

// const balance = await connection.getBalance(address);
// console.log("balance is", balance);
// const balanceInSol = balance / LAMPORTS_PER_SOL;
// console.log("balance in sol", balanceInSol);
// const keypair = Keypair.generate();
// console.log(`The public key is: `, keypair.publicKey.toBase58());
// console.log(`The secret key is: `, keypair.secretKey);
