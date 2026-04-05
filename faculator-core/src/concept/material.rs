use crate::string_enum;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

string_enum! {
    /// 物料类型。Factorio 在 Ingredient / Product 中统一使用 item / fluid 区分。
    pub enum MaterialType {
        Item => "item",
        Fluid => "fluid"
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Ingredient {
    #[serde(rename = "type")]
    pub material_type: MaterialType,
    pub name: String,
    pub amount: Decimal,
    pub minimum_temperature: Option<Decimal>,
    pub maximum_temperature: Option<Decimal>,
    pub catalyst_amount: Option<Decimal>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Product {
    #[serde(rename = "type")]
    pub material_type: MaterialType,
    pub name: String,
    pub amount: Option<Decimal>,
    pub amount_min: Option<Decimal>,
    pub amount_max: Option<Decimal>,
    pub probability: Option<Decimal>,
    pub temperature: Option<Decimal>,
    pub catalyst_amount: Option<Decimal>,
    pub percent_spoiled: Option<Decimal>,
    pub ignored_by_stats: Option<Decimal>,
    pub ignored_by_productivity: Option<Decimal>,
}

/// 物料引用——仅含类型与名称，不含数量。用于主产物（main_product）和解锁结果（unlock_results）。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MaterialRef {
    #[serde(rename = "type")]
    pub material_type: MaterialType,
    pub name: String,
}
