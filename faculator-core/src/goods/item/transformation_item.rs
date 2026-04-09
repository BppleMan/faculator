use serde::{Deserialize, Serialize};

/// 转化能力模型。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransformationItem {
    /// 火箭发射后额外获得的产物列表。
    ///
    /// 每个 `Product.name` 都会回指物料主键，是潜在的关联表来源。
    pub rocket_launch_products: Option<Vec<Product>>,

    /// 腐坏后的结果物名称。
    ///
    /// 通常会回指 `items.name`。
    pub spoil_result: Option<String>,

    /// 燃烧后的结果物名称。
    ///
    /// 通常会回指 `items.name`。
    pub burnt_result: Option<String>,
}
