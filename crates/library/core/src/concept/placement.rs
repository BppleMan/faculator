use crate::material::ItemId;
use serde::{Deserialize, Serialize};

/// 一个物品栈需求定义。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ItemStackDefinition {
    pub item: ItemId,
    pub count: u64,
}
