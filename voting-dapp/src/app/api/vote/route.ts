import { NextResponse } from 'next/server'
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Voting } from '../../../../anchor/target/types/voting'
import { Program } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'
const IDL = require('../../../../anchor/target/idl/voting.json')

export const OPTIONS = GET

export async function GET(req: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7VBKnowp3m-fUM5QQUGoEjxPWVcYoyTio1A&s',
    title: 'Vote for your favorite type of peanut butter!!!',
    label: 'Vote',
    description: 'Vote between crunchy and smooth peanut butter',
    links: {
      actions: [
        {
          label: 'Vote for Crunchy',
          type: 'post',
          href: '/api/vote?candidate=Crunchy',
        },
        {
          label: 'Vote for Smooth',
          type: 'post',
          href: '/api/vote?candidate=Smooth',
        },
      ],
    },
  }

  return NextResponse.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(req: Request) {
  const url = new URL(req.url)

  const candidate = url.searchParams.get('candidate')

  if (candidate !== 'Crunchy' && candidate !== 'Smooth') {
    return new Response('invalidate candidate', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    })
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed')

  const program: Program<Voting> = new Program(IDL, { connection })

  const body: ActionPostRequest = await req.json()

  //   make sure what we recieved is a valid public account
  let voter

  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    console.log('invalid user account')
    return new Response('invalidate account', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    })
  }

  const instruction = await program.methods
    .vote(candidate, new anchor.BN(1))
    .accounts({
      // whoever invoked the transaction when shared
      signer: voter,
    })
    .instruction()

  const blockhash = await connection.getLatestBlockhash()
  console.log('blockhash generated', blockhash)

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction)

  const response = await createPostResponse({
    fields: {
      type: 'transaction',
      transaction: transaction,
    },
  })

  console.log('sending back response')
  return Response.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  })
}
