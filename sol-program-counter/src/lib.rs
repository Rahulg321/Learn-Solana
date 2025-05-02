use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshDeserialize, BorshSerialize)]
enum CounterInstruction {
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshDeserialize, BorshSerialize)]
struct Counter {
    count: u32,
}

entrypoint!(counter_contract);

pub fn counter_contract(
    program_id: &Pubkey,
    // what accounts are we expecting form the user, what accounts are going to interact with, which leads to paraller processing
    accounts: &[AccountInfo],
    instruction_data: &[u8], // bytes of instruction that the user wants to execute
) -> ProgramResult {
    // this is the current account that we are working with
    let account = next_account_info(&mut accounts.iter())?;
    let instruction_type = CounterInstruction::try_from_slice(instruction_data)?;

    // this is the data from the counter data account or the variable from that account we are trying to change
    let mut counter_data = Counter::try_from_slice(&account.data.borrow())?;

    // this is the instruction that the user sends which we deseralize
    match instruction_type {
        CounterInstruction::Increment(val) => {
            msg!("Executing Increase");
            counter_data.count += val
        }
        CounterInstruction::Decrement(val) => {
            msg!("Executing Decrease");
            counter_data.count -= val
        }
    }

    // write back the updated data back to the blockchain
    counter_data.serialize(&mut *account.data.borrow_mut());

    msg!("Counter updated to {}", counter_data.count);
    Ok(())
}
