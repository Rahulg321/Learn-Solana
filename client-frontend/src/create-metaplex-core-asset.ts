import {
  mplCore,
  create,
  fetchCollection,
} from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  publicKey as UMIPublicKey,
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

// create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const user = getKeypairFromEnvironment("SECRET_KEY");
console.log("Loaded user:", user.publicKey.toBase58());

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL
);

const umi = createUmi(connection).use(mplCore()).use(irysUploader());

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
umi.use(keypairIdentity(umiKeypair));

const assetImagePath = path.join(__dirname, "nft.png");

const buffer = await fs.readFile(assetImagePath);
let file = createGenericFile(buffer, assetImagePath, {
  contentType: "image/png",
});

const [assetImage] = await umi.uploader.upload([file]);
console.log("asset image uri:", assetImage);

const metadata = {
  name: "Jubreakit Jubutit",
  description: "Impractical Jokers specific NFT",
  image: assetImage,
  external_url: "https://rahulguptadev.in",
  attributes: [
    {
      trait_type: "trait1",
      value: "value1",
    },
    {
      trait_type: "trait2",
      value: "value2",
    },
  ],
  properties: {
    files: [
      {
        uri: assetImage,
        type: "image/jpeg",
      },
    ],
    category: "image",
  },
};

// upload offchain json using irys and get metadata uri
const uri = await umi.uploader.uploadJson(metadata);
console.log("Asset offchain metadata URI:", uri);

// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collection = await fetchCollection(
  umi,
  UMIPublicKey("EtkJgYDr4dDiS6bPjvc4W4raJKg2f2MetNcsp2ycVJJy")
);
const asset = generateSigner(umi);

// create and mint NFT
await create(umi, {
  asset,
  collection,
  name: "Jubreakit Jubutit",
  uri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink("address", asset.publicKey, "devnet");
console.log(`Asset: ${explorerLink}`);
console.log(`Asset address is:  ${asset.publicKey}`);
console.log("✅ Finished successfully!");
