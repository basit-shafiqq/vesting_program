#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod token_vesting {
    use super::*;

  pub fn close(_ctx: Context<CloseTokenVesting>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.token_vesting.count = ctx.accounts.token_vesting.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.token_vesting.count = ctx.accounts.token_vesting.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeTokenVesting>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.token_vesting.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeTokenVesting<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + TokenVesting::INIT_SPACE,
  payer = payer
  )]
  pub token_vesting: Account<'info, TokenVesting>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTokenVesting<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub token_vesting: Account<'info, TokenVesting>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub token_vesting: Account<'info, TokenVesting>,
}

#[account]
#[derive(InitSpace)]
pub struct TokenVesting {
  count: u8,
}
