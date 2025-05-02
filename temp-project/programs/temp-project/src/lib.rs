use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("13j2k8g1cTqKjcb9rkkqun16fQXct2uCmryAfvDF3Wum");

// every account in solana has atleast 8 bytes of space
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorites {
    use super::*;

    // this is our actual instruction handler, what people will call
    pub fn set_favorites(
        context: Context<SetFavorites>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        msg!("greetings from {}", context.program_id);

        // who is calling the handler
        let user_public_key = context.accounts.user.key();
        msg!("User {user_public_key}'s fav color is {color}, their favorite number is {number} and their hobbies are {hobbies:?}");
        context.accounts.favorites.set_inner(Favorites {
            number,
            color,
            hobbies,
        });

        Ok(())
    }
}

// defines the structure of a data we want to store inside a solana account
// since we are saving this to a account
#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,

    #[max_len(50)]
    pub color: String,

    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}

// Signer - Solana account that must have signed the transaction and invoked this instruction
// #[account(mut)] person who signed the transaction needs to pay

// the account that will be passed on to the contract
#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    // the favorites accounts they want to write to
    #[account(
        init_if_needed, //make the favorites if it does not already exists
        payer=user,
        space=ANCHOR_DISCRIMINATOR_SIZE  + Favorites::INIT_SPACE,
        seeds=[b"favorites", user.key().as_ref()],  // use the text "" and user own key as seeds for pda
        bump
    )]
    pub favorites: Account<'info, Favorites>,

    pub system_program: Program<'info, System>,
}
