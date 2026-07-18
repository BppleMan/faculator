use quote::quote;
use syn::{Data, DataStruct, DeriveInput, Fields, Result};

pub fn expand(input: DeriveInput) -> Result<proc_macro2::TokenStream> {
    let name = input.ident;

    let Data::Struct(DataStruct { fields, .. }) = input.data else {
        return Err(syn::Error::new_spanned(name, "ID can only be derived for tuple structs"));
    };

    let Fields::Unnamed(fields) = fields else {
        return Err(syn::Error::new_spanned(name, "ID can only be derived for single-field tuple structs"));
    };

    if fields.unnamed.len() != 1 {
        return Err(syn::Error::new_spanned(
            fields,
            "ID can only be derived for single-field tuple structs",
        ));
    }

    let field = &fields.unnamed[0];
    let field_ty = &field.ty;

    if !matches!(field_ty, syn::Type::Path(type_path) if type_path.path.is_ident("String")) {
        return Err(syn::Error::new_spanned(field_ty, "ID requires an inner String field"));
    }

    Ok(quote! {
        impl #name {
            pub fn new(value: impl Into<String>) -> Self {
                Self(value.into())
            }

            pub fn as_str(&self) -> &str {
                self.0.as_str()
            }
        }

        impl ::core::convert::From<String> for #name {
            fn from(value: String) -> Self {
                Self(value)
            }
        }

        impl ::core::convert::From<&str> for #name {
            fn from(value: &str) -> Self {
                Self(value.to_owned())
            }
        }

        impl ::core::convert::AsRef<str> for #name {
            fn as_ref(&self) -> &str {
                self.as_str()
            }
        }

        impl ::core::fmt::Display for #name {
            fn fmt(&self, f: &mut ::core::fmt::Formatter<'_>) -> ::core::fmt::Result {
                f.write_str(self.as_str())
            }
        }
    })
}
