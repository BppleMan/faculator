use crate::recipe::Recipe;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

#[derive(Debug, Clone, Eq, PartialEq)]
#[derive(Serialize, Deserialize)]
pub struct Item {
    pub name: String,
    pub r#type: String,
}

pub trait Named {
    fn name(&self) -> &str;
}

impl Named for Item {
    fn name(&self) -> &str {
        &self.name
    }
}

impl Item {
    pub fn new(name: impl AsRef<str>) -> Self {
        Item {
            name: name.as_ref().to_string(),
        }
    }
}

impl<T> From<T> for Item
where
    T: AsRef<str>,
{
    fn from(name: T) -> Self {
        Item::new(name)
    }
}

impl FromStr for Item {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Item::new(s))
    }
}
