#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{ Mint, TokenAccount, TokenInterface },
};

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod token_vesting {
    use super::*;

    pub fn create_vesting_account(
        context: Context<CreateVestingAccount>,
        company_name: String
    ) -> Result<()> {
        let vesting_account = &mut context.accounts.vesting_account;

        vesting_account.owner = *context.accounts.signer.key;
        vesting_account.mint = context.accounts.mint.key();
        vesting_account.treasury_token_account = context.accounts.treasury_token_account.key();
        vesting_account.company_name = company_name;
        vesting_account.treasury_bump = context.bumps.treasury_token_account;
        vesting_account.bump = context.bumps.vesting_account;

        Ok(())
    }

    pub fn create_empoyee_account(
        context: Context<CreateEmployeeAccount>,
        start_time: i64,
        end_time: i64,
        total_amount: u64,
        cliff_time: i64
    ) -> Result<()> {
        *context.accounts.employee_account = EmployeeAccount {
            benificiary: context.accounts.benificiary.key(),
            start_time,
            end_time,
            cliff_time,
            vesting_account: context.accounts.vesting_account.key(),
            total_amount,
            total_withdrawn: 0,
            bump: context.bumps.employee_account,
        };
        Ok(())
    }

    pub fn claim_tokens(context: Context<ClaimTokens>, company_name: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name:String)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        space = 8 + VestingAccount::INIT_SPACE,
        payer = signer,
        seeds = [company_name.as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        token::mint = mint,
        token::authority = treasury_token_account,
        payer = signer,
        seeds = [b"vesting_treasury", company_name.as_bytes()],
        bump
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct CreateEmployeeAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub benificiary: SystemAccount<'info>,

    #[account(has_one = owner)]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(
        init,
        space = 8 + EmployeeAccount::INIT_SPACE,
        payer = owner,
        seeds = [b"employee_vesting", benificiary.key().as_ref(), vesting_account.key().as_ref()],
        bump
    )]
    pub employee_account: Account<'info, EmployeeAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(company_name:String)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub benificiary: Signer<'info>,

    #[account(
    mut,
    seeds = [b"employee_vesting", benificiary.key().as_ref(), vesting_account.key().as_ref()],
    bump = employee_account.bump,
    has_one = benificiary,
    has_one = vesting_account,
  )]
    pub employee_account: Account<'info, EmployeeAccount>,

    #[account(
    mut,
    seeds = [b"vesting_treasury", company_name.as_bytes()],
    bump = vesting_account.bump,
    has_one = treasury_token_account,
    has_one = mint,
  )]
    pub vesting_account: Account<'info, VestingAccount>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = benificiary,
        associated_token::mint = mint,
        associated_token::authority = benificiary,
        associated_token::token_program = token_program
    )]
    pub employee_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct VestingAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub treasury_token_account: Pubkey,

    #[max_len(50)]
    pub company_name: String,
    pub treasury_bump: u8,
    pub bump: u8, //bump for vesting account
}

#[account]
#[derive(InitSpace)]
pub struct EmployeeAccount {
    pub benificiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_time: i64,
    pub vesting_account: Pubkey,
    pub total_amount: u64,
    pub total_withdrawn: u64,
    pub bump: u8,
}
