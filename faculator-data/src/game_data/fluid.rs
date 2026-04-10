//! `fluids` 集合中的 DTO。
//!
//! `Fluid` 与 `Item` 一起构成产线中的“物料”侧对象，但两者字段差异较大，因此在 source DTO
//! 和 SQL model 中通常仍建议分表。
//!
//! 这里最特殊的字段是 `gas_temperature`：
//!
//! - 导出器会用非常大的数值充当“几乎无上限”的哨兵
//! - 该值可能超出 `Decimal` 可表示范围
//!
//! 因此本字段保留为 `serde_json::Number`，等进入 read/core 层时再做语义规整。
use crate::game_data::concept::Color;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde_json::Number;
use std::cmp::Ordering;

/// 一个流体原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Fluid {
    /// 流体名称。
    ///
    /// 这是流体表的自然主键，也是配方流体输入输出的目标键。
    pub name: String,

    /// 所属展示大分组名称。
    pub group: String,

    /// 所属展示子分组名称。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 默认温度。
    pub default_temperature: Decimal,

    /// 最高温度。
    pub max_temperature: Decimal,

    /// 热容。
    pub heat_capacity: Decimal,

    /// 燃料热值。
    ///
    /// 当该字段存在时，说明该流体可作为燃料参与能源系统。
    pub fuel_value: u64,

    /// 排放倍率。
    pub emissions_multiplier: Decimal,

    /// 气化温度。
    ///
    /// 该字段之所以不是 `Decimal`，是因为导出可能使用极大哨兵值表示“无实际限制”。
    pub gas_temperature: Number,

    /// 基础颜色。
    pub base_color: Color,

    /// 流动颜色。
    pub flow_color: Color,
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
