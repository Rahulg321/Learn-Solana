import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
  sol,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromEnvironment,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";

const connection = new Connection(clusterApiUrl("devnet"));

// load keypair from local file system
// See https://github.com/solana-developers/helpers?tab=readme-ov-file#get-a-keypair-from-a-keypair-file
// assumes that the keypair is already generated using `solana-keygen new`
// const user = await getKeypairFromFile();
const user = await getKeypairFromEnvironment("SECRET_KEY");
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL
);

console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection).use(mplCore()).use(irysUploader());
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiKeypair));

const collectionImagePath = path.join(__dirname, "collection.png");
console.log("collectionImagePath", collectionImagePath);
try {
  const buffer = await fs.readFile(collectionImagePath);
  let file = createGenericFile(buffer, collectionImagePath, {
    contentType: "image/png",
  });

  const [image] = await umi.uploader.upload([file]);
  console.log("image uri:", image);

  const metadata = {
    name: "Rahul NFT COLLECTION",
    description: "This is a collection of NFTs from rahul",
    image,
    external_url: "https://example.com",
    properties: {
      files: [
        {
          uri: image,
          type: "image/jpeg",
        },
      ],
      category: "image",
    },
  };

  const uri = await umi.uploader.uploadJson(metadata);
  console.log("Collection offchain metadata URI:", uri);

  // generate mint keypair
  const collection = generateSigner(umi);

  console.log("minting a collection");
  // create and mint a Collection
  await createCollection(umi, {
    collection,
    name: "Rahul NFT COLLECTION",
    uri,
  }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

  let explorerLink = getExplorerLink("address", collection.publicKey, "devnet");
  console.log(`Collection: ${explorerLink}`);
  console.log(`Collection address is:  ${collection.publicKey}`);
  console.log("✅ Finished successfully!");
} catch (error) {
  console.error("Error reading file:", error);
}
