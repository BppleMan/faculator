//! `fluids` 集合中的 DTO。
//!
//! `Fluid` 与 `Item` 一起构成产线中的“物料”侧对象，但两者字段差异较大，因此在 source DTO
//! 和 SQL model 中通常仍建议分表。
//!
//! 这里最特殊的字段是 `gas_temperature`：
//!
//! - 导出器会用 `FLT_MAX` 量级的非常大数值充当“几乎无上限”的哨兵
//! - 该值可能超出 `Decimal` 可表示范围
//!
//! 因此 DTO 在这里保留原始数字文本，等进入 read/core 层时再判断普通值还是哨兵值。
use crate::game_data::{ExportedNumber, concept::Color};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

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
    /// 当值无法转成 `Decimal` 时，通常意味着 exporter 导出了 `FLT_MAX` 哨兵。
    pub gas_temperature: ExportedNumber,

    /// 基础颜色。
    pub base_color: Color,

    /// 流动颜色。
    pub flow_color: Color,
}
