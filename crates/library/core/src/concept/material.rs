use crate::material::{FluidId, ItemId};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 物料侧多态身份。
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(Serialize, Deserialize)]
pub enum MaterialId {
    Item(ItemId),
    Fluid(FluidId),
}

/// 一个只表达“指向某种物料”的引用。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct MaterialRef {
    pub material: MaterialId,
}

/// 一个配方原料条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Ingredient {
    pub material: MaterialId,
    pub amount: Decimal,
    pub minimum_temperature: Option<Decimal>,
    pub maximum_temperature: Option<Decimal>,
    pub catalyst_amount: Option<Decimal>,
}
