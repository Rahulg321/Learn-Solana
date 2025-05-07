use anchor_lang::prelude::*;
use anchor_spl::token_interface::transfer_checked;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked};

pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    amount: &u64,
    // the detail account of the token
    mint: &InterfaceAccount<'info, Mint>,
    // who has the authority to mint these tokens,
    authority: &Signer<'info>,

    // the token program from which the tokens are defined
    token_program: &Interface<'info, TokenInterface>,
) -> Result<()> {
    let transfer_accounts_options = TransferChecked {
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    // the program we are about to call with the arguements
    let cpi_context = CpiContext::new(token_program.to_account_info(), transfer_accounts_options);

    transfer_checked(cpi_context, *amount, mint.decimals)
}
