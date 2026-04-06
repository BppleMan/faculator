//! 顶层 `qualities` DTO。
//!
//! 品质原型组成了一条有序链：
//!
//! - `name` 是当前品质键
//! - `next` 指向下一品质
//! - `level` 提供数值顺序
//!
//! 因此这一组数据既是展示维表，也很适合在 SQL 中建成自引用关系。
use crate::game_data::concept::Color;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 一个品质等级原型。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[rustfmt::skip]
pub struct Quality {
    /// 品质名称。
    ///
    /// 这是品质表的自然主键，也会被其他系统引用为品质标识。
    pub name: String,

    /// 所属展示大分组。
    pub group: String,

    /// 所属展示子分组。
    pub subgroup: String,

    /// 品质在 UI 中的排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 品质层级。
    ///
    /// `normal = 0`、`uncommon = 1` 等，适合做排序或范围过滤。
    pub level: u64,

    /// 品质颜色。
    ///
    /// 该值直接映射导出 JSON 的 RGBA 对象，通常服务于 UI 展示。
    pub color: Color,

    /// 下一品质名称。
    ///
    /// 这是面向同表 `qualities.name` 的自引用外键候选。
    pub next: Option<String>,

    /// 升到下一品质的基础概率。
    pub next_probability: Decimal,

    /// 品质对 beacon 能耗的倍率影响。
    pub beacon_power_usage_multiplier: Decimal,

    /// 品质对采矿机资源消耗倍率的影响。
    pub mining_drill_resource_drain_multiplier: Decimal,

    /// 品质对科技包消耗倍率的影响。
    pub science_pack_drain_multiplier: Decimal,
}
