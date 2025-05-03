import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { Voting } from '../target/types/voting'
import { PublicKey } from '@solana/web3.js'
import { Program } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'

const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey('C2gRbFhJNAeT3AdqBSkcZW9NUMh1vrCE9Y1qPjqQLNRH')

describe('Voting', () => {
  let context
  let provider

  // it uses the local test validator as the provider
  anchor.setProvider(anchor.AnchorProvider.env())
  let votingProgram = anchor.workspace.Voting as Program<Voting>

  beforeAll(async () => {
    // context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])
    // provider = new BankrunProvider(context)
    // votingProgram = new Program<Voting>(IDL, provider)
  })

  it('Initialize Poll', async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1846210739),
        'What is your favorite type of peanut butter?',
      )
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress)
    console.log('poll', poll)

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual('What is your favorite type of peanut butter?')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('initialize candidate', async () => {
    await votingProgram.methods.intializeCandidate('Smooth', new anchor.BN(1)).rpc()

    await votingProgram.methods.intializeCandidate('Crunchy', new anchor.BN(1)).rpc()

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Crunchy')],
      votingAddress,
    )

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress)
    console.log('crunchy candidate', crunchyCandidate)

    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0)
    expect(crunchyCandidate.candidateName).toEqual('Crunchy')

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)
    console.log('smooth candidate', smoothCandidate)
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0)
    expect(smoothCandidate.candidateName).toEqual('Smooth')
  })

  it('Vote', async () => {
    console.log('voted for crunchy')
    await votingProgram.methods.vote('Crunchy', new anchor.BN(1)).rpc()

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Crunchy')],
      votingAddress,
    )

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress)
    console.log('crunchy candidate', crunchyCandidate)

    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(1)

    console.log('voted for Smooth')
    await votingProgram.methods.vote('Smooth', new anchor.BN(1)).rpc()

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)
    console.log('smooth candidate', smoothCandidate)
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1)
  })
})
