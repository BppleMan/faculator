use serde::{Deserialize, Serialize};

/// 顶层 `resource_categories` 条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ResourceCategory {
    /// 类别名称。
    pub name: String,
}
