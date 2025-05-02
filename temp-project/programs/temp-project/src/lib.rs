use anchor_lang::prelude::*;

declare_id!("4yNVFniPwZo1akFZZPm1SHtTiVGjGsypGL4GHD8Ep2j6");

#[program]
pub mod temp_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        println!("hello world");
        let x = 12;

        Ok(())
    }
}

#[program]
mod program_module_name {
    use super::*;

    pub fn instruction_one(ctx: Context<InstructionAccounts>, instruction_data: u64) -> Result<()> {
        println!("instruction data", instruction_data);
        println!("the accounts passed {}", ctx.accounts);
        ctx.accounts.account_name.data = instruction_data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(
        init,
        payer = user,
        space = DISCRIMINATOR + AccountStruct::INIT_SPACE
    )]
    pub account_name: Account<'info, AccountStruct>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize {}
