use serde::{Deserialize, Serialize};

/// 顶层 `fuel_categories` 条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct FuelCategory {
    /// 类别名称。
    pub name: String,
}
