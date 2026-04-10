//! `recipes` 集合中的 DTO。
//!
//! `Recipe` 是产线模型中最核心的转换对象之一，它把输入物料、输出物料、执行类别和附加限制连起来。
//!
//! 关键关联包括：
//!
//! - `category -> recipe_categories.name`
//! - `ingredients[].name -> items.name / fluids.name`
//! - `products[].name -> items.name / fluids.name`
//! - `main_product.name -> items.name / fluids.name`
//! - `unlock_results[].name -> items.name / fluids.name`
//!
//! 导出器在这里也用了一个小技巧：空的 `ingredients` / `products` 有时会写成 `{}` 而不是 `[]`。
//! source DTO 会显式保留这种双形态。
use crate::game_data::concept::{Ingredient, MaterialRef, Product, SurfaceCondition};
use crate::game_data::serde_helper::ArrayOrEmptyObject;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

/// 一个配方原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[rustfmt::skip]
pub struct Recipe {
    /// 配方名称。
    ///
    /// 这是配方表的自然主键，也是科技解锁等关系的目标键。
    pub name: String,

    /// 所属展示大分组名称。
    pub group: String,

    /// 所属展示子分组名称。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 主配方类别名称。
    ///
    /// 这是面向顶层 `recipe_categories` 的关键外键字段。
    pub category: String,

    /// 基础制造耗时。
    pub energy: Decimal,

    /// 原料列表。
    ///
    /// 导出里空列表可能写成 `{}`；DTO 直接保留这种双形态。
    #[serde(default)]
    pub ingredients: ArrayOrEmptyObject<Ingredient>,

    /// 产物列表。
    ///
    /// 导出里空列表可能写成 `{}`；DTO 直接保留这种双形态。
    #[serde(default)]
    pub products: ArrayOrEmptyObject<Product>,

    /// 主产物引用。
    ///
    /// 当存在时，该字段会回指物料主键。
    pub main_product: Option<MaterialRef>,

    /// 是否默认启用。
    pub enabled: bool,

    /// 是否允许分解。
    pub allow_decomposition: bool,

    /// 是否允许作为中间产物。
    pub allow_as_intermediate: bool,

    /// 是否允许自动中间件推导。
    pub allow_intermediates: bool,

    /// 是否总是显示可由哪些实体制造。
    pub always_show_made_in: bool,

    /// 是否总是显示产物。
    pub always_show_products: bool,

    /// 是否在标题中显示数量。
    pub show_amount_in_title: bool,

    /// 排放倍率。
    pub emissions_multiplier: Decimal,

    /// 允许的模块效果类型列表。
    ///
    /// 这些值与 `items.module_effects` 使用的是同一套效果类型语义。
    #[serde(default)]
    pub allowed_effects: Vec<String>,

    /// 允许的模块类别列表。
    ///
    /// 这些值会引用顶层 `module_categories`。
    pub allowed_module_categories: Option<Vec<String>>,

    /// 最大生产力加成上限。
    pub maximum_productivity: Decimal,

    /// 是否对玩家手搓隐藏。
    pub hide_from_player_crafting: bool,

    /// 地表条件限制。
    pub surface_conditions: Option<Vec<SurfaceCondition>>,

    /// 附加配方类别列表。
    ///
    /// 这些值同样会引用顶层 `recipe_categories`。
    pub additional_categories: Option<Vec<String>>,

    /// 解锁结果列表。
    ///
    /// exporter 当前会把每个结果导出成 `{ type, name }` 对象。
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
