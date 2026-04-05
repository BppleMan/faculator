use crate::concept::{Ingredient, MaterialRef, Product, SurfaceCondition};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Recipe {
    pub name: String,
    pub group: String,
    pub subgroup: String,
    /// 排序键
    pub order: String,
    pub hidden: bool,
    /// 配方分类（如 crafting / smelting / chemistry 等）
    pub category: String,
    /// 基础制造时间（秒）
    pub energy: Decimal,
    pub ingredients: Vec<Ingredient>,
    pub products: Vec<Product>,
    /// 主产物引用（用于显示和计算主输出）
    pub main_product: Option<MaterialRef>,
    /// 是否在游戏开始时启用
    pub enabled: bool,
    /// 是否允许分解配方
    pub allow_decomposition: bool,
    pub allow_as_intermediate: bool,
    pub allow_intermediates: bool,
    pub always_show_made_in: bool,
    pub always_show_products: bool,
    pub show_amount_in_title: bool,
    /// 排放倍率
    pub emissions_multiplier: Decimal,
    /// 允许的模块效果类别（speed / productivity / consumption / pollution / quality）
    pub allowed_effects: Option<Vec<String>>,
    /// 允许的模块类别
    pub allowed_module_categories: Option<Vec<String>>,
    /// 最大生产力上限
    pub maximum_productivity: Option<Decimal>,
    pub hide_from_player_crafting: Option<bool>,
    pub surface_conditions: Option<Vec<SurfaceCondition>>,
    /// 除 category 之外的附加配方分类
    pub additional_categories: Option<Vec<String>>,
    /// 解锁后显示的结果提示
    pub unlock_results: Option<Vec<MaterialRef>>,
}

impl PartialOrd for Recipe {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Recipe {
    fn cmp(&self, other: &Self) -> Ordering {
        self.order.cmp(&other.order).then(self.name.cmp(&other.name))
    }
}
