'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useJournalEntryProgram } from './journal-data-access'
import { JournalCreate, JournalEntryList } from './journal-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function CounterFeature() {
  const { publicKey } = useWallet()
  const { programId } = useJournalEntryProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Journal"
        subtitle={
          'Create a new journal entry by clicking the "Create" button. The state of a journal entry is stored on-chain and can be manipulated by calling the program\'s methods (update, delete).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <JournalCreate />
      </AppHero>
      <JournalEntryList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
