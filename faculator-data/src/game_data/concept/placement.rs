//! 放置 / 消耗物品栈定义。
//!
//! 该对象目前主要出现在 `entities.items_to_place_this[]` 中，
//! 是从实体反向找到“需要哪些物品才能放出这个实体”的关键关系。
use serde::{Deserialize, Serialize};

/// 一个物品栈需求定义。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ItemStackDefinition {
    /// 物品名称。
    ///
    /// 这是面向 `items.name` 的关键外键。
    pub name: String,

    /// 所需数量。
    pub count: u64,
}
