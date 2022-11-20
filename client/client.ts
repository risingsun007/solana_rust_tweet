import fs from 'fs';
import {
    Keypair,
    Connection,
} from '@solana/web3.js';
import path from 'path';
import { toGreen, toMagenta } from "./utils"
const anchor = require("@project-serum/anchor");
const programId = new anchor.web3.PublicKey("GxgudfRVS2fdXJ2LWEXCg7y8HUH531xNHMn4hviF77Zh");

console.log(`${toGreen("programId")}: ${programId}`);
const WALLET_FILE = path.resolve(
    process.env.HOME,
    '.config',
    'solana',
    'id.json',
);

process.env['ANCHOR_WALLET'] = WALLET_FILE;

const rpcUrl = "https://api.devnet.solana.com";
const connection = new Connection(rpcUrl, 'confirmed');

const secret1 = JSON.parse(
    require("fs").readFileSync(WALLET_FILE, "utf8")
);
const myWallet = Keypair.fromSecretKey(Uint8Array.from(secret1));
const fromAccount = myWallet;
console.log(`${toGreen("account")}: ${myWallet.publicKey} `);

const idl = JSON.parse(
    require("fs").readFileSync("target/idl/my_solana_program.json", "utf8")
);

const opts = {
    preflightCommitment: "recent",
};

anchor.setProvider(anchor.AnchorProvider.local("https://api.devnet.solana.com"), myWallet.publicKey);
const program = new anchor.Program(idl, programId);

async function CreateDataAccount() {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const program = new anchor.Program(idl, programId);
    console.log(`qqq: ${tweetKeypair.secretKey}`)
    fs.writeFileSync(".mysecretkey.json", `[${tweetKeypair.secretKey}]`);
    const secret1 = JSON.parse(
        require("fs").readFileSync(".mysecretkey.json", "utf8")
    );

    const newAccount = Keypair.fromSecretKey(Uint8Array.from(secret1));

    const result2 = await program
        .rpc
        .setupPlatform({
            accounts: {
                tweet: tweetKeypair.publicKey,
                user: myWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [tweetKeypair]
        })
    console.log(`new account created: ${tweetKeypair.publicKey}`);

}

async function getAccountData() {
    const newAccount = await getDataKeyPair();
    console.log(`${toGreen("tweet")}: \n ${toMagenta("publicKey")}: ${newAccount.publicKey}\n  ${JSON.stringify(await program.account.tweet.fetch(newAccount.publicKey), null, 2)}`);
}

async function getDataKeyPair() {
    const secret1 = JSON.parse(
        require("fs").readFileSync(".mysecretkey.json", "utf8")
    );
    return Keypair.fromSecretKey(Uint8Array.from(secret1));
}

async function likeTweet() {
    const newAccount = await getDataKeyPair();
    console.log(`tweet, publicKey: ${newAccount.publicKey},  ${JSON.stringify(await program.account.tweet.fetch(newAccount.publicKey), null, 2)}`);
    let likeTweet = await program.rpc.likeTweet(
        fromAccount.publicKey,
        { accounts: { tweet: newAccount.publicKey } }
    );
    console.log(`likeTweet result: ${likeTweet}`);
}

async function dislikeTweet() {
    const newAccount = await getDataKeyPair();
    console.log(`tweet, publicKey: ${newAccount.publicKey},  ${JSON.stringify(await program.account.tweet.fetch(newAccount.publicKey), null, 2)}`);
    let likeTweet = await program.rpc.dislikeTweet(
        fromAccount.publicKey,
        { accounts: { tweet: newAccount.publicKey } }
    );
    console.log(`dislikeTweet result: ${likeTweet}`);
}

async function writeTweet() {
    const newAccount = await getDataKeyPair();
    let writeTweetResult = await program.rpc.writeTweet(
        "Hello World",
        fromAccount.publicKey,
        { accounts: { tweet: newAccount.publicKey } }
    );
    console.log(`write tweet transaction: ${writeTweetResult}`);
}

//CreateDataAccount();
//writeTweet();
//likeTweet();
//dislikeTweet();
getAccountData();