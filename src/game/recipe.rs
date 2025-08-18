use crate::game::item::Item;
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
    pub inputs: Vec<RecipeIO>,
    // 配方的输出
    pub output: Vec<RecipeIO>,
    // 允许的模块
    pub allowed_modules: Vec<Module>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeIO {
    // 输入或输出的物品
    pub item: Item,
    // 输入或输出的数量
    pub amount: u32,
}
