use serde::{Deserialize, Serialize};

/// `research_unit_ingredients[]` 条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ResearchUnitIngredient {
    /// 物料类型。
    ///
    /// exporter 当前会尝试导出该键；在现有样本里通常缺失，因此保留为可选。
    pub r#type: Option<String>,

    /// 科技包物品名称。
    ///
    /// 这是面向 `items.name` 的外键候选。
    pub name: String,

    /// 该科技包所需数量。
    pub amount: u64,
}
