// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TokenVestingIDL from '../target/idl/token_vesting.json'
import type { TokenVesting } from '../target/types/token_vesting'

// Re-export the generated IDL and type
export { TokenVesting, TokenVestingIDL }

// The programId is imported from the program IDL.
export const TOKEN_VESTING_PROGRAM_ID = new PublicKey(TokenVestingIDL.address)

// This is a helper function to get the TokenVesting Anchor program.
export function getTokenVestingProgram(provider: AnchorProvider) {
  return new Program(TokenVestingIDL as TokenVesting, provider)
}

// This is a helper function to get the program ID for the TokenVesting program depending on the cluster.
export function getTokenVestingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the TokenVesting program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return TOKEN_VESTING_PROGRAM_ID
  }
}
