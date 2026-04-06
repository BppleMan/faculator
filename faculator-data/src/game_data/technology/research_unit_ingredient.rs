use serde::{Deserialize, Serialize};

/// `research_unit_ingredients[]` 条目。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ResearchUnitIngredient {
    /// 科技包物品名称。
    ///
    /// 这是面向 `items.name` 的外键候选。
    pub name: String,

    /// 该科技包所需数量。
    pub amount: u64,
}
