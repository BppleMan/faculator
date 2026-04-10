use serde::{Deserialize, Serialize};

/// 顶层 `module_categories` 条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleCategory {
    /// 类别名称。
    pub name: String,
}
