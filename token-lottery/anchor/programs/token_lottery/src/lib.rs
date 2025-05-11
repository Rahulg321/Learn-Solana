use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface}
};
use switchboard_on_demand::accounts::RandomnessAccountData;


use anchor_spl::metadata::{
    Metadata,
    MetadataAccount,
    CreateMetadataAccountsV3,
    CreateMasterEditionV3,
    SignMetadata,
    SetAndVerifySizedCollectionItem,
    create_master_edition_v3,
    create_metadata_accounts_v3,
    sign_metadata,
    set_and_verify_sized_collection_item,
    mpl_token_metadata::types::{
            CollectionDetails,
            Creator, 
            DataV2,
        },
};



declare_id!("FZjiEWJQBEsDSs7JpWRuiwJXtoyBjqtzNZMKnAAKW1FU");


#[constant]
pub const NAME:&str = "Token Lottery Ticket #";

#[constant]
pub const SYMBOL:&str = "Tlt";


#[constant]
pub const URI:&str = "https://th.bing.com/th/id/OIP.hSUW08s7ukEwchDuC1rVrwHaE2?o=7&cb=iwp1rm=3&rs=1&pid=ImgDetMain";



#[program]
pub mod token_lottery {


    use super::*;

    pub fn initialize_config(ctx: Context<Initialize>, start:u64,end:u64, price:u64 ) -> Result<()> {

        ctx.accounts.token_lottery.bump = ctx.bumps.token_lottery;
        ctx.accounts.token_lottery.start_time = start;
        ctx.accounts.token_lottery.end_time = end;
        ctx.accounts.token_lottery.ticket_price = price;

        // we are dereferencing it because we want a mutable reference to it later
        ctx.accounts.token_lottery.authority = *ctx.accounts.payer.key;


        ctx.accounts.token_lottery.lottery_pot_amount = 0;


        ctx.accounts.token_lottery.randomness_account = Pubkey::default();

        ctx.accounts.token_lottery.winner_chosen = false;

        Ok(())
    } 



    pub fn initialize_lottery(ctx:Context<InitializeLottery>) -> Result<()>{

        let signer_seeds: &[&[&[u8]]]  = &[&[
            b"collection_mint".as_ref(),
            &[ctx.bumps.collection_mint] 
        ]];


        msg!("creating mint account");


        /*
        
        It’s an Anchor‐wrapped cross‐program invocation (CPI) to the SPL Token program’s MintTo instruction. It mints amount = 1 of your NFT mint into the ATA you just created.

         */
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo{
                    mint:ctx.accounts.collection_mint.to_account_info(), 
                    to:ctx.accounts.collection_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info() 
                },
                signer_seeds), 1
        )?;




        msg!("creating metadata account");



        /*
            creates a metadata account for out token mint, containing name and symbol for the token
         */

        create_metadata_accounts_v3(
        CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(), 
        CreateMetadataAccountsV3{
            metadata:ctx.accounts.metadata.to_account_info(), 
            mint:ctx.accounts.collection_mint.to_account_info(),
            mint_authority:ctx.accounts.collection_mint.to_account_info(), 
            payer:ctx.accounts.payer.to_account_info(), 
            update_authority:ctx.accounts.collection_mint.to_account_info(),
            system_program:ctx.accounts.system_program.to_account_info(),
            rent:ctx.accounts.rent.to_account_info(), 

        }, 
        &signer_seeds), 
        DataV2{
           name:NAME.to_string(),  
           symbol:SYMBOL.to_string(),  
           uri:URI.to_string(),  
           seller_fee_basis_points:0,  
           creators:Some(vec![
            Creator{
                address:ctx.accounts.collection_mint.key(), 
                verified:false, 
                share:100, 
            }
           ]),  
           collection:None,
           uses:None,
        }, 
        true,
         true, 
        //  creating the collection parent with an intial size of 0
         Some(CollectionDetails::V1 { size: 0 }))?;

        msg!("Creating Master Edition V3");
        // create the master edition which serves as a proof for on chain NFT
        create_master_edition_v3(
            CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(), 
            CreateMasterEditionV3{
                payer:ctx.accounts.payer.to_account_info(), 
                mint:ctx.accounts.collection_mint.to_account_info(), 
                edition:ctx.accounts.master_edition.to_account_info(), 
                mint_authority:ctx.accounts.collection_mint.to_account_info(), 
                update_authority:ctx.accounts.collection_mint.to_account_info(), 
                metadata:ctx.accounts.metadata.to_account_info(), 
                token_program:ctx.accounts.token_program.to_account_info(), 
                system_program:ctx.accounts.system_program.to_account_info(),
                rent:ctx.accounts.rent.to_account_info()
            }, 
            signer_seeds),
            Some(0))?;


            msg!("verifying collection");
            
            
            sign_metadata(CpiContext::new_with_signer(
                ctx.accounts.token_metadata_program.to_account_info(),
                SignMetadata {
                    creator: ctx.accounts.collection_mint.to_account_info(),
                    metadata: ctx.accounts.metadata.to_account_info(),
                },
                &signer_seeds,
            ))?;
    

        Ok(())
    }


}

