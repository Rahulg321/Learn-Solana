#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

// every account in solana has atleast 8 bytes of space
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

declare_id!("6PuxHxv54RC4iZZVfvf7H5TEJDHhXpbb8RRzwUn2JWxz");

#[program]
pub mod crud {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        let journal_entry_account = &mut ctx.accounts.journal_entry;
        journal_entry_account.owner = *ctx.accounts.owner.key;
        journal_entry_account.title = title;
        journal_entry_account.message = message;

        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        _title: String,
        message: String,
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;

        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct CreateEntry<'info> {
    #[account(
         init,
         seeds=[title.as_bytes(), owner.key().as_ref()],
         bump,
         space = ANCHOR_DISCRIMINATOR_SIZE + JournalEntryState::INIT_SPACE,
         payer = owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteEntry<'info> {
    #[account(
        mut,
        seeds=[title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner, //it will close the account only if the pub key we specify to close is the signer of the instruction
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds=[title.as_bytes(), owner.key().as_ref()],
        bump,
        // how will the space be reallocated when the data inside is changed
        realloc=ANCHOR_DISCRIMINATOR_SIZE + JournalEntryState::INIT_SPACE,
        // who will be paying for the change in space
        realloc::payer=owner,
        realloc::zero = true,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,

    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}
