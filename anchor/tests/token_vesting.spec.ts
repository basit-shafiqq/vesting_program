import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {TokenVesting} from '../target/types/token_vesting'

describe('token_vesting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.TokenVesting as Program<TokenVesting>

  const token_vestingKeypair = Keypair.generate()

  it('Initialize TokenVesting', async () => {
    await program.methods
      .initialize()
      .accounts({
        token_vesting: token_vestingKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([token_vestingKeypair])
      .rpc()

    const currentCount = await program.account.token_vesting.fetch(token_vestingKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment TokenVesting', async () => {
    await program.methods.increment().accounts({ token_vesting: token_vestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.token_vesting.fetch(token_vestingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment TokenVesting Again', async () => {
    await program.methods.increment().accounts({ token_vesting: token_vestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.token_vesting.fetch(token_vestingKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement TokenVesting', async () => {
    await program.methods.decrement().accounts({ token_vesting: token_vestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.token_vesting.fetch(token_vestingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set token_vesting value', async () => {
    await program.methods.set(42).accounts({ token_vesting: token_vestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.token_vesting.fetch(token_vestingKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the token_vesting account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        token_vesting: token_vestingKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.token_vesting.fetchNullable(token_vestingKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
