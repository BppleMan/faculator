use quote::quote;
use syn::{
    Attribute, Ident, LitStr, Result, Token, Visibility,
    parse::{Parse, ParseStream},
};

pub struct StringEnumInput {
    attrs: Vec<Attribute>,
    vis: Visibility,
    enum_token: Token![enum],
    name: Ident,
    brace_token: syn::token::Brace,
    variants: syn::punctuated::Punctuated<StringEnumVariant, Token![,]>,
}

struct StringEnumVariant {
    attrs: Vec<Attribute>,
    name: Ident,
    value: LitStr,
}

impl Parse for StringEnumInput {
    fn parse(input: ParseStream<'_>) -> Result<Self> {
        let content;

        Ok(Self {
            attrs: input.call(Attribute::parse_outer)?,
            vis: input.parse()?,
            enum_token: input.parse()?,
            name: input.parse()?,
            brace_token: syn::braced!(content in input),
            variants: content.parse_terminated(StringEnumVariant::parse, Token![,])?,
        })
    }
}

impl Parse for StringEnumVariant {
    fn parse(input: ParseStream<'_>) -> Result<Self> {
        Ok(Self {
            attrs: input.call(Attribute::parse_outer)?,
            name: input.parse()?,
            value: {
                input.parse::<Token![=>]>()?;
                input.parse()?
            },
        })
    }
}

pub fn expand(input: StringEnumInput) -> proc_macro2::TokenStream {
    let attrs = input.attrs;
    let vis = input.vis;
    let name = input.name;
    let _enum_token = input.enum_token;
    let _brace_token = input.brace_token;

    let enum_variants: Vec<_> = input
        .variants
        .iter()
        .map(|variant| {
            let attrs = &variant.attrs;
            let name = &variant.name;

            quote! {
                #(#attrs)*
                #name,
            }
        })
        .collect();

    let as_str_arms: Vec<_> = input
        .variants
        .iter()
        .map(|variant| {
            let name = &variant.name;
            let value = &variant.value;

            quote! {
                Self::#name => #value,
            }
        })
        .collect();

    let try_from_arms: Vec<_> = input
        .variants
        .iter()
        .map(|variant| {
            let name = &variant.name;
            let value = &variant.value;

            quote! {
                #value => Ok(Self::#name),
            }
        })
        .collect();

    let mut variants_array_items = proc_macro2::TokenStream::new();
    for (index, variant) in input.variants.iter().enumerate() {
        let value = &variant.value;
        if index > 0 {
            variants_array_items.extend(quote! { , });
        }
        variants_array_items.extend(quote! { #value });
    }

    let variants_array = quote! { &[#variants_array_items] };

    quote! {
        #(#attrs)*
        #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
        #vis enum #name {
            #(#enum_variants)*
        }

        impl #name {
            pub const fn as_str(&self) -> &'static str {
                match self {
                    #(#as_str_arms)*
                }
            }

            pub fn variants() -> &'static [&'static str] {
                #variants_array
            }
        }

        impl ::core::convert::TryFrom<&str> for #name {
            type Error = ::std::string::String;

            fn try_from(value: &str) -> ::core::result::Result<Self, Self::Error> {
                match value {
                    #(#try_from_arms)*
                    _ => Err(::std::format!(
                        "unsupported {} value {:?}; supported values: {}",
                        ::core::stringify!(#name),
                        value,
                        Self::variants().join(", ")
                    )),
                }
            }
        }

        impl ::core::convert::TryFrom<::std::string::String> for #name {
            type Error = ::std::string::String;

            fn try_from(value: ::std::string::String) -> ::core::result::Result<Self, Self::Error> {
                Self::try_from(value.as_str())
            }
        }

        impl ::serde::Serialize for #name {
            fn serialize<S>(&self, serializer: S) -> ::core::result::Result<S::Ok, S::Error>
            where
                S: ::serde::Serializer,
            {
                serializer.serialize_str(self.as_str())
            }
        }

        impl<'de> ::serde::Deserialize<'de> for #name {
            fn deserialize<D>(deserializer: D) -> ::core::result::Result<Self, D::Error>
            where
                D: ::serde::Deserializer<'de>,
            {
                let value = <::std::string::String as ::serde::Deserialize>::deserialize(deserializer)?;
                Self::try_from(value.as_str())
                    .map_err(|_| <D::Error as ::serde::de::Error>::unknown_variant(value.as_str(), Self::variants()))
            }
        }

        impl ::core::fmt::Display for #name {
            fn fmt(&self, f: &mut ::core::fmt::Formatter<'_>) -> ::core::fmt::Result {
                f.write_str(self.as_str())
            }
        }
    }
}
