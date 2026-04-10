use crate::concept::Product;
use serde::{Deserialize, Serialize};

/// 转化能力模型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct TransformationCapability {
    /// 火箭发射后额外获得的产物列表。
    pub rocket_launch_products: Option<Vec<Product>>,

    /// 腐坏后的结果物名称。
    pub spoil_result: Option<String>,

    /// 燃烧后的结果物名称。
    pub burnt_result: Option<String>,
}