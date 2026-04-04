use crate::game::item::Item;
use crate::game::machine::Machine;
use crate::game::module::Module;
use crate::game::recipe::Recipe;
use serde::{Deserialize, Serialize};

pub mod item;
pub mod machine;
pub mod module;
pub mod recipe;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub items: Vec<Item>,
    pub machines: Vec<Machine>,
    pub modules: Vec<Module>,
    pub recipes: Vec<Recipe>,
}
