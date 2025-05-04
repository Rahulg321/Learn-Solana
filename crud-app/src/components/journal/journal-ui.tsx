'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { useJournalEntryProgram, useJournalEntryProgramAccount } from './journal-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function JournalCreate() {
  const { createEntry } = useJournalEntryProgram()

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const { publicKey } = useWallet()

  const isFormValid = title.trim() !== '' && message.trim() !== ''

  const handleSubmit = async () => {
    try {
      if (publicKey && isFormValid) {
        await createEntry.mutateAsync({ title, message, owner: publicKey })
      }
    } catch (error) {
      console.error('An error occurred while creating journal entry:', error)
    }
  }

  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Journal Entry</CardTitle>
        <CardDescription>Enter a title and message for your new entry.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Title
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Message
            </label>
            {/* Consider using Textarea for potentially longer messages */}
            <Input
              id="message"
              type="text"
              value={message}
              placeholder="Enter message"
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full"
            />
            {/* Example using Textarea (requires import):
            <Textarea
              id="message"
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full"
            /> */}
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={createEntry.isPending || !isFormValid}>
            {createEntry.isPending ? 'Creating...' : 'Create Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function JournalEntryList() {
  const { accounts, getProgramAccount } = useJournalEntryProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <JournalEntryCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function JournalEntryCard({ account }: { account: PublicKey }) {
  // Call all hooks unconditionally at the top level
  const { publicKey } = useWallet()
  const { accountQuery, updateEntry, deleteEntry } = useJournalEntryProgramAccount({
    account,
  })
  const [message, setMessage] = useState('')

  // Conditional returns can happen after all hooks are called
  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  if (accountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!accountQuery.data) {
    return <div className="alert alert-error">Account not found, an error occured while fetching the account</div>
  }

  // Now access data and define handlers
  const title = accountQuery.data.title
  const isFormValid = title.trim() !== '' && message.trim() !== ''

  const handleSubmit = () => {
    // publicKey is guaranteed to be non-null here due to the early return
    if (isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle
            onClick={() => {
              accountQuery.refetch()
            }}
            className="cursor-pointer hover:underline" // Added cursor/hover effect for refetch
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 break-all">{account.toString()}</p>
          <p className="mt-2 mb-4">{accountQuery.data.message}</p>
          <div className="flex flex-col space-y-2">
            <Input
              type="text"
              placeholder="Enter new message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={updateEntry.isPending || !isFormValid} className="cursor-pointer">
              {updateEntry.isPending ? 'Updating...' : 'Update Message'}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant={'destructive'}
            onClick={() => {
              if (title) {
                deleteEntry.mutateAsync(title)
              } else {
                // This case should ideally not happen if accountQuery.data is valid
                console.error(`No title to delete for account ${account.toString()}`)
              }
            }}
            disabled={deleteEntry.isPending}
            className="w-full cursor-pointer" // Make delete button full width for consistency
          >
            {deleteEntry.isPending ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