#[derive(Accounts)]
pub struct Initialize<'info> {
    
    #[account(mut)]
    pub payer:Signer<'info>,



    // this is the account that will store the lottery information and we are initializing a new onchain data storage account
    #[account(
        init, 
        payer = payer, 
        space = 8 + TokenLottery::INIT_SPACE, 
        seeds = [b"token_lottery".as_ref()], 
        bump
    )] 
    pub token_lottery:Account<'info, TokenLottery>, 

    pub system_program:Program<'info, System>
    
}

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    
    #[account(mut)]
    pub payer:Signer<'info>,
    


    // this is the collection mint for our NFT Collection
    #[account(
        init, 
        payer = payer, 
        mint::decimals = 0,
        mint::authority = collection_mint, 
        mint::freeze_authority = collection_mint,
        seeds=[b"collection_mint".as_ref()], 
        bump
    )]
    pub collection_mint:InterfaceAccount<'info, Mint>, 



    // this is the ATA where our token will be stored
    #[account(
        init, 
        payer = payer, 
        token::mint = collection_mint, 
        token::authority = collection_token_account, 
        seeds=[b"collection_associated_token".as_ref()], 
        bump
    )]
    pub collection_token_account:InterfaceAccount<'info, TokenAccount>, 




    // stores all the metadata information for our NFT
    #[account(
        mut, 
        seeds=[b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref()], 
        bump, 
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK: this account is checked my the metadata smart contract
    pub metadata:UncheckedAccount<'info>,
    
    

    // controls the supply of our NFT collection
    /*
    Serves as on-chain proof that your token is a true non-fungible “original”

Governs supply by encoding a maximum-printable-editions rule

Enables “printing” of limited or unlimited numbered editions

Locks and references metadata, preventing metadata corruption

     */
    #[account(
        mut, 
        seeds=[b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), b"edition"], 
        bump, 
        seeds::program = token_metadata_program.key())]
    ///CHECK: this account is checked my the metadata smart contract
    pub master_edition:UncheckedAccount<'info>,



    pub token_metadata_program:Program<'info, Metadata>,
    pub associate_token_program:Program<'info, AssociatedToken>,
    pub token_program:Interface<'info, TokenInterface>,
    pub system_program:Program<'info, System>, 

    pub rent:Sysvar<'info, Rent>
}


#[account]
#[derive(InitSpace)]
pub struct  TokenLottery{
    pub bump:u8, 
    pub winner:u64, 
    pub winner_chosen:bool, 
    pub start_time:u64, 
    pub end_time:u64, 
    pub lottery_pot_amount:u64, 
    pub total_tickets:u64, 
    pub ticket_price:u64, 
    pub authority:Pubkey, 
    pub randomness_account:Pubkey, 

}