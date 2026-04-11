//! `items` 集合中的 DTO。
//!
//! `Item` 表示背包、物流网络和配方输入输出中的“物品原型”。
//! 它与 `Entity` 不是同一个对象，二者只通过若干关键字段相关联：
//!
//! - `place_result -> entities.name`
//! - `place_as_equipment_result -> equipment.name`
//! - `rocket_launch_products[].name -> items.name / fluids.name`
//! - `fuel_category -> fuel_categories.name`
//! - `category -> module_categories.name`
//!
//! 导出中的一个小技巧是 `flags`：
//!
//! - 正常情况为字符串数组
//! - 空值时导出器有时会给 `{}` 而不是 `[]`
//!
//! source DTO 在这里会显式保留这种双形态。

use crate::game_data::ArrayOrEmptyObject;
use crate::game_data::concept::{ModuleEffect, Product};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 一个物品原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Item {
    /// 物品名称。
    ///
    /// 这是物品表的自然主键，也是绝大多数物品侧外键的目标键。
    pub name: String,

    /// 物品类型。
    ///
    /// 原始 JSON 使用 `type` 键。
    #[serde(rename = "type")]
    pub item_type: String,

    /// 所属展示大分组名称。
    ///
    /// 这是面向 `item_groups.name` 的外键候选。
    pub group: String,

    /// 所属展示子分组名称。
    ///
    /// 这是面向 `item_groups.subgroups[].name` 的外键候选。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 最大堆叠数量。
    pub stack_size: u64,

    /// 重量。
    ///
    /// 该字段用于太空平台相关运载逻辑，因此保留为精确十进制。
    pub weight: Decimal,

    /// 默认导入地点名称。
    ///
    /// 这通常会引用 `space_locations.name`，是物品与太空地点之间的潜在外键。
    pub default_import_location: String,

    /// 燃料热值。
    ///
    /// `0` 表示该物品不是燃料；大于 `0` 时可与 `fuel_category` 联动参与燃料兼容性判断。
    pub fuel_value: u64,

    /// 作为车辆燃料时的加速倍率。
    pub fuel_acceleration_multiplier: Decimal,

    /// 作为车辆燃料时的极速倍率。
    pub fuel_top_speed_multiplier: Decimal,

    /// 作为燃料时的排放倍率。
    pub fuel_emissions_multiplier: u64,

    /// 物品标志位列表。
    ///
    /// 原始 JSON 里该字段可能是字符串数组，也可能是空对象 `{}`；DTO 直接保留这种双形态。
    #[serde(default)]
    pub flags: ArrayOrEmptyObject<String>,

    /// 燃料类别。
    ///
    /// 该字段会引用顶层 `fuel_categories`，是燃料兼容性建模的关键外键之一。
    pub fuel_category: Option<String>,

    /// 模块效果集合。
    ///
    /// 当该字段存在时，表示该物品本身是模块，并定义了可施加的效果倍率。
    pub module_effects: Option<ModuleEffect>,

    /// 模块类别。
    ///
    /// 原始 JSON 使用 `category` 键；当该字段存在时，会引用顶层 `module_categories`。
    pub category: Option<String>,

    /// 模块等级。
    pub tier: Option<u64>,

    /// 放置后生成的实体名称。
    ///
    /// 这是面向 `entities.name` 的关键外键字段，是 `item` 和 `entity` 之间最重要的桥之一。
    pub place_result: Option<String>,

    /// 种植后生成的实体名称。
    ///
    /// 该字段主要用于种子/孢子类物品，会回指 `entities.name`。
    pub plant_result: Option<String>,

    /// 火箭发射后额外获得的产物列表。
    ///
    /// 每个 `Product.name` 都会回指物料主键，是潜在的关联表来源。
    pub rocket_launch_products: Option<Vec<Product>>,

    /// 放置后生成的装备名称。
    ///
    /// 这是面向 `equipment.name` 的关键外键字段。
    pub place_as_equipment_result: Option<String>,

    /// 腐坏后的结果物名称。
    ///
    /// 通常会回指 `items.name`。
    pub spoil_result: Option<String>,

    /// 轨道运输模式。
    ///
    /// exporter 直接保留原始字符串值，例如 `manual` / `automated`。
    pub send_to_orbit_mode: Option<String>,

    /// 燃烧后的结果物名称。
    ///
    /// 通常会回指 `items.name`。
    pub burnt_result: Option<String>,
}
