use borsh::{BorshDeserialize, BorshSerialize, to_vec};

mod utils;

#[derive(Debug, BorshDeserialize, BorshSerialize)]
struct User {
    name: String,
    age: u8,
}

fn main() {
    let u1 = User {
        name: String::from("rahul"),
        age: 12,
    };

    let mut bytes: Vec<u8> = Vec::new();

    let convert_bytes_result = to_vec(&u1);

    match convert_bytes_result {
        Ok(val) => {
            println!("successfully converted to {:?}", val);
            bytes = val;
        }
        Err(error) => println!("error converting to bytes {:?}", error),
    }

    let u2 = User::try_from_slice(&bytes).unwrap();

    println!("original value is {:?}", u2);

    let str1 = String::from("some value");

    let answer: &String;

    {
        let str2 = String::from("rampa");
        answer = longest_string(&str1, &str2);
        println!("{}", answer);
    }
}

// the return value will live as long as the lifetime of b
fn longest_string<'a, 'b>(s1: &'a String, s2: &'b String) -> &'b String {
    return s2;
}

// fn longest_string(s1: &String, s2: &String) -> &String {
//     if (s1.len() > s2.len()) {
//         return s1;
//     } else {
//         return s2;
//     }
// }
