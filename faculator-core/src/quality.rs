use crate::concept::Color;
use faculator_macros::ID;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct QualityId(String);

/// 一个品质等级原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Quality {
    pub name: QualityId,
    pub order: String,
    pub hidden: bool,
    pub level: u64,
    pub color: Color,
    pub next: Option<QualityId>,
    pub next_probability: Decimal,
    pub beacon_power_usage_multiplier: Decimal,
    pub mining_drill_resource_drain_multiplier: Decimal,
    pub science_pack_drain_multiplier: Decimal,
}
