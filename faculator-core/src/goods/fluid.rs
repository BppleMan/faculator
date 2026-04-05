use crate::concept::Color;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Fluid {
    /// 流体内部 ID
    pub name: String,
    pub group: String,
    pub subgroup: String,
    /// 排序键
    pub order: String,
    pub hidden: bool,
    /// 默认温度（°C）
    pub default_temperature: Decimal,
    /// 最高温度（°C）
    pub max_temperature: Decimal,
    /// 热容（J/°C）
    pub heat_capacity: Decimal,
    /// 燃料热值（焦耳），仅燃料流体存在
    pub fuel_value: Option<u64>,
    /// 排放倍率
    pub emissions_multiplier: Option<Decimal>,
    /// 气化温度（°C），超过此温度流体呈气态
    pub gas_temperature: Option<Decimal>,
    pub base_color: Option<Color>,
    pub flow_color: Option<Color>,
}

impl PartialOrd for Fluid {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Fluid {
    fn cmp(&self, other: &Self) -> Ordering {
        self.order.cmp(&other.order).then(self.name.cmp(&other.name))
    }
}
