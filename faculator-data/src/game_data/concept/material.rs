//! 物料相关嵌套 DTO。
//!
//! 这些结构会出现在 `recipes.ingredients`、`recipes.products`、
//! `items.rocket_launch_products` 等位置，是后续构建“配方输入表 / 配方输出表”的直接来源。
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 一个配方原料条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Ingredient {
    /// 物料类型。
    ///
    /// 原始 JSON 使用 `type` 键，DTO 直接保留其字符串值。
    #[serde(rename = "type")]
    pub material_type: String,

    /// 物料名称。
    ///
    /// 这是面向 `items.name` / `fluids.name` 的多态外键。
    pub name: String,

    /// 消耗数量。
    pub amount: Decimal,

    /// 最低温度限制。
    pub minimum_temperature: Option<Decimal>,

    /// 最高温度限制。
    pub maximum_temperature: Option<Decimal>,

    /// 催化剂数量。
    ///
    /// 该值用于表达“参与但不被完全消耗”的物料数量。
    pub catalyst_amount: Option<Decimal>,
}

/// 一个配方或掉落产物条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Product {
    /// 物料类型。
    #[serde(rename = "type")]
    pub material_type: String,

    /// 物料名称。
    ///
    /// 这是面向 `items.name` / `fluids.name` 的多态外键。
    pub name: String,

    /// 固定产出数量。
    pub amount: Option<Decimal>,

    /// 随机产出的最小值。
    pub amount_min: Option<Decimal>,

    /// 随机产出的最大值。
    pub amount_max: Option<Decimal>,

    /// 产出概率。
    pub probability: Option<Decimal>,

    /// 产出温度。
    pub temperature: Option<Decimal>,

    /// 催化剂数量。
    pub catalyst_amount: Option<Decimal>,

    /// 腐坏比例。
    pub percent_spoiled: Option<Decimal>,

    /// 不计入统计的数量。
    pub ignored_by_stats: Option<Decimal>,

    /// 不计入生产力加成的数量。
    pub ignored_by_productivity: Option<Decimal>,
}

/// 物料引用。
///
/// 仅含类型与名称，不含数量。用于主产物和解锁结果等“只需要指向物料”的场景。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct MaterialRef {
    /// 物料类型。
    #[serde(rename = "type")]
    pub material_type: String,

    /// 物料名称。
    ///
    /// 这是面向 `items.name` / `fluids.name` 的多态外键。
    pub name: String,
}
