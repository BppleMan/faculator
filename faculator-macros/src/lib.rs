mod id;
mod string_enum;

use crate::string_enum::StringEnumInput;
use proc_macro::TokenStream;
use syn::parse_macro_input;

#[proc_macro]
pub fn string_enum(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as StringEnumInput);
    string_enum::expand(input).into()
}

#[proc_macro_derive(ID)]
pub fn derive_id(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as syn::DeriveInput);

    match id::expand(input) {
        Ok(tokens) => tokens.into(),
        Err(error) => error.to_compile_error().into(),
    }
}
