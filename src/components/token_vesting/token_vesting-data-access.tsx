'use client'

import {getTokenVestingProgram, getTokenVestingProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useTokenVestingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTokenVestingProgramId(cluster.network as Cluster), [cluster])
  const program = getTokenVestingProgram(provider)

  const accounts = useQuery({
    queryKey: ['token_vesting', 'all', { cluster }],
    queryFn: () => program.account.token_vesting.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['token_vesting', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ token_vesting: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useTokenVestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useTokenVestingProgram()

  const accountQuery = useQuery({
    queryKey: ['token_vesting', 'fetch', { cluster, account }],
    queryFn: () => program.account.token_vesting.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['token_vesting', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ token_vesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['token_vesting', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ token_vesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['token_vesting', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ token_vesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['token_vesting', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ token_vesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
