mod capability;
mod item_flag;
mod item_type;

pub use capability::*;
pub use item_flag::*;
pub use item_type::*;

use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 物品聚合根。
///
/// 该模型面向应用核心领域（DDD），不再以导出 JSON 的平铺结构为中心。
/// 特殊能力统一收敛到 `capability`，以避免“一个大结构携带所有可选字段”的 DTO 式设计。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Item {
    /// 物品名称。
    ///
    /// 这是物品表的自然主键，也是绝大多数物品侧外键的目标键。
    pub name: String,

    /// 物品类型。
    ///
    /// 原始 JSON 使用 `type` 键；这里映射为更语义化的 `item_type`。
    pub item_type: ItemType,

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

    /// 组合式能力对象。
    ///
    /// 通过可选能力对象表达“这个物品具备哪些行为”，而不是在 `Item` 上平铺所有可能字段。
    #[serde(default)]
    pub capability: ItemCapability,

    /// 物品标志位列表。
    ///
    /// 该字段是 faculator 当前已知的物品标志位集合。
    #[serde(default)]
    pub flag_set: ItemFlagSet,
}

impl Item {
    /// 是否可作为燃料。
    pub fn is_fuel(&self) -> bool {
        self.capability.fuel.is_some()
    }

    /// 是否是模块物品。
    pub fn is_module(&self) -> bool {
        self.capability.module.is_some()
    }

    /// 是否可放置为实体或装备。
    pub fn is_placeable(&self) -> bool {
        self.capability.placement.is_some()
    }
}
