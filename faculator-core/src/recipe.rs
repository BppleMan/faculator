use crate::game::item::{Item, Named};
use crate::game::machine::Machine;
use crate::game::module::Module;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recipe {
    // 配方名称
    pub name: String,
    // 配方对应的机器
    pub machine: Machine,
    // 制造时间
    pub time: f64,
    // 配方的输入
    pub inputs: Vec<RecipeItem>,
    // 配方的输出
    pub output: Vec<RecipeItem>,
    // 允许的模块
    pub allowed_modules: Vec<Module>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeItem {
    // 输入或输出的物品
    pub item: Item,
    // 输入或输出的数量
    pub amount: u32,
}

impl Named for Recipe {
    fn name(&self) -> &str {
        &self.name
    }
}

impl Named for RecipeItem {
    fn name(&self) -> &str {
        self.item.name()
    }
}
